<?php
// PHP driver: php drv-php.php <api 0.1|0.2> <vendor/autoload.php> <corpus dir>
// Reads JSON lines {op,file,reps,warm} on stdin and answers {ns:[...]} or {err} per line.
declare(strict_types=1);

[, $api, $autoload, $corpus] = $argv;
$cache = [];
$read = static function (string $f) use (&$cache, $corpus): string {
    if (!isset($cache[$f])) {
        $text = file_get_contents($corpus . '/' . $f);
        if ($text === false) {
            throw new RuntimeException('not found: ' . $f);
        }
        $cache[$f] = $text;
    }

    return $cache[$f];
};

require $autoload;
if ($api === '0.2') {
    $names = ['carve.cite', 'carve.codeGroup', 'carve.details', 'carve.fencedRender.mermaid', 'carve.imgFence.image',
        'carve.imgFence.img', 'carve.mathBlock', 'carve.spoiler', 'carve.spoilerBlock', 'carve.tabs', 'carve.wiki'];
    $withRenderer = array_values(array_filter($names, static fn ($n) => \MarkupCarve\Carve\Extension\Standard::renderer($n, 'interactive') !== null));
    $extOpts = ['extensions' => $names, 'renderers' => array_fill_keys($withRenderer, 'standard')];
    $resolver = static fn (array $req): array => ['text' => $read($req['path']), 'id' => $req['path']];
    $ops = [
        'parse' => static fn (string $s) => \MarkupCarve\Carve\Carve::parse($s),
        'render' => static fn (string $s) => \MarkupCarve\Carve\Carve::render($s),
        'ext' => static fn (string $s) => \MarkupCarve\Carve\Carve::render($s, $extOpts),
        'lint' => static fn (string $s) => \MarkupCarve\Carve\Carve::lint($s),
        'fmt' => static fn (string $s) => \MarkupCarve\Carve\Carve::format($s),
        'fix' => static fn (string $s) => \MarkupCarve\Carve\Cli\Fixer::fix($s, []),
        'import' => static fn (string $s) => \MarkupCarve\Carve\Carve::importHtml($s),
        'include' => static fn (string $s) => \MarkupCarve\Carve\Carve::render($s, ['includes' => ['resolver' => $resolver, 'file' => 'entry.crv']]),
    ];
} elseif ($api === '0.1') {
    $conv = new \MarkupCarve\Carve\CarveConverter();
    $linter = new \MarkupCarve\Carve\Lint\DocumentLinter();
    $ops = [
        'parse' => static fn (string $s) => $conv->parse($s),
        'render' => static fn (string $s) => $conv->convert($s),
        'lint' => static fn (string $s) => $linter->lint($s),
        'fmt' => static fn (string $s) => \MarkupCarve\Carve\CarveConverter::toCarve($s),
        'import' => static fn (string $s) => (new \MarkupCarve\Carve\Converter\HtmlToCarve())->convert($s),
    ];
} else {
    fwrite(STDERR, "unknown api $api\n");
    exit(2);
}

while (($line = fgets(STDIN)) !== false) {
    $req = json_decode($line, true);
    $f = $ops[$req['op']] ?? null;
    if ($f === null) {
        echo json_encode(['err' => 'unsupported']), "\n";
        continue;
    }
    try {
        $s = $read($req['file']);
        for ($i = 0; $i < ($req['warm'] ?? 0); $i++) {
            $f($s);
        }
        $ns = [];
        for ($i = 0; $i < $req['reps']; $i++) {
            $t = hrtime(true);
            $f($s);
            $ns[] = hrtime(true) - $t;
        }
        echo json_encode(['ns' => $ns]), "\n";
    } catch (\Throwable $e) {
        echo json_encode(['err' => substr(get_class($e) . ': ' . $e->getMessage(), 0, 200)]), "\n";
    }
}
