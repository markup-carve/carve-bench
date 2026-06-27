<?php

declare(strict_types=1);

// carve-php render benchmark harness.
// Usage: php bench.php <doc-path> <iters>
// Emits one JSON line: { engine, ms_per_op, mb_per_s, iters, bytes }.
// The carve-php autoloader is resolved from CARVE_PHP_AUTOLOAD; defaults to a
// local Composer install (vendor/autoload.php).

$docPath = $argv[1] ?? null;
$iters = (int)($argv[2] ?? 200);
$autoload = getenv('CARVE_PHP_AUTOLOAD') ?: __DIR__ . '/vendor/autoload.php';

// Warn on stderr when the environment makes results untrustworthy.
// (Coverage/debug extensions override zend_execute_ex, disabling JIT and ~2x inflating timings.)
if (extension_loaded('xdebug') || extension_loaded('pcov')) {
    fwrite(STDERR, "[carve-bench] WARNING: coverage/debug extension loaded (xdebug/pcov) - it disables JIT and inflates timings; results are not representative.\n");
}
$jit = function_exists('opcache_get_status') && (@opcache_get_status(false)['jit']['enabled'] ?? false) === true;
if (!$jit) {
    fwrite(STDERR, "[carve-bench] WARNING: JIT is not active - pass -d opcache.enable_cli=1 -d opcache.jit=tracing for representative results.\n");
}

require $autoload;

use Carve\CarveConverter;

$src = file_get_contents($docPath);
$bytes = strlen($src);

$converter = new CarveConverter();

// Warm up.
for ($i = 0, $w = min(20, $iters); $i < $w; $i++) {
    $converter->convert($src);
}

$start = hrtime(true);
for ($i = 0; $i < $iters; $i++) {
    $converter->convert($src);
}
$elapsedMs = (hrtime(true) - $start) / 1e6;

$msPerOp = $elapsedMs / $iters;
$mbPerS = $bytes / 1024 / 1024 / ($msPerOp / 1000);

echo json_encode([
    'engine' => 'carve-php',
    'ms_per_op' => round($msPerOp, 4),
    'mb_per_s' => round($mbPerS, 2),
    'iters' => $iters,
    'bytes' => $bytes,
    'jit' => $jit,
]) . "\n";
