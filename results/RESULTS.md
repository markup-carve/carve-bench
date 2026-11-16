# Results

Measured 2026-11-15T22:51:04.961Z to 2026-11-15T23:05:50.391Z on AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics (16 threads), Linux 7.0.0-38-generic. v22.22.2, PHP 8.5.12, rustc 1.97.1 (8bab26f4f 2026-07-14). Harness commit `39fb1470262b11b2053404000a3513ec83edca02`. Engine commits: carve-js `0b4e3be9cb0ea1db6c04d9ba04ba09a8436ded7b`, carve-rs `bfd28e6ca6b9ad3d756cee0b35ba6bf458a161a5`, carve-php `a9679962657af56f1b743ba7a1910e279fb935a5`. Load average at start 2.82, 2.49, 2.92, at end 2.14, 2.7, 3.06.

### Parse plus HTML, normal path

| JavaScript: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 14.9 | 33.3 | 21.4 | 26.6 | 14.8 |
| Carve 0.1 | 0.6 | 8.1 | 2.2 | 2.3 | 1.2 |
| markdown-it (token list) | 7.2 | 17.9 | 12.1 | 14.8 | 8.1 |
| commonmark.js | 16.2 | 46.5 | 36.7 | 36.8 | 11.7 |
| djot.js | 6.1 | 22.6 | 13.3 | 19.2 | 8.3 |

| Rust: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 19.2 | 45.5 | 29.3 | 38.6 | 12.8 |
| Carve 0.1 | 7.9 | 33.6 | 29.0 | 8.9 | 2.4 |
| pulldown-cmark (no tree) | 130.2 | 263.4 | 231.4 | 218.0 | 161.5 |
| comrak | 50.4 | 107.5 | 89.7 | 90.3 | 32.6 |
| jotdown (no tree) | 52.8 | 110.3 | 83.9 | 99.1 | 65.9 |

| PHP, JIT off: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.2 | 7.9 | 5.4 | 7.4 | 2.6 |
| Carve 0.1 | 0.3 | 2.9 | 1.0 | 1.6 | 0.4 |
| league/commonmark GFM | 1.2 | 3.4 | 2.5 | 3.4 | 1.6 |
| php-collective/djot | 2.9 | 6.3 | 4.7 | 6.0 | 3.9 |

| PHP, opcache.jit=tracing: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.2 | 7.9 | 5.3 | 7.2 | 2.5 |
| Carve 0.1 | 0.4 | 3.5 | 1.2 | 1.8 | 0.4 |
| league/commonmark GFM | 1.2 | 3.6 | 2.4 | 3.3 | 1.6 |
| php-collective/djot | 2.9 | 6.0 | 4.3 | 5.7 | 3.9 |

### Parse to tree

| JavaScript: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 14.2 | 31.2 | 21.2 | 26.9 | 14.9 |
| Carve 0.1 | 0.7 | 8.6 | 1.7 | 2.5 | 1.3 |
| markdown-it (token list) | 8.1 | 18.8 | 13.3 | 16.0 | 8.7 |
| commonmark.js | 25.5 | 67.4 | 51.3 | 51.7 | 18.6 |
| djot.js | 7.6 | 25.4 | 14.5 | 21.6 | 9.8 |

| Rust: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 25.7 | 57.8 | 39.7 | 53.3 | 17.4 |
| Carve 0.1 | 8.9 | 41.6 | 38.2 | 11.2 | 3.0 |
| pulldown-cmark (no tree) | 128.7 | 297.1 | 258.4 | 241.3 | 156.1 |
| comrak | 63.4 | 140.1 | 113.1 | 108.0 | 46.6 |
| jotdown (no tree) | 57.4 | 127.9 | 96.1 | 124.4 | 73.3 |

| PHP, JIT off: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.6 | 9.2 | 6.4 | 9.0 | 3.9 |
| Carve 0.1 | 0.3 | 5.3 | 1.5 | 2.0 | 0.6 |
| league/commonmark GFM | 1.5 | 4.1 | 2.9 | 3.8 | 2.2 |
| php-collective/djot | 2.8 | 7.7 | 5.3 | 7.5 | 5.1 |

