<?php

declare(strict_types=1);

require $argv[1] . '/vendor/autoload.php';

use MarkupCarve\Carve\Ast\AstCodec;
use MarkupCarve\Carve\Ast\SourceSpan;
use MarkupCarve\Carve\CarveConverter;
use MarkupCarve\Carve\Extension\CitationsExtension;
use MarkupCarve\Carve\Node\Inline\CitationGroup;

$source = file_get_contents($argv[2]);
$stage = $argv[3];
$count = (int)$argv[4];
if ($stage === 'setter') {
    $raw = rtrim($source, "\n");
    $items = array_fill(0, substr_count($raw, ';') + 1, ['key' => 'a', 'suppressAuthor' => false]);
    $group = new CitationGroup($items, $raw);
    $length = mb_strlen($raw, 'UTF-8');
    $span = new SourceSpan(1, 1, 1, $length + 1, 0, $length);
    $run = static fn () => $group->setPos($span);
} else {
    $converter = new CarveConverter();
    $converter->addExtension(new CitationsExtension());
    if ($stage === 'parse+positions') {
        $converter->getParser()->enablePositionTracking();
    }
    $run = static fn () => $converter->parse($source);
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
$output = $stage === 'setter' ? $group->getItems() : (new AstCodec())->encode($run());
echo json_encode(['samples' => $samples, 'hash' => hash('sha256', serialize($output))], JSON_THROW_ON_ERROR), "\n";
