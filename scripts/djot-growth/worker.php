<?php
declare(strict_types=1);
require $argv[1] . '/vendor/autoload.php';
$importer = new MarkupCarve\Carve\Converter\DjotToCarve();
$renderer = new MarkupCarve\Carve\CarveConverter();
$jit = opcache_get_status(false)['jit'] ?? [];
echo json_encode(['ready' => true, 'php' => PHP_VERSION, 'binary' => PHP_BINARY, 'source' => (new ReflectionClass($importer))->getFileName(), 'jit' => $jit['enabled'] ?? false, 'jitOn' => $jit['on'] ?? false]), "\n";
while (($line = fgets(STDIN)) !== false) {
    $request = json_decode($line, true, flags: JSON_THROW_ON_ERROR);
    $source = $request['source'];
    $converted = $importer->convert($source);
    $html = $renderer->convert($converted);
    $operation = $request['operation'];
    $call = $operation === 'import' ? static fn (): string => $importer->convert($source) : static fn (): string => $renderer->convert($converted);
    $start = hrtime(true);
    $runs = 0;
    $value = '';
    if (isset($request['warmupMs'])) {
        do {
            $value = $call();
            $runs++;
        } while (hrtime(true) - $start < $request['warmupMs'] * 1_000_000);
    } else {
        for ($i = 0; $i < $request['iterations']; $i++) {
            $value = $call();
            $runs++;
        }
    }
    $elapsed = hrtime(true) - $start;
    echo json_encode(['runs' => $runs, 'elapsedNs' => $elapsed, 'milliseconds' => $elapsed / $runs / 1_000_000, 'outputBytes' => strlen($value), 'outputSha256' => hash('sha256', $value), 'converted' => $converted, 'html' => $html], JSON_THROW_ON_ERROR), "\n";
}
