<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
require_once getenv('CARVE_PHP_AUTOLOAD') ?: __DIR__ . '/vendor/autoload.php';

use Djot\DjotConverter;
use MarkupCarve\Carve\CarveConverter;

[$script, $engine, $path, $iterationsArg] = array_pad($argv, 4, null);
$iterations = (int)($iterationsArg ?: 50);
$source = file_get_contents($path);
$converter = match ($engine) {
    'carve-php' => new CarveConverter(),
    'djot-php' => new DjotConverter(),
    default => throw new RuntimeException("unknown engine: {$engine}"),
};
for ($i = 0; $i < 10; $i++) { $converter->convert($source); }
$start = hrtime(true);
for ($i = 0; $i < $iterations; $i++) { $document = $converter->parse($source); }
$parseMs = (hrtime(true) - $start) / 1e6 / $iterations;
$start = hrtime(true);
for ($i = 0; $i < $iterations; $i++) { $converter->render($document); }
$renderMs = (hrtime(true) - $start) / 1e6 / $iterations;
echo json_encode(['engine' => $engine, 'parse_ms' => $parseMs, 'render_ms' => $renderMs, 'total_ms' => $parseMs + $renderMs, 'carve_source' => dirname((new ReflectionClass(CarveConverter::class))->getFileName(), 2)]) . "\n";
