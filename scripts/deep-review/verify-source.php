<?php

declare(strict_types=1);

$sourceRoot = realpath($argv[1]) . '/src/';
$loadedSources = [];
foreach ([
    MarkupCarve\Carve\Ast\AstCodec::class,
    MarkupCarve\Carve\CarveConverter::class,
    MarkupCarve\Carve\Converter\HtmlAstBuilder::class,
    MarkupCarve\Carve\Extension\CitationsExtension::class,
    MarkupCarve\Carve\Parser\Block\ListParser::class,
] as $class) {
    $file = (new ReflectionClass($class))->getFileName();
    if ($file === false || !str_starts_with(realpath($file), $sourceRoot)) {
        throw new RuntimeException('PHP class loaded outside the measured source: ' . $class);
    }
    $loadedSources[$class] = ['path' => realpath($file), 'sha256' => hash_file('sha256', $file)];
}
