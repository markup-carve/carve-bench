<?php

declare(strict_types=1);

require $argv[1] . '/vendor/autoload.php';
require __DIR__ . '/verify-source.php';

use MarkupCarve\Carve\Ast\AstCodec;
use MarkupCarve\Carve\CarveConverter;
use MarkupCarve\Carve\Converter\HtmlAstBuilder;
use MarkupCarve\Carve\Converter\HtmlToCarve;

$source = file_get_contents($argv[2]);
$stage = $argv[3];
$count = (int)$argv[4];
$codec = new AstCodec();
if ($stage === 'encode' || $stage === 'decode') {
    $tree = (new HtmlAstBuilder(listTableForBlockCells: true, sourceSafe: true))
        ->buildResult($source, strlen($source))->tree;
    if ($stage === 'encode') {
        $document = $codec->decodeImporterTree($tree);
        $run = static fn () => $codec->encode($document);
    } else {
        $run = static fn () => $codec->decodeImporterTree($tree);
    }
} elseif ($stage === 'build' || $stage === 'build-list-table') {
    $builder = new HtmlAstBuilder(listTableForBlockCells: $stage === 'build-list-table');
    $run = static fn () => $builder->build($source);
} elseif ($stage === 'import') {
    $import = new HtmlToCarve(listTableForBlockCells: true);
    $run = static fn () => $import->convertWithReport($source);
} else {
    $converter = new CarveConverter();
    $run = static fn () => $codec->encode($converter->parse($source));
}
for ($i = 0; $i < 3; $i++) {
    $run();
}
$samples = [];
for ($i = 0; $i < $count; $i++) {
    $start = hrtime(true);
    $output = $run();
    $samples[] = (hrtime(true) - $start) / 1e6;
    unset($output);
}
$output = $run();
if ($stage === 'decode') {
    $output = $codec->encode($output);
}
$loadedSources = verifyLoadedSources($argv[1]);
echo json_encode([
    'loaded_sources' => $loadedSources,
    'samples' => $samples,
    'hash' => hash('sha256', serialize($output)),
    'warmups' => 3,
], JSON_THROW_ON_ERROR), "\n";
