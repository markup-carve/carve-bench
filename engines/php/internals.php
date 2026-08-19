<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
require_once getenv('CARVE_PHP_AUTOLOAD') ?: __DIR__ . '/vendor/autoload.php';

use MarkupCarve\Carve\Node\Node;
use MarkupCarve\Carve\Parser\BlockParser;

final class TimedBlockParser extends BlockParser
{
    /** @var array<string, int> */
    public array $ns = [];

    private function timed(string $name, callable $call): mixed
    {
        $start = hrtime(true);
        try { return $call(); }
        finally { $this->ns[$name] = ($this->ns[$name] ?? 0) + hrtime(true) - $start; }
    }

    protected function splitLines(string $input): array
    {
        return $this->timed('split-lines', fn () => parent::splitLines($input));
    }

    protected function extractReferences(array $lines): void
    {
        $this->timed('references', fn () => parent::extractReferences($lines));
    }

    protected function extractFootnotes(array $lines): void
    {
        $this->timed('footnotes', fn () => parent::extractFootnotes($lines));
    }

    protected function extractAbbreviations(array $lines): void
    {
        $this->timed('abbreviations', fn () => parent::extractAbbreviations($lines));
    }

    protected function extractHeadingReferences(array $lines): void
    {
        $this->timed('heading-references', fn () => parent::extractHeadingReferences($lines));
    }

    protected function parseBlocks(Node $parent, array $lines, int $indent, ?array $lineMap = null, bool $topLevel = false): void
    {
        $this->timed($topLevel ? 'blocks-top-level' : 'blocks-nested-inclusive', fn () => parent::parseBlocks($parent, $lines, $indent, $lineMap, $topLevel));
    }
}

[$script, $path, $iterationsArg] = array_pad($argv, 3, null);
$iterations = (int)($iterationsArg ?: 10);
$source = file_get_contents($path);
$parser = new TimedBlockParser();
for ($i = 0; $i < 5; $i++) { $parser->parse($source); }
$parser->ns = [];
$start = hrtime(true);
for ($i = 0; $i < $iterations; $i++) { $parser->parse($source); }
$total = hrtime(true) - $start;
$result = ['total_ms' => $total / 1e6 / $iterations, 'carve_source' => dirname((new ReflectionClass(BlockParser::class))->getFileName(), 2)];
foreach ($parser->ns as $name => $ns) { $result[$name . '_ms'] = $ns / 1e6 / $iterations; }
echo json_encode($result) . "\n";
