<?php

declare(strict_types=1);

require_once __DIR__ . '/carve-src.php';
$loader = require getenv('CARVE_PHP_AUTOLOAD') ?: __DIR__ . '/vendor/autoload.php';
carve_bench_apply_src($loader);

use MarkupCarve\Carve\CarveConverter;
use MarkupCarve\Carve\Extension\AsciiHeadingIdsExtension;
use MarkupCarve\Carve\Extension\AutolinkExtension;
use MarkupCarve\Carve\Extension\CitationsExtension;
use MarkupCarve\Carve\Extension\CodeCalloutsExtension;
use MarkupCarve\Carve\Extension\CodeGroupExtension;
use MarkupCarve\Carve\Extension\ColorSwatchExtension;
use MarkupCarve\Carve\Extension\DetailsExtension;
use MarkupCarve\Carve\Extension\ExternalLinksExtension;
use MarkupCarve\Carve\Extension\GlossaryExtension;
use MarkupCarve\Carve\Extension\HeadingNumbersExtension;
use MarkupCarve\Carve\Extension\HeadingPermalinksExtension;
use MarkupCarve\Carve\Extension\IndexExtension;
use MarkupCarve\Carve\Extension\ListTableExtension;
use MarkupCarve\Carve\Extension\LowercaseHeadingIdsExtension;
use MarkupCarve\Carve\Extension\MathBlockExtension;
use MarkupCarve\Carve\Extension\SemanticSpanExtension;
use MarkupCarve\Carve\Extension\SpoilerExtension;
use MarkupCarve\Carve\Extension\TableOfContentsExtension;
use MarkupCarve\Carve\Extension\TabsExtension;
use MarkupCarve\Carve\Extension\WikilinksExtension;

[$script, $path, $iterationsArg, $roundsArg] = array_pad($argv, 4, null);
$iterations = (int)($iterationsArg ?: 40);
$rounds = (int)($roundsArg ?: 15);
$source = file_get_contents($path);
$tier2 = [
    new AutolinkExtension(), new CitationsExtension(), new CodeCalloutsExtension(),
    new SemanticSpanExtension(), new ListTableExtension(), new DetailsExtension(),
    new SpoilerExtension(), new TabsExtension(),
];
$tier3 = [
    new GlossaryExtension(), new IndexExtension(), new HeadingNumbersExtension(),
    new CodeGroupExtension(), new TableOfContentsExtension(),
    new HeadingPermalinksExtension(), new ExternalLinksExtension(),
    new WikilinksExtension(), new ColorSwatchExtension(),
    new LowercaseHeadingIdsExtension(), new AsciiHeadingIdsExtension(),
    new MathBlockExtension(),
];

$converters = [
    'tier1' => new CarveConverter(),
    'tier2' => (new CarveConverter())->addExtensions($tier2),
    'tier3' => (new CarveConverter())->addExtensions([...$tier2, ...$tier3]),
];
$hashes = [];
foreach ($converters as $profile => $converter) {
    $hashes[$profile] = hash('sha256', $converter->convert($source));
    for ($i = 0; $i < 20; $i++) { $converter->convert($source); }
}
$samples = array_fill_keys(array_keys($converters), []);
$profiles = array_keys($converters);
for ($round = 0; $round < $rounds; $round++) {
    $order = array_merge(array_slice($profiles, $round % 3), array_slice($profiles, 0, $round % 3));
    if ($round % 2 !== 0) { $order = array_reverse($order); }
    foreach ($order as $profile) {
        $start = hrtime(true);
        for ($i = 0; $i < $iterations; $i++) { $converters[$profile]->convert($source); }
        $samples[$profile][] = (hrtime(true) - $start) / 1e6 / $iterations;
    }
}
$bytes = strlen($source);
$results = [];
foreach ($samples as $profile => $values) {
    $sorted = $values;
    sort($sorted, SORT_NUMERIC);
    $median = $sorted[intdiv(count($sorted), 2)];
    $results[] = [
        'profile' => $profile,
        'bytes' => $bytes,
        'iterations' => $iterations,
        'rounds' => $rounds,
        'samples' => $values,
        'ms_per_op' => $median,
        'mb_per_s' => $bytes / 1048576 / ($median / 1000),
        'jit' => (@opcache_get_status(false)['jit']['on'] ?? false) === true,
        'tier2_extensions' => count($profile === 'tier1' ? [] : $tier2),
        'tier3_extensions' => count($profile === 'tier3' ? $tier3 : []),
        'carve_source' => carve_bench_describe_src(CarveConverter::class),
        'html_sha256' => $hashes[$profile],
    ];
}
echo json_encode($results) . "\n";