| PHP, opcache.jit=tracing: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.5 | 9.0 | 6.3 | 8.8 | 3.8 |
| Carve 0.1 | 0.4 | 5.9 | 1.7 | 2.5 | 0.7 |
| league/commonmark GFM | 1.5 | 4.4 | 3.0 | 3.8 | 2.2 |
| php-collective/djot | 4.3 | 8.0 | 5.9 | 7.7 | 5.1 |

### Carve 0.2 against Carve 0.1 (speed ratio of the medians, above 1x means 0.2 is faster)

| Lane | Measure | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|---|--:|--:|--:|--:|--:|
| JavaScript | parse to tree | 21.36x | 3.63x | 12.72x | 10.64x | 11.31x |
| JavaScript | parse plus HTML | 23.50x | 4.10x | 9.71x | 11.37x | 12.48x |
| Rust | parse to tree | 2.88x | 1.39x | 1.04x | 4.76x | 5.84x |
| Rust | parse plus HTML | 2.42x | 1.36x | 1.01x | 4.34x | 5.35x |
| PHP, JIT off | parse to tree | 8.04x | 1.74x | 4.38x | 4.42x | 6.71x |
| PHP, JIT off | parse plus HTML | 7.15x | 2.75x | 5.18x | 4.66x | 7.30x |
| PHP, opcache.jit=tracing | parse to tree | 6.33x | 1.52x | 3.65x | 3.56x | 5.54x |
| PHP, opcache.jit=tracing | parse plus HTML | 6.03x | 2.24x | 4.27x | 4.11x | 6.72x |

### Element counts of the 0.1 and the 0.2 HTML of the `.crv` documents

| JavaScript: document | p 0.1 / 0.2 | li 0.1 / 0.2 | h1-h6 0.1 / 0.2 | a 0.1 / 0.2 | td/th 0.1 / 0.2 | code 0.1 / 0.2 | Within 1% |
|---|--:|--:|--:|--:|--:|--:|---|
| commonmark-core | 600 / 450 | 600 / 600 | 151 / 151 | 300 / 300 | 0 / 0 | 300 / 300 | **does not agree** (largest difference 25.0%) |
| prose | 55 / 55 | 0 / 0 | 20 / 20 | 109 / 109 | 0 / 0 | 118 / 118 | agrees (largest difference 0.0%) |
| lists-tables | 34 / 34 | 96 / 96 | 19 / 19 | 59 / 59 | 86 / 86 | 81 / 81 | agrees (largest difference 0.0%) |
| reference-heavy | 53 / 53 | 30 / 30 | 16 / 16 | 154 / 154 | 0 / 0 | 41 / 41 | agrees (largest difference 0.0%) |
| 1mb | 6438 / 5088 | 6294 / 6294 | 1854 / 1854 | 5422 / 5422 | 774 / 774 | 4748 / 4748 | **does not agree** (largest difference 21.0%) |

| Rust: document | p 0.1 / 0.2 | li 0.1 / 0.2 | h1-h6 0.1 / 0.2 | a 0.1 / 0.2 | td/th 0.1 / 0.2 | code 0.1 / 0.2 | Within 1% |
|---|--:|--:|--:|--:|--:|--:|---|
| commonmark-core | 600 / 450 | 600 / 600 | 151 / 151 | 300 / 300 | 0 / 0 | 300 / 300 | **does not agree** (largest difference 25.0%) |
| prose | 55 / 55 | 0 / 0 | 20 / 20 | 109 / 109 | 0 / 0 | 118 / 118 | agrees (largest difference 0.0%) |
| lists-tables | 34 / 34 | 96 / 96 | 19 / 19 | 59 / 59 | 86 / 86 | 81 / 81 | agrees (largest difference 0.0%) |
| reference-heavy | 53 / 53 | 30 / 30 | 16 / 16 | 154 / 154 | 0 / 0 | 41 / 41 | agrees (largest difference 0.0%) |
| 1mb | 6438 / 5088 | 6294 / 6294 | 1854 / 1854 | 5422 / 5422 | 774 / 774 | 4748 / 4748 | **does not agree** (largest difference 21.0%) |

