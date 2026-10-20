<?php

declare(strict_types=1);

require $argv[1] . '/vendor/autoload.php';
$source = file_get_contents($argv[2]);
$run = static fn () => (new MarkupCarve\Carve\CarveConverter())->convert($source);
for ($i = 0; $i < (int) $argv[4]; $i++) {
    $run();
}
$samples = [];
$cpuSamples = [];
for ($i = 0; $i < (int) $argv[3]; $i++) {
    $before = getrusage();
    $start = hrtime(true);
    $output = $run();
    $samples[] = (hrtime(true) - $start) / 1e6;
    $after = getrusage();
    $cpuSamples[] = (($after['ru_utime.tv_sec'] - $before['ru_utime.tv_sec']) * 1000000
        + $after['ru_utime.tv_usec'] - $before['ru_utime.tv_usec']
        + ($after['ru_stime.tv_sec'] - $before['ru_stime.tv_sec']) * 1000000
        + $after['ru_stime.tv_usec'] - $before['ru_stime.tv_usec']) / 1000;
}
echo json_encode(['samples_ms' => $samples, 'cpu_samples_ms' => $cpuSamples,
    'hash' => hash('sha256', serialize($output))], JSON_THROW_ON_ERROR), "\n";
