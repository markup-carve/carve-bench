<?php

declare(strict_types=1);

// PHP lane: Carve 0.2, Carve 0.1 on its tree route, and the Markdown and Djot peers, parse and parse plus HTML.
//   php -n ... engines/php/bench.php DOCS_DIR OUT_FILE [ROUNDS] [SAMPLE_MS]

require __DIR__ . '/vendor/autoload.php';

use Djot\DjotConverter;
use League\CommonMark\GithubFlavoredMarkdownConverter;
use League\CommonMark\Parser\MarkdownParser;
use MarkupCarve\Carve\CarveConverter;
use MarkupCarve\Carve\Node\Inline\Text;
use MarkupCarve\Carve\Node\Node;
use MarkupCarve\Carve2\Carve2;

const ELEMENTS = [
    'p' => '/<p[\s>]/', 'li' => '/<li[\s>]/', 'h1-h6' => '/<h[1-6][\s>]/', 'a' => '/<a\s/',
    'td/th' => '/<t[dh][\s>]/', 'code' => '/<code[\s>]/',
];

/**
 * @return array<int, array{id: string, label: string, version: string, lang: string, parse: \Closure, html: \Closure}>
 */
function engines(): array
{
    $carve01 = new CarveConverter();
    $gfm = new GithubFlavoredMarkdownConverter();
    $gfmParser = new MarkdownParser($gfm->getEnvironment());
    $djot = new DjotConverter();
    $installed = static fn (string $name): string => (string)\Composer\InstalledVersions::getPrettyVersion($name);

    return [
        ['id' => 'carve02', 'label' => 'Carve 0.2', 'version' => '0.2 (Carve2, v2/)', 'lang' => 'crv',
            'parse' => static fn (string $s): mixed => Carve2::parse($s),
            'html' => static fn (string $s): string => Carve2::toHtml($s)],
        // 0.1 normal path: parse, then render the tree. convert() would try the borrowed HTML layout first and pass
        // the source to the renderer; render() of a tree alone has no source to borrow from.
        ['id' => 'carve01', 'label' => 'Carve 0.1', 'version' => 'carve-php 0.1 (src/)', 'lang' => 'crv',
            'parse' => static fn (string $s): mixed => $carve01->parse($s),
            'html' => static fn (string $s): string => $carve01->render($carve01->parse($s))],
        ['id' => 'league-gfm', 'label' => 'league/commonmark GFM', 'version' => $installed('league/commonmark'), 'lang' => 'md',
            'parse' => static fn (string $s): mixed => $gfmParser->parse($s),
            'html' => static fn (string $s): string => $gfm->convert($s)->getContent()],
        ['id' => 'php-djot', 'label' => 'php-collective/djot', 'version' => $installed('php-collective/djot'), 'lang' => 'dj',
            'parse' => static fn (string $s): mixed => $djot->parse($s),
            'html' => static fn (string $s): string => $djot->convert($s)],
    ];
}

/**
 * @return array<string, int>
 */
function counts(string $html): array
{
    return array_map(static fn (string $re): int => (int)preg_match_all($re, $html), ELEMENTS);
}

function firstText(Node $node): ?Text
{
    if ($node instanceof Text) {
        return $node;
    }
    foreach ($node->getChildren() as $child) {
        $found = firstText($child);
        if ($found !== null) {
            return $found;
        }
    }

    return null;
}

/**
 * @return array<string, mixed>
 */
function routeProof(): array
{
    $src = "# Title\n\nHello *world*.\n";
    $converter = new CarveConverter();
    $plan = new ReflectionMethod(CarveConverter::class, 'borrowedHtmlPlan');
    $borrowed = $plan->invoke($converter, $src) !== null;
    $tree = $converter->parse($src);
    $before = $converter->render($tree);
    $text = firstText($tree);
    $text?->setContent('TREE-ROUTE');
    $after = $converter->render($tree);

    return [
        'engine' => 'Carve 0.1 (PHP)',
        'input' => $src,
        'fastPathWouldServeInput' => $borrowed,
        'treeRouteHtml' => $before,
        'treeRouteHtmlAfterTreeEdit' => $after,
        'builtFromTree' => str_contains($after, 'TREE-ROUTE') && rtrim($before) === (new CarveConverter())->convert($src),
    ];
}

/**
 * Microseconds per call over a loop of at least $minNs. The untimed collection first keeps one cell's cyclic
 * garbage (league/commonmark trees hold parent links) from being collected inside the next cell's loop.
 */
