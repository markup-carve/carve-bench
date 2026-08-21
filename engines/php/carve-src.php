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
// Every harness reports the resolved engine as `carve_source`; check it before
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

/**
 * One line naming the carve-php that will actually run.
 *
 * The class is reflected rather than trusting the manifest, because
 * CARVE_PHP_SRC repoints the PSR-4 prefix after the loader is built and a
 * checkout's own composer.json still carries the last released version number.
 * So the reported origin - Composer package versus checkout - is what
 * distinguishes them, not the version.
 */
function carve_bench_describe_src(string $class): string
{
    $file = (new ReflectionClass($class))->getFileName();
    if ($file === false) {
        return 'carve-php (unresolved)';
    }
    $root = dirname($file, 2);
    $installed = 'Composer\\InstalledVersions';
    $vendored = str_contains($root, DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR);

    if ($vendored && class_exists($installed) && $installed::isInstalled('markup-carve/carve-php')) {
        $version = $installed::getPrettyVersion('markup-carve/carve-php') ?? 'unknown';
        $reference = $installed::getReference('markup-carve/carve-php');
        $origin = $reference === null
            ? 'Composer package'
            : 'Composer package, reference ' . substr($reference, 0, 8);

        return sprintf('markup-carve/carve-php %s (%s)', $version, $origin);
    }

    return sprintf('markup-carve/carve-php (local checkout %s%s)', $root, carve_bench_head_of($root));
}

/**
 * Best-effort short revision of a checkout. A missing git, an exported tarball,
 * or a disabled exec() all just leave the revision off rather than failing a run.
 */
function carve_bench_head_of(string $dir): string
{
    if (!function_exists('exec')) {
        return '';
    }
    $output = [];
    $status = 1;
    @exec(sprintf('git -C %s rev-parse --short HEAD 2>/dev/null', escapeshellarg($dir)), $output, $status);
    if ($status !== 0 || $output === []) {
        return '';
    }

    return ' @ ' . trim($output[0]);
}