| PHP, JIT off: document | p 0.1 / 0.2 | li 0.1 / 0.2 | h1-h6 0.1 / 0.2 | a 0.1 / 0.2 | td/th 0.1 / 0.2 | code 0.1 / 0.2 | Within 1% |
|---|--:|--:|--:|--:|--:|--:|---|
| commonmark-core | 600 / 450 | 600 / 600 | 151 / 151 | 300 / 300 | 0 / 0 | 300 / 300 | **does not agree** (largest difference 25.0%) |
| prose | 55 / 55 | 0 / 0 | 20 / 20 | 109 / 109 | 0 / 0 | 118 / 118 | agrees (largest difference 0.0%) |
| lists-tables | 34 / 34 | 96 / 96 | 19 / 19 | 59 / 59 | 86 / 86 | 81 / 81 | agrees (largest difference 0.0%) |
| reference-heavy | 53 / 53 | 30 / 30 | 16 / 16 | 154 / 154 | 0 / 0 | 41 / 41 | agrees (largest difference 0.0%) |
| 1mb | 6438 / 5088 | 6294 / 6294 | 1854 / 1854 | 5422 / 5422 | 774 / 774 | 4748 / 4748 | **does not agree** (largest difference 21.0%) |

## Every cell

### JavaScript

Runtime: Node v22.22.2. Load average (1, 5, 15 min) at start 2.82, 2.49, 2.92, at end 4.37, 3.75, 3.37.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 3,510.6 | 3,335.9 | 14.2 | 3,335.9 | 3,223.9 | 14.9 |
| Carve 0.1 | commonmark-core | 49,732 | 74,982.9 | 70,611.2 | 0.7 | 78,380.5 | 67,690.5 | 0.6 |
| markdown-it (token list) | commonmark-core | 50,332 | 6,251.8 | 5,959.6 | 8.1 | 6,959.3 | 6,670.4 | 7.2 |
| commonmark.js | commonmark-core | 50,332 | 1,970.2 | 1,909.7 | 25.5 | 3,104.4 | 2,845.5 | 16.2 |
| djot.js | commonmark-core | 49,732 | 6,571.8 | 6,182.3 | 7.6 | 8,107.3 | 7,207.0 | 6.1 |
| Carve 0.2 | prose | 31,069 | 995.2 | 949.9 | 31.2 | 931.8 | 879.2 | 33.3 |
| Carve 0.1 | prose | 31,069 | 3,612.2 | 3,297.6 | 8.6 | 3,824.4 | 3,649.5 | 8.1 |
| markdown-it (token list) | prose | 31,257 | 1,666.8 | 1,541.3 | 18.8 | 1,745.0 | 1,656.6 | 17.9 |
| commonmark.js | prose | 31,257 | 463.5 | 442.1 | 67.4 | 671.5 | 634.4 | 46.5 |
| djot.js | prose | 31,069 | 1,222.0 | 1,105.4 | 25.4 | 1,376.7 | 1,282.9 | 22.6 |
| Carve 0.2 | lists-tables | 20,332 | 959.3 | 879.4 | 21.2 | 950.3 | 875.6 | 21.4 |
| Carve 0.1 | lists-tables | 20,332 | 12,201.6 | 10,044.2 | 1.7 | 9,228.1 | 7,726.5 | 2.2 |
| markdown-it (token list) | lists-tables | 20,513 | 1,542.7 | 1,436.4 | 13.3 | 1,696.6 | 1,536.1 | 12.1 |
| commonmark.js | lists-tables | 20,513 | 399.9 | 374.4 | 51.3 | 558.3 | 522.4 | 36.7 |
| djot.js | lists-tables | 20,420 | 1,411.1 | 1,293.0 | 14.5 | 1,535.0 | 1,385.8 | 13.3 |
| Carve 0.2 | reference-heavy | 20,617 | 766.5 | 704.3 | 26.9 | 775.2 | 713.3 | 26.6 |
| Carve 0.1 | reference-heavy | 20,617 | 8,156.6 | 6,958.7 | 2.5 | 8,816.6 | 8,206.6 | 2.3 |
| markdown-it (token list) | reference-heavy | 20,737 | 1,299.2 | 1,214.0 | 16.0 | 1,398.7 | 1,311.0 | 14.8 |
| commonmark.js | reference-heavy | 20,737 | 401.4 | 379.3 | 51.7 | 562.9 | 514.0 | 36.8 |
| djot.js | reference-heavy | 20,617 | 953.9 | 859.9 | 21.6 | 1,074.0 | 968.8 | 19.2 |
| Carve 0.2 | 1mb | 1,095,785 | 73,587.1 | 64,348.1 | 14.9 | 74,249.8 | 67,406.9 | 14.8 |
| Carve 0.1 | 1mb | 1,095,785 | 832,537.8 | 789,387.8 | 1.3 | 926,451.9 | 869,505.9 | 1.2 |
| markdown-it (token list) | 1mb | 1,105,586 | 127,510.6 | 120,238.6 | 8.7 | 136,735.7 | 129,371.0 | 8.1 |
| commonmark.js | 1mb | 1,105,586 | 59,414.5 | 57,381.5 | 18.6 | 94,896.9 | 90,553.6 | 11.7 |
| djot.js | 1mb | 1,096,577 | 111,928.0 | 107,901.8 | 9.8 | 131,712.2 | 119,911.7 | 8.3 |
### Rust

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Load average (1, 5, 15 min) at start 4.37, 3.75, 3.37, at end 3.91, 3.8, 3.44.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 1,936.4 | 1,803.1 | 25.7 | 2,583.5 | 2,382.4 | 19.2 |
| Carve 0.1 | commonmark-core | 49,732 | 5,579.4 | 4,963.1 | 8.9 | 6,258.1 | 5,482.8 | 7.9 |
| pulldown-cmark (no tree) | commonmark-core | 50,332 | 391.1 | 379.4 | 128.7 | 386.6 | 377.5 | 130.2 |
| comrak | commonmark-core | 50,332 | 793.9 | 759.2 | 63.4 | 999.5 | 937.7 | 50.4 |
| jotdown (no tree) | commonmark-core | 49,732 | 865.8 | 835.2 | 57.4 | 942.1 | 923.7 | 52.8 |
| Carve 0.2 | prose | 31,069 | 537.8 | 517.3 | 57.8 | 682.2 | 653.8 | 45.5 |
| Carve 0.1 | prose | 31,069 | 746.6 | 714.9 | 41.6 | 924.5 | 865.4 | 33.6 |
| pulldown-cmark (no tree) | prose | 31,257 | 105.2 | 102.8 | 297.1 | 118.7 | 114.7 | 263.4 |
| comrak | prose | 31,257 | 223.2 | 209.6 | 140.1 | 290.9 | 278.1 | 107.5 |
| jotdown (no tree) | prose | 31,069 | 242.9 | 234.1 | 127.9 | 281.7 | 271.4 | 110.3 |
| Carve 0.2 | lists-tables | 20,332 | 511.8 | 479.3 | 39.7 | 693.3 | 638.1 | 29.3 |
| Carve 0.1 | lists-tables | 20,332 | 532.0 | 504.3 | 38.2 | 702.2 | 659.2 | 29.0 |
| pulldown-cmark (no tree) | lists-tables | 20,513 | 79.4 | 76.7 | 258.4 | 88.7 | 85.7 | 231.4 |
| comrak | lists-tables | 20,513 | 181.4 | 174.5 | 113.1 | 228.7 | 222.3 | 89.7 |
| jotdown (no tree) | lists-tables | 20,420 | 212.4 | 208.1 | 96.1 | 243.3 | 237.9 | 83.9 |
| Carve 0.2 | reference-heavy | 20,617 | 386.4 | 372.8 | 53.3 | 534.6 | 513.6 | 38.6 |
| Carve 0.1 | reference-heavy | 20,617 | 1,838.2 | 1,781.0 | 11.2 | 2,321.3 | 2,224.2 | 8.9 |
| pulldown-cmark (no tree) | reference-heavy | 20,737 | 85.9 | 84.2 | 241.3 | 95.1 | 92.8 | 218.0 |
| comrak | reference-heavy | 20,737 | 192.0 | 185.2 | 108.0 | 229.6 | 221.9 | 90.3 |
| jotdown (no tree) | reference-heavy | 20,617 | 165.7 | 163.9 | 124.4 | 208.1 | 201.4 | 99.1 |
| Carve 0.2 | 1mb | 1,095,785 | 62,846.5 | 52,629.9 | 17.4 | 85,379.3 | 69,966.4 | 12.8 |
| Carve 0.1 | 1mb | 1,095,785 | 367,168.1 | 325,897.4 | 3.0 | 457,016.1 | 411,527.2 | 2.4 |
| pulldown-cmark (no tree) | 1mb | 1,105,586 | 7,081.7 | 6,536.0 | 156.1 | 6,847.5 | 6,562.8 | 161.5 |
| comrak | 1mb | 1,105,586 | 23,706.3 | 19,356.9 | 46.6 | 33,871.3 | 26,716.3 | 32.6 |
| jotdown (no tree) | 1mb | 1,096,577 | 14,963.9 | 14,161.4 | 73.3 | 16,632.3 | 15,820.1 | 65.9 |
### PHP, JIT off

