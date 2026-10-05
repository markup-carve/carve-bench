<?php

$root = dirname(__DIR__);
$loader = require $root . '/engines/php/vendor/autoload.php';
require $root . '/engines/php/carve-src.php';
carve_bench_apply_src($loader);
$html = (new \MarkupCarve\Carve\CarveConverter())->convert(file_get_contents($argv[1]));
echo json_encode(['source_file' => (new ReflectionClass(\MarkupCarve\Carve\CarveConverter::class))->getFileName(), 'output_bytes' => strlen($html), 'output_sha256' => hash('sha256', $html)], JSON_THROW_ON_ERROR);
