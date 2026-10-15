<?php

declare(strict_types=1);

$cpuTime = static function (): float {
    $usage = getrusage();

    return $usage['ru_utime.tv_sec'] * 1000 + $usage['ru_utime.tv_usec'] / 1000
        + $usage['ru_stime.tv_sec'] * 1000 + $usage['ru_stime.tv_usec'] / 1000;
};
$start = hrtime(true);
$warmups = 0;
do {
    $converter->convert($source);
    $warmups++;
} while ($warmups < 100 || hrtime(true) - $start < 500_000_000);
$wall = [];
$cpu = [];
$hash = null;
for ($trial = 0; $trial < 7; $trial++) {
    $cpuStart = $cpuTime();
    $wallStart = hrtime(true);
    for ($i = 0; $i < 40; $i++) {
        $html = $converter->convert($source);
    }
    $wall[] = (hrtime(true) - $wallStart) / 1e6 / 40;
    $cpu[] = ($cpuTime() - $cpuStart) / 40;
    $trialHash = hash('sha256', $html);
    if ($hash !== null && $hash !== $trialHash) {
        throw new RuntimeException('Output changed between timed batches');
    }
    $hash = $trialHash;
}
$sourceRoot = realpath(getenv('CARVE_PHP_SRC'));
if ($sourceRoot === false) {
    throw new RuntimeException('Requested source directory does not exist');
}
$expected = $sourceRoot . DIRECTORY_SEPARATOR;
foreach (array_merge(get_declared_classes(), get_declared_interfaces(), get_declared_traits()) as $class) {
    if (str_starts_with($class, 'MarkupCarve\\Carve\\')) {
        $file = (new ReflectionClass($class))->getFileName();
        if ($file === false || !str_starts_with(realpath($file), $expected)) {
            throw new RuntimeException('Loaded class is outside the requested source tree: ' . $class);
        }
    }
}
echo json_encode([
    'source_file' => (new ReflectionClass($converter))->getFileName(),
    'output_sha256' => $hash,
    'output_bytes' => strlen($html),
    'wall_ms' => $wall,
    'cpu_ms' => $cpu,
    'warmups' => $warmups,
    'jit_on' => (@opcache_get_status(false)['jit']['on'] ?? false) === true,
    'memory_limit' => ini_get('memory_limit'),
], JSON_THROW_ON_ERROR), "\n";
