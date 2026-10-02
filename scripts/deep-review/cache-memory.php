<?php

declare(strict_types=1);

require $argv[1] . '/vendor/autoload.php';

use MarkupCarve\Carve\Parser\Block\ListParser;

$count = (int)$argv[2];
$parser = new ListParser();
$parser->parseListItemMarker('-{#warm} item');
$hash = hash_init('sha256');
$before = memory_get_usage(false);
for ($i = 0; $i < $count; $i++) {
    $id = 'payload-' . $i . '-' . str_repeat('x', 4096);
    $marker = $parser->parseListItemMarker('-{#' . $id . '} item');
    if (($marker['attributes']['id'] ?? null) !== $id) {
        throw new RuntimeException('Marker output differs from input');
    }
    hash_update($hash, json_encode($marker, JSON_THROW_ON_ERROR));
}
unset($id, $marker);
gc_collect_cycles();
echo json_encode([
    'count' => $count,
    'retained_bytes' => memory_get_usage(false) - $before,
    'output_hash' => hash_final($hash),
], JSON_THROW_ON_ERROR), "\n";