Runtime: PHP 8.5.12, JIT off. Load average (1, 5, 15 min) at start 3.91, 3.8, 3.44, at end 2.12, 3.06, 3.24.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 19,418.5 | 16,024.2 | 2.6 | 22,464.8 | 17,197.0 | 2.2 |
| Carve 0.1 | commonmark-core | 49,732 | 156,175.2 | 134,445.0 | 0.3 | 160,734.6 | 154,301.3 | 0.3 |
| league/commonmark GFM | commonmark-core | 50,332 | 33,289.2 | 32,090.6 | 1.5 | 40,707.6 | 37,850.2 | 1.2 |
| php-collective/djot | commonmark-core | 49,732 | 17,488.3 | 14,416.6 | 2.8 | 17,185.6 | 16,159.9 | 2.9 |
| Carve 0.2 | prose | 31,069 | 3,392.5 | 3,174.9 | 9.2 | 3,930.0 | 3,582.7 | 7.9 |
| Carve 0.1 | prose | 31,069 | 5,891.1 | 4,852.3 | 5.3 | 10,816.4 | 8,826.8 | 2.9 |
| league/commonmark GFM | prose | 31,257 | 7,607.0 | 6,911.5 | 4.1 | 9,185.7 | 8,233.8 | 3.4 |
| php-collective/djot | prose | 31,069 | 4,028.0 | 3,578.2 | 7.7 | 4,944.2 | 4,561.3 | 6.3 |
| Carve 0.2 | lists-tables | 20,332 | 3,183.9 | 2,843.8 | 6.4 | 3,760.8 | 3,565.0 | 5.4 |
| Carve 0.1 | lists-tables | 20,332 | 13,951.5 | 13,710.3 | 1.5 | 19,494.2 | 17,834.2 | 1.0 |
| league/commonmark GFM | lists-tables | 20,513 | 7,059.6 | 6,672.3 | 2.9 | 8,269.8 | 7,918.3 | 2.5 |
| php-collective/djot | lists-tables | 20,420 | 3,823.7 | 3,409.3 | 5.3 | 4,351.0 | 4,169.1 | 4.7 |
| Carve 0.2 | reference-heavy | 20,617 | 2,288.6 | 2,212.3 | 9.0 | 2,782.7 | 2,697.6 | 7.4 |
| Carve 0.1 | reference-heavy | 20,617 | 10,105.7 | 9,769.9 | 2.0 | 12,975.6 | 12,333.0 | 1.6 |
| league/commonmark GFM | reference-heavy | 20,737 | 5,511.8 | 5,133.9 | 3.8 | 6,149.0 | 5,836.7 | 3.4 |
| php-collective/djot | reference-heavy | 20,617 | 2,745.2 | 2,444.3 | 7.5 | 3,416.2 | 3,188.1 | 6.0 |
| Carve 0.2 | 1mb | 1,095,785 | 282,902.1 | 274,852.1 | 3.9 | 424,464.5 | 392,804.8 | 2.6 |
| Carve 0.1 | 1mb | 1,095,785 | 1,898,533.7 | 1,833,864.4 | 0.6 | 3,100,626.6 | 2,872,298.8 | 0.4 |
| league/commonmark GFM | 1mb | 1,105,586 | 505,528.2 | 486,809.7 | 2.2 | 677,356.0 | 626,405.6 | 1.6 |
| php-collective/djot | 1mb | 1,096,577 | 214,106.5 | 197,196.9 | 5.1 | 281,680.9 | 266,642.0 | 3.9 |
### PHP, opcache.jit=tracing

