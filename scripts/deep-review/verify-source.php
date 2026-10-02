<?php

declare(strict_types=1);

function verifyLoadedSources(string $root): array
{
    $sourceRoot = realpath($root) . '/src/';
    $loadedSources = [];
    $classes = array_unique(array_merge([
        MarkupCarve\Carve\Ast\AstCodec::class,
        MarkupCarve\Carve\CarveConverter::class,
        MarkupCarve\Carve\Converter\HtmlAstBuilder::class,
        MarkupCarve\Carve\Extension\CitationsExtension::class,
        MarkupCarve\Carve\Parser\Block\ListParser::class,
    ], get_declared_classes()));
    foreach ($classes as $class) {
        if (!str_starts_with($class, 'MarkupCarve\\Carve\\')) {
            continue;
        }
        $file = (new ReflectionClass($class))->getFileName();
        if ($file === false || !str_starts_with(realpath($file), $sourceRoot)) {
            throw new RuntimeException('PHP class loaded outside the measured source: ' . $class);
        }
        $loadedSources[$class] = ['path' => realpath($file), 'sha256' => hash_file('sha256', $file)];
    }
    return $loadedSources;
}

$loadedSources = verifyLoadedSources($argv[1]);
