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

[$script, $profile, $path, $iterationsArg, $trialsArg] = array_pad($argv, 5, null);
$iterations = (int)($iterationsArg ?: 20);
$trials = (int)($trialsArg ?: 5);
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

$converter = new CarveConverter();
match ($profile) {
    'tier1' => null,
    'tier2' => $converter->addExtensions($tier2),
    'tier3' => $converter->addExtensions([...$tier2, ...$tier3]),
    default => throw new RuntimeException("unknown profile: {$profile}"),
};

for ($i = 0; $i < 10; $i++) { $converter->convert($source); }
$samples = [];
for ($trial = 0; $trial < $trials; $trial++) {
    $start = hrtime(true);
    for ($i = 0; $i < $iterations; $i++) { $converter->convert($source); }
    $samples[] = (hrtime(true) - $start) / 1e6 / $iterations;
}
$min = min($samples);
$bytes = strlen($source);
echo json_encode([
    'profile' => $profile,
    'bytes' => $bytes,
    'iterations' => $iterations,
    'trials' => $trials,
    'samples' => $samples,
    'ms_per_op' => $min,
    'mb_per_s' => $bytes / 1048576 / ($min / 1000),
    'jit' => (@opcache_get_status(false)['jit']['enabled'] ?? false) === true,
    'tier2_extensions' => count($profile === 'tier1' ? [] : $tier2),
    'tier3_extensions' => count($profile === 'tier3' ? $tier3 : []),
    'carve_source' => carve_bench_describe_src(CarveConverter::class),
]) . "\n";
