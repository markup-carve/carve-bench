<?php

declare(strict_types=1);

$loader = require dirname(__DIR__) . '/engines/php/vendor/autoload.php';
require __DIR__ . '/../engines/php/carve-src.php';
carve_bench_apply_src($loader);
$html = (new \MarkupCarve\Carve\CarveConverter())->convert(file_get_contents($argv[1]));
echo json_encode(['source_file' => (new ReflectionClass(\MarkupCarve\Carve\CarveConverter::class))->getFileName(), 'html' => $html], JSON_THROW_ON_ERROR);
