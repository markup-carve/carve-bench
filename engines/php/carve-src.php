<?php

declare(strict_types=1);

// Optional carve-php source override for the three PHP harnesses.
//
// CARVE_PHP_AUTOLOAD selects a Composer autoloader, but when the benchmark's own
// vendor/ already ships markup-carve/carve-php, Composer's loader is prepended and
// keeps winning class resolution - so a checkout silently never runs. CARVE_PHP_SRC
// points straight at a checkout's src/ directory and rewrites the PSR-4 prefix on
// the returned loader, so even a bare git worktree with no vendor/ of its own is
// what gets measured:
//
//   CARVE_PHP_SRC=../carve-php/src node run.mjs
//
// Every harness reports the resolved directory as `carve_source`; check it before
// accepting a number.
function carve_bench_apply_src(object $loader): void
{
    $src = getenv('CARVE_PHP_SRC');
    if ($src === false || $src === '') {
        return;
    }
    if (!method_exists($loader, 'setPsr4')) {
        fwrite(STDERR, "[carve-bench] WARNING: CARVE_PHP_SRC set but the autoloader cannot be repointed.\n");

        return;
    }
    $loader->setPsr4('MarkupCarve\\Carve\\', [rtrim($src, '/')]);
}
