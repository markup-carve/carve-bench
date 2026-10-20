<?php

require $argv[1] . '/vendor/autoload.php';

$source = file_get_contents($argv[2]);
echo (new MarkupCarve\Carve\Performance\BorrowedHtmlLayout())->render($source) === null ? "ast\n" : "direct\n";
