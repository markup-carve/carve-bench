<?php

declare(strict_types=1);

require_once __DIR__ . '/carve-src.php';
$loader = require __DIR__ . '/vendor/autoload.php';
carve_bench_apply_src($loader);

use Djot\DjotConverter;
use MarkupCarve\Carve\CarveConverter;

[$script, $engine, $path, $iterationsArg, $trialsArg] = array_pad($argv, 5, null);
$iterations = (int) ($iterationsArg ?: 60);
$trials = (int) ($trialsArg ?: 5);
$source = file_get_contents($path);
if ($source === false || $iterations < 1 || $trials < 1) {
    throw new RuntimeException('Invalid benchmark input');
}
$render = match ($engine) {
    'carve-php' => (static function () use ($source) {
        $converter = new CarveConverter();
        return static fn () => $converter->convert($source);
    })(),
    'djot-php' => (static function () use ($source) {
        $converter = new DjotConverter();
        return static fn () => $converter->convert($source);
    })(),
    default => throw new RuntimeException("Unknown engine: {$engine}"),
};
for ($i = 0; $i < 30; $i++) {
    $render();
}
$samples = [];
for ($trial = 0; $trial < $trials; $trial++) {
    $before = getrusage();
    for ($i = 0; $i < $iterations; $i++) {
        $html = $render();
    }
    $after = getrusage();
    $microseconds = ($after['ru_utime.tv_sec'] - $before['ru_utime.tv_sec']
        + $after['ru_stime.tv_sec'] - $before['ru_stime.tv_sec']) * 1000000
        + $after['ru_utime.tv_usec'] - $before['ru_utime.tv_usec']
        + $after['ru_stime.tv_usec'] - $before['ru_stime.tv_usec'];
    $samples[] = $microseconds / 1000 / $iterations;
}
$result = [
    'engine' => $engine,
    'bytes' => strlen($source),
    'source_sha256' => hash('sha256', $source),
    'output_sha256' => hash('sha256', $html),
    'cpu_samples_ms' => $samples,
    'iterations' => $iterations,
    'trials' => $trials,
    'jit' => (@opcache_get_status(false)['jit']['enabled'] ?? false) === true,
];
if ($engine === 'carve-php') {
    $result['carve_source'] = carve_bench_describe_src(CarveConverter::class);
}
echo json_encode($result, JSON_THROW_ON_ERROR) . "\n";
