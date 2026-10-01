<?php

declare(strict_types=1);

require $argv[1] . '/vendor/autoload.php';
$source = file_get_contents($argv[2]);
$run = in_array($argv[5], ['html_table', 'html_definition_list'], true)
    ? static fn () => (new MarkupCarve\Carve\Converter\HtmlToCarve(listTableForBlockCells: true))->convertWithReport($source)
    : static fn () => (new MarkupCarve\Carve\CarveConverter())->convert($source);
for ($i = 0; $i < (int)$argv[4]; $i++) {
    $run();
}
$samples = [];
for ($i = 0; $i < (int)$argv[3]; $i++) {
    $start = hrtime(true);
    $output = $run();
    $samples[] = (hrtime(true) - $start) / 1e6;
}
echo json_encode(['samples_ms' => $samples, 'hash' => hash('sha256', serialize($output))], JSON_THROW_ON_ERROR), "\n";
