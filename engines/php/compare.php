<?php

declare(strict_types=1);

require_once __DIR__ . '/carve-src.php';
require_once __DIR__ . '/vendor/autoload.php';
$loader = require getenv('CARVE_PHP_AUTOLOAD') ?: __DIR__ . '/vendor/autoload.php';
carve_bench_apply_src($loader);

use Djot\DjotConverter;
use League\CommonMark\GithubFlavoredMarkdownConverter;
use MarkupCarve\Carve\CarveConverter;

[$script, $engine, $path, $iterationsArg, $trialsArg] = array_pad($argv, 5, null);
$iterations = (int)($iterationsArg ?: 100);
$trials = (int)($trialsArg ?: 5);
$source = file_get_contents($path);
$render = match ($engine) {
    'carve-php' => (function () {
        $converter = new CarveConverter();
        return fn () => $converter->convert($GLOBALS['source']);
    })(),
    'djot-php' => (function () {
        $converter = new DjotConverter();
        return fn () => $converter->convert($GLOBALS['source']);
    })(),
    'league/commonmark-gfm' => (function () {
        $converter = new GithubFlavoredMarkdownConverter();
        return fn () => $converter->convert($GLOBALS['source'])->getContent();
    })(),
    default => throw new RuntimeException("unknown engine: {$engine}"),
};
for ($i = 0; $i < 20; $i++) { $render(); }
$samples = [];
for ($trial = 0; $trial < $trials; $trial++) {
    $start = hrtime(true);
    for ($i = 0; $i < $iterations; $i++) { $render(); }
    $samples[] = (hrtime(true) - $start) / 1e6 / $iterations;
}
$min = min($samples);
$bytes = strlen($source);
$result = [
    'engine' => $engine,
    'bytes' => $bytes,
    'iterations' => $iterations,
    'trials' => $trials,
    'samples' => $samples,
    'ms_per_op' => $min,
    'mb_per_s' => $bytes / 1048576 / ($min / 1000),
    'jit' => (@opcache_get_status(false)['jit']['enabled'] ?? false) === true,
];
// Only the Carve row carries this; on a peer row it would name an engine that
// did not produce the number.
if ($engine === 'carve-php') {
    $result['carve_source'] = carve_bench_describe_src(CarveConverter::class);
}
echo json_encode($result) . "\n";