function sample(Closure $fn, string $src, int $minNs, int &$sink): float
{
    gc_collect_cycles();
    $iterations = 0;
    $start = hrtime(true);
    do {
        $out = $fn($src);
        $sink += is_string($out) ? strlen($out) : 1;
        $iterations++;
        $elapsed = hrtime(true) - $start;
    } while ($elapsed < $minNs);

    return $elapsed / 1000 / $iterations;
}

/**
 * @param array<int, float> $values
 */
function median(array $values): float
{
    sort($values);
    $mid = intdiv(count($values), 2);

    return count($values) % 2 === 1 ? $values[$mid] : ($values[$mid - 1] + $values[$mid]) / 2;
}

function jitState(): string
{
    $status = function_exists('opcache_get_status') ? opcache_get_status(false) : false;
    $on = is_array($status) && ($status['jit']['on'] ?? false);

    return $on ? 'tracing' : 'off';
}

/**
 * @param array<int, array<string, mixed>> $engines
 * @param array<int, string> $names
 *
 * @return array<int, array<string, mixed>>
 */
function measureCells(array $engines, array $names, string $dir, int $rounds, int $minNs, int &$sink): array
{
    $cells = [];
    foreach ($names as $name) {
        foreach ($engines as $engine) {
            $src = (string)file_get_contents("$dir/$name.{$engine['lang']}");
            foreach (['parse', 'html'] as $phase) {
                $cells[] = ['engine' => $engine['id'], 'document' => $name, 'phase' => $phase, 'fn' => $engine[$phase], 'src' => $src, 'samples' => []];
            }
        }
    }
    foreach ($cells as $cell) {
        sample($cell['fn'], $cell['src'], $minNs, $sink);
    }
    $n = count($cells);
    for ($round = 0; $round < $rounds; $round++) {
        $offset = intdiv($round * $n, $rounds);
        for ($i = 0; $i < $n; $i++) {
            $at = ($offset + $i) % $n;
            $cells[$at]['samples'][] = sample($cells[$at]['fn'], $cells[$at]['src'], $minNs, $sink);
        }
    }

    return array_map(static fn (array $c): array => [
        'engine' => $c['engine'], 'document' => $c['document'], 'phase' => $c['phase'], 'bytes' => strlen($c['src']),
        'medianUs' => median($c['samples']), 'minUs' => min($c['samples']), 'samplesUs' => $c['samples'],
    ], $cells);
}

$dir = $argv[1] ?? throw new InvalidArgumentException('DOCS_DIR');
$outFile = $argv[2] ?? throw new InvalidArgumentException('OUT_FILE');
$rounds = (int)($argv[3] ?? 15);
$sampleMs = (int)($argv[4] ?? 200);
if (extension_loaded('pcov') || extension_loaded('xdebug')) {
    throw new RuntimeException('pcov or xdebug is loaded: run with php -n');
}
$names = array_values(array_filter(explode("\n", (string)file_get_contents("$dir/list.txt"))));
$engines = engines();
$verify = array_map(static function (string $name) use ($dir, $engines): array {
    $src = (string)file_get_contents("$dir/$name.crv");

    return ['document' => $name, 'carve01' => counts(($engines[1]['html'])($src)), 'carve02' => counts(($engines[0]['html'])($src))];
}, $names);
$sink = 0;
$cells = measureCells($engines, $names, $dir, $rounds, $sampleMs * 1_000_000, $sink);
$documents = array_map(static fn (string $name): array => ['name' => $name, 'bytes' => [
    'crv' => filesize("$dir/$name.crv"), 'md' => filesize("$dir/$name.md"), 'dj' => filesize("$dir/$name.dj"),
]], $names);
$result = [
    'language' => 'PHP',
    'runtime' => 'PHP ' . PHP_VERSION . ', JIT ' . jitState(),
    'jit' => jitState(),
    'extensions' => get_loaded_extensions(),
    'method' => ['rounds' => $rounds, 'sampleMs' => $sampleMs, 'warmup' => "one loop of at least $sampleMs ms per cell", 'order' => 'rotated per round'],
    'engines' => array_map(static fn (array $e): array => ['id' => $e['id'], 'label' => $e['label'], 'version' => $e['version'], 'lang' => $e['lang']], $engines),
    'documents' => $documents,
    'cells' => $cells,
    'verify' => $verify,
    'route' => routeProof(),
    'sink' => $sink,
];
file_put_contents($outFile, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR) . "\n");