Runtime: PHP 8.5.12, JIT tracing. Load average (1, 5, 15 min) at start 2.12, 3.06, 3.24, at end 2.14, 2.7, 3.06.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 19,627.3 | 16,769.1 | 2.5 | 22,565.0 | 16,216.8 | 2.2 |
| Carve 0.1 | commonmark-core | 49,732 | 124,229.0 | 105,277.5 | 0.4 | 136,039.3 | 127,774.3 | 0.4 |
| league/commonmark GFM | commonmark-core | 50,332 | 34,460.7 | 30,635.4 | 1.5 | 42,148.5 | 36,717.0 | 1.2 |
| php-collective/djot | commonmark-core | 49,732 | 11,518.3 | 10,609.5 | 4.3 | 17,171.3 | 15,930.2 | 2.9 |
| Carve 0.2 | prose | 31,069 | 3,440.9 | 3,269.6 | 9.0 | 3,953.9 | 3,768.9 | 7.9 |
| Carve 0.1 | prose | 31,069 | 5,231.3 | 4,285.5 | 5.9 | 8,850.9 | 8,109.7 | 3.5 |
| league/commonmark GFM | prose | 31,257 | 7,049.5 | 6,696.6 | 4.4 | 8,650.4 | 8,084.8 | 3.6 |
| php-collective/djot | prose | 31,069 | 3,898.5 | 3,607.1 | 8.0 | 5,211.9 | 4,457.3 | 6.0 |
| Carve 0.2 | lists-tables | 20,332 | 3,204.1 | 3,032.0 | 6.3 | 3,821.8 | 3,619.4 | 5.3 |
| Carve 0.1 | lists-tables | 20,332 | 11,683.2 | 11,206.9 | 1.7 | 16,328.0 | 15,658.1 | 1.2 |
| league/commonmark GFM | lists-tables | 20,513 | 6,875.1 | 6,527.0 | 3.0 | 8,455.1 | 7,872.1 | 2.4 |
| php-collective/djot | lists-tables | 20,420 | 3,451.1 | 3,150.4 | 5.9 | 4,711.1 | 4,180.6 | 4.3 |
| Carve 0.2 | reference-heavy | 20,617 | 2,345.1 | 2,247.6 | 8.8 | 2,852.6 | 2,760.4 | 7.2 |
| Carve 0.1 | reference-heavy | 20,617 | 8,337.2 | 7,891.4 | 2.5 | 11,736.4 | 10,728.4 | 1.8 |
| league/commonmark GFM | reference-heavy | 20,737 | 5,393.7 | 5,166.7 | 3.8 | 6,332.8 | 5,773.1 | 3.3 |
| php-collective/djot | reference-heavy | 20,617 | 2,690.7 | 2,450.9 | 7.7 | 3,644.8 | 3,412.3 | 5.7 |
| Carve 0.2 | 1mb | 1,095,785 | 291,422.3 | 280,328.1 | 3.8 | 437,761.8 | 412,254.1 | 2.5 |
| Carve 0.1 | 1mb | 1,095,785 | 1,615,625.3 | 1,569,110.9 | 0.7 | 2,940,101.2 | 2,760,632.1 | 0.4 |
| league/commonmark GFM | 1mb | 1,105,586 | 500,160.7 | 474,067.9 | 2.2 | 674,479.5 | 624,765.9 | 1.6 |
| php-collective/djot | 1mb | 1,096,577 | 214,183.8 | 195,966.2 | 5.1 | 282,404.3 | 264,205.8 | 3.9 |

## Engines

- JavaScript: Carve 0.2 0.2 (v2/src, 0.1.17 repo), Carve 0.1 0.1.17, markdown-it (token list) 15.0.0, commonmark.js 0.31.2, djot.js 0.3.2
- Rust: Carve 0.2 0.2 (carve2, v2/), Carve 0.1 carve-lang 0.1.14, pulldown-cmark (no tree) 0.13.4, comrak 0.54.0, jotdown (no tree) 0.10.0
- PHP, JIT off: Carve 0.2 0.2 (Carve2, v2/), Carve 0.1 carve-php 0.1.17+ (src/), league/commonmark GFM 2.10.7, php-collective/djot dev-master
- PHP, opcache.jit=tracing: Carve 0.2 0.2 (Carve2, v2/), Carve 0.1 carve-php 0.1.17+ (src/), league/commonmark GFM 2.10.7, php-collective/djot dev-master
