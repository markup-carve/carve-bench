# Results

Measured 2026-11-16T05:19:16.102Z to 2026-11-16T05:34:19.382Z on AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics (16 threads), Linux 7.0.0-38-generic. v22.22.2, PHP 8.5.12, rustc 1.97.1 (8bab26f4f 2026-07-14). Harness commit `24a1ece42a5d1df4d06c5b888cfce546f4b74111`. Engine commits: carve-js `6f5a23b8e7094d3eb88d0b535868edd94650455b`, carve-rs `267507b146eae4a70751f2d9d256976acb8ea8b1`, carve-php `ba3e789b1d02e89da1233e8ba9fbf2cb75d183c8`. Load average at start 1.16, 1.01, 1.05, at end 1.51, 1.55, 1.47.

### Parse plus HTML, normal path

| JavaScript: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 15.8 | 36.2 | 24.5 | 29.6 | 16.7 |
| Carve 0.1 | 0.7 | 8.5 | 2.4 | 2.7 | 1.2 |
| markdown-it (token list) | 7.7 | 18.9 | 13.6 | 16.9 | 8.8 |
| commonmark.js | 17.7 | 51.7 | 40.8 | 41.3 | 12.3 |
| djot.js | 7.2 | 26.3 | 15.2 | 21.9 | 8.8 |

| Rust: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 33.3 | 78.6 | 52.6 | 63.5 | 31.1 |
| Carve 0.1 | 9.5 | 37.9 | 32.8 | 9.6 | 2.9 |
| pulldown-cmark (no tree) | 140.1 | 294.3 | 258.4 | 234.7 | 180.4 |
| comrak | 55.0 | 118.2 | 98.7 | 96.8 | 43.5 |
| comrak + extensions | 49.6 | 103.8 | 79.2 | 85.6 | 31.0 |
| jotdown (no tree) | 55.8 | 118.3 | 89.0 | 105.9 | 70.6 |

| PHP, JIT off: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.8 | 8.6 | 5.9 | 7.8 | 2.7 |
| Carve 0.1 | 0.3 | 3.2 | 1.1 | 1.7 | 0.4 |
| league/commonmark GFM | 1.3 | 3.7 | 2.6 | 3.5 | 1.7 |
| php-collective/djot | 3.0 | 6.8 | 4.7 | 6.7 | 4.1 |

| PHP, opcache.jit=tracing: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.7 | 8.5 | 5.9 | 7.8 | 2.7 |
| Carve 0.1 | 0.4 | 3.8 | 1.3 | 2.0 | 0.4 |
| league/commonmark GFM | 1.3 | 3.7 | 2.5 | 3.5 | 1.7 |
| php-collective/djot | 3.1 | 6.5 | 4.7 | 6.4 | 4.1 |

### Parse to tree

| JavaScript: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 15.3 | 33.5 | 24.2 | 30.2 | 16.9 |
| Carve 0.1 | 0.7 | 9.5 | 2.1 | 3.0 | 1.4 |
| markdown-it (token list) | 8.8 | 20.5 | 15.3 | 17.7 | 9.4 |
| commonmark.js | 27.1 | 72.2 | 56.3 | 56.3 | 19.8 |
| djot.js | 8.4 | 29.0 | 16.7 | 25.3 | 10.6 |

| Rust: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 42.4 | 93.6 | 66.6 | 91.1 | 39.8 |
| Carve 0.2, no resolve | 54.3 | 126.4 | 87.9 | 124.4 | 68.4 |
| Carve 0.1 | 10.3 | 47.9 | 42.8 | 12.1 | 3.6 |
| pulldown-cmark (no tree) | 139.4 | 328.1 | 281.8 | 261.6 | 174.0 |
| comrak | 67.3 | 149.5 | 122.9 | 115.7 | 60.3 |
| comrak + extensions | 62.6 | 134.7 | 103.5 | 108.6 | 43.1 |
| jotdown (no tree) | 60.0 | 137.5 | 101.4 | 129.5 | 79.1 |

| PHP, JIT off: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.9 | 9.6 | 7.0 | 9.4 | 4.1 |
| Carve 0.1 | 0.3 | 5.8 | 1.6 | 2.1 | 0.6 |
| league/commonmark GFM | 1.4 | 4.2 | 3.0 | 3.8 | 2.2 |
| php-collective/djot | 3.0 | 8.2 | 6.1 | 8.1 | 5.4 |

| PHP, opcache.jit=tracing: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.9 | 10.0 | 7.0 | 9.6 | 4.0 |
| Carve 0.1 | 0.4 | 6.9 | 1.8 | 2.8 | 0.7 |
| league/commonmark GFM | 1.5 | 4.3 | 2.9 | 3.9 | 2.2 |
| php-collective/djot | 3.0 | 8.6 | 6.4 | 8.5 | 5.4 |

### Carve 0.2 against Carve 0.1 (speed ratio of the medians, above 1x means 0.2 is faster)

| Lane | Measure | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|---|--:|--:|--:|--:|--:|
| JavaScript | parse to tree | 20.56x | 3.53x | 11.66x | 9.90x | 11.87x |
| JavaScript | parse plus HTML | 22.32x | 4.24x | 10.32x | 11.14x | 13.37x |
| Rust | parse to tree | 4.10x | 1.95x | 1.56x | 7.50x | 11.20x |
| Rust | parse plus HTML | 3.50x | 2.08x | 1.60x | 6.65x | 10.89x |
| PHP, JIT off | parse to tree | 8.39x | 1.65x | 4.46x | 4.53x | 6.61x |
| PHP, JIT off | parse plus HTML | 8.42x | 2.68x | 5.22x | 4.49x | 6.81x |
| PHP, opcache.jit=tracing | parse to tree | 7.07x | 1.46x | 3.89x | 3.48x | 5.52x |
| PHP, opcache.jit=tracing | parse plus HTML | 7.15x | 2.26x | 4.54x | 3.94x | 6.16x |

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

Runtime: Node v22.22.2. Load average (1, 5, 15 min) at start 1.16, 1.01, 1.05, at end 3.32, 2.1, 1.47.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 3,248.0 | 3,128.0 | 15.3 | 3,154.0 | 3,080.5 | 15.8 |
| Carve 0.1 | commonmark-core | 49,732 | 66,792.5 | 58,059.5 | 0.7 | 70,400.0 | 68,046.9 | 0.7 |
| markdown-it (token list) | commonmark-core | 50,332 | 5,729.6 | 5,482.1 | 8.8 | 6,549.4 | 6,021.7 | 7.7 |
| commonmark.js | commonmark-core | 50,332 | 1,860.2 | 1,766.2 | 27.1 | 2,841.2 | 2,703.6 | 17.7 |
| djot.js | commonmark-core | 49,732 | 5,897.1 | 5,510.7 | 8.4 | 6,898.1 | 6,640.1 | 7.2 |
| Carve 0.2 | prose | 31,069 | 927.9 | 879.5 | 33.5 | 858.8 | 822.4 | 36.2 |
| Carve 0.1 | prose | 31,069 | 3,279.0 | 3,085.5 | 9.5 | 3,640.8 | 3,510.1 | 8.5 |
| markdown-it (token list) | prose | 31,257 | 1,528.4 | 1,438.9 | 20.5 | 1,655.5 | 1,552.6 | 18.9 |
| commonmark.js | prose | 31,257 | 432.7 | 419.4 | 72.2 | 604.7 | 594.5 | 51.7 |
| djot.js | prose | 31,069 | 1,072.7 | 1,043.6 | 29.0 | 1,179.1 | 1,151.3 | 26.3 |
| Carve 0.2 | lists-tables | 20,332 | 840.4 | 831.7 | 24.2 | 828.2 | 794.3 | 24.5 |
| Carve 0.1 | lists-tables | 20,332 | 9,795.5 | 8,806.3 | 2.1 | 8,547.3 | 7,196.7 | 2.4 |
| markdown-it (token list) | lists-tables | 20,513 | 1,340.9 | 1,286.9 | 15.3 | 1,504.1 | 1,418.5 | 13.6 |
| commonmark.js | lists-tables | 20,513 | 364.4 | 353.7 | 56.3 | 502.9 | 483.4 | 40.8 |
| djot.js | lists-tables | 20,420 | 1,221.6 | 1,170.7 | 16.7 | 1,347.7 | 1,300.8 | 15.2 |
| Carve 0.2 | reference-heavy | 20,617 | 683.0 | 654.6 | 30.2 | 695.5 | 671.7 | 29.6 |
| Carve 0.1 | reference-heavy | 20,617 | 6,762.7 | 6,468.4 | 3.0 | 7,748.7 | 7,320.2 | 2.7 |
| markdown-it (token list) | reference-heavy | 20,737 | 1,170.8 | 1,143.1 | 17.7 | 1,228.7 | 1,197.9 | 16.9 |
| commonmark.js | reference-heavy | 20,737 | 368.2 | 358.2 | 56.3 | 502.6 | 483.1 | 41.3 |
| djot.js | reference-heavy | 20,617 | 814.3 | 776.7 | 25.3 | 941.7 | 916.1 | 21.9 |
| Carve 0.2 | 1mb | 1,095,785 | 64,918.2 | 62,740.5 | 16.9 | 65,591.2 | 61,462.8 | 16.7 |
| Carve 0.1 | 1mb | 1,095,785 | 770,445.9 | 744,802.3 | 1.4 | 876,840.8 | 843,594.6 | 1.2 |
| markdown-it (token list) | 1mb | 1,105,586 | 117,387.3 | 113,901.3 | 9.4 | 125,101.0 | 123,344.3 | 8.8 |
| commonmark.js | 1mb | 1,105,586 | 55,751.7 | 53,961.1 | 19.8 | 89,748.8 | 86,513.6 | 12.3 |
| djot.js | 1mb | 1,096,577 | 103,696.9 | 95,579.3 | 10.6 | 124,329.6 | 115,090.8 | 8.8 |
### Rust

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Load average (1, 5, 15 min) at start 3.32, 2.1, 1.47, at end 1.39, 1.77, 1.48.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 1,173.3 | 1,140.7 | 42.4 | 1,494.6 | 1,439.4 | 33.3 |
| Carve 0.2, no resolve | commonmark-core | 49,732 | 916.1 | 895.0 | 54.3 | 1,457.1 | 1,441.7 | 34.1 |
| Carve 0.1 | commonmark-core | 49,732 | 4,809.2 | 4,518.2 | 10.3 | 5,224.6 | 5,103.3 | 9.5 |
| pulldown-cmark (no tree) | commonmark-core | 50,332 | 361.0 | 352.1 | 139.4 | 359.2 | 348.5 | 140.1 |
| comrak | commonmark-core | 50,332 | 748.1 | 739.0 | 67.3 | 915.6 | 898.4 | 55.0 |
| comrak + extensions | commonmark-core | 50,332 | 803.6 | 796.5 | 62.6 | 1,014.4 | 999.7 | 49.6 |
| jotdown (no tree) | commonmark-core | 49,732 | 829.2 | 802.6 | 60.0 | 890.8 | 876.8 | 55.8 |
| Carve 0.2 | prose | 31,069 | 331.9 | 320.2 | 93.6 | 395.0 | 385.9 | 78.6 |
| Carve 0.2, no resolve | prose | 31,069 | 245.7 | 240.7 | 126.4 | 398.6 | 391.0 | 77.9 |
| Carve 0.1 | prose | 31,069 | 648.1 | 640.7 | 47.9 | 820.6 | 803.0 | 37.9 |
| pulldown-cmark (no tree) | prose | 31,257 | 95.3 | 93.0 | 328.1 | 106.2 | 104.3 | 294.3 |
| comrak | prose | 31,257 | 209.0 | 198.9 | 149.5 | 264.4 | 250.7 | 118.2 |
| comrak + extensions | prose | 31,257 | 232.1 | 220.9 | 134.7 | 301.2 | 294.9 | 103.8 |
| jotdown (no tree) | prose | 31,069 | 225.9 | 218.5 | 137.5 | 262.5 | 258.0 | 118.3 |
| Carve 0.2 | lists-tables | 20,332 | 305.1 | 297.3 | 66.6 | 386.8 | 380.3 | 52.6 |
| Carve 0.2, no resolve | lists-tables | 20,332 | 231.2 | 226.2 | 87.9 | 383.3 | 371.2 | 53.0 |
| Carve 0.1 | lists-tables | 20,332 | 474.6 | 464.2 | 42.8 | 620.4 | 612.2 | 32.8 |
| pulldown-cmark (no tree) | lists-tables | 20,513 | 72.8 | 70.6 | 281.8 | 79.4 | 77.8 | 258.4 |
| comrak | lists-tables | 20,513 | 166.9 | 163.0 | 122.9 | 207.9 | 205.3 | 98.7 |
| comrak + extensions | lists-tables | 20,513 | 198.2 | 194.7 | 103.5 | 259.2 | 254.6 | 79.2 |
| jotdown (no tree) | lists-tables | 20,420 | 201.3 | 197.5 | 101.4 | 229.4 | 223.1 | 89.0 |
| Carve 0.2 | reference-heavy | 20,617 | 226.4 | 222.3 | 91.1 | 324.5 | 319.6 | 63.5 |
| Carve 0.2, no resolve | reference-heavy | 20,617 | 165.7 | 159.7 | 124.4 | 324.4 | 318.7 | 63.6 |
| Carve 0.1 | reference-heavy | 20,617 | 1,697.0 | 1,660.3 | 12.1 | 2,158.0 | 2,094.1 | 9.6 |
| pulldown-cmark (no tree) | reference-heavy | 20,737 | 79.3 | 78.4 | 261.6 | 88.3 | 86.5 | 234.7 |
| comrak | reference-heavy | 20,737 | 179.3 | 176.4 | 115.7 | 214.2 | 208.0 | 96.8 |
| comrak + extensions | reference-heavy | 20,737 | 191.0 | 188.0 | 108.6 | 242.2 | 237.5 | 85.6 |
| jotdown (no tree) | reference-heavy | 20,617 | 159.2 | 156.7 | 129.5 | 194.7 | 191.0 | 105.9 |
| Carve 0.2 | 1mb | 1,095,785 | 27,522.9 | 26,463.2 | 39.8 | 35,281.7 | 33,702.9 | 31.1 |
| Carve 0.2, no resolve | 1mb | 1,095,785 | 16,028.1 | 15,794.8 | 68.4 | 35,946.6 | 34,680.4 | 30.5 |
| Carve 0.1 | 1mb | 1,095,785 | 308,372.5 | 300,319.4 | 3.6 | 384,263.4 | 376,617.7 | 2.9 |
| pulldown-cmark (no tree) | 1mb | 1,105,586 | 6,352.5 | 6,279.8 | 174.0 | 6,128.3 | 5,985.1 | 180.4 |
| comrak | 1mb | 1,105,586 | 18,323.4 | 17,652.4 | 60.3 | 25,414.2 | 24,603.9 | 43.5 |
| comrak + extensions | 1mb | 1,105,586 | 25,663.3 | 25,155.4 | 43.1 | 35,655.6 | 33,705.7 | 31.0 |
| jotdown (no tree) | 1mb | 1,096,577 | 13,862.6 | 13,568.3 | 79.1 | 15,543.1 | 15,108.3 | 70.6 |
### PHP, JIT off

Runtime: PHP 8.5.12, JIT off. Load average (1, 5, 15 min) at start 1.39, 1.77, 1.48, at end 1.57, 1.58, 1.46.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 17,000.6 | 15,094.1 | 2.9 | 17,678.3 | 14,683.4 | 2.8 |
| Carve 0.1 | commonmark-core | 49,732 | 142,702.4 | 124,262.1 | 0.3 | 148,926.9 | 140,463.7 | 0.3 |
| league/commonmark GFM | commonmark-core | 50,332 | 34,836.1 | 30,559.9 | 1.4 | 39,419.9 | 34,747.5 | 1.3 |
| php-collective/djot | commonmark-core | 49,732 | 16,748.8 | 13,392.6 | 3.0 | 16,687.5 | 14,493.9 | 3.0 |
| Carve 0.2 | prose | 31,069 | 3,234.7 | 2,941.0 | 9.6 | 3,627.1 | 3,443.8 | 8.6 |
| Carve 0.1 | prose | 31,069 | 5,343.1 | 4,725.8 | 5.8 | 9,703.9 | 9,324.4 | 3.2 |
| league/commonmark GFM | prose | 31,257 | 7,416.6 | 6,286.9 | 4.2 | 8,475.4 | 7,492.8 | 3.7 |
| php-collective/djot | prose | 31,069 | 3,810.5 | 3,340.7 | 8.2 | 4,574.1 | 4,036.7 | 6.8 |
| Carve 0.2 | lists-tables | 20,332 | 2,918.9 | 2,670.2 | 7.0 | 3,430.7 | 3,245.3 | 5.9 |
| Carve 0.1 | lists-tables | 20,332 | 13,022.3 | 12,619.6 | 1.6 | 17,897.2 | 16,787.0 | 1.1 |
| league/commonmark GFM | lists-tables | 20,513 | 6,785.6 | 6,277.2 | 3.0 | 7,947.0 | 7,399.1 | 2.6 |
| php-collective/djot | lists-tables | 20,420 | 3,355.7 | 3,077.5 | 6.1 | 4,325.2 | 3,963.9 | 4.7 |
| Carve 0.2 | reference-heavy | 20,617 | 2,193.5 | 2,011.7 | 9.4 | 2,650.3 | 2,521.3 | 7.8 |
| Carve 0.1 | reference-heavy | 20,617 | 9,939.6 | 9,282.6 | 2.1 | 11,907.2 | 11,348.1 | 1.7 |
| league/commonmark GFM | reference-heavy | 20,737 | 5,433.8 | 4,855.2 | 3.8 | 5,915.0 | 5,506.1 | 3.5 |
| php-collective/djot | reference-heavy | 20,617 | 2,541.4 | 2,212.3 | 8.1 | 3,065.8 | 2,787.7 | 6.7 |
| Carve 0.2 | 1mb | 1,095,785 | 268,010.9 | 254,517.4 | 4.1 | 398,658.2 | 361,356.9 | 2.7 |
| Carve 0.1 | 1mb | 1,095,785 | 1,771,101.8 | 1,684,149.3 | 0.6 | 2,716,797.1 | 2,546,786.4 | 0.4 |
| league/commonmark GFM | 1mb | 1,105,586 | 499,849.7 | 470,580.0 | 2.2 | 654,714.4 | 605,051.8 | 1.7 |
| php-collective/djot | 1mb | 1,096,577 | 203,419.5 | 181,712.2 | 5.4 | 267,021.9 | 255,726.7 | 4.1 |
### PHP, opcache.jit=tracing

Runtime: PHP 8.5.12, JIT tracing. Load average (1, 5, 15 min) at start 1.57, 1.58, 1.46, at end 1.51, 1.55, 1.47.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 17,062.1 | 14,308.4 | 2.9 | 18,700.6 | 16,187.1 | 2.7 |
| Carve 0.1 | commonmark-core | 49,732 | 120,610.0 | 103,730.7 | 0.4 | 133,793.5 | 124,075.0 | 0.4 |
| league/commonmark GFM | commonmark-core | 50,332 | 34,034.7 | 30,526.8 | 1.5 | 39,452.6 | 33,927.9 | 1.3 |
| php-collective/djot | commonmark-core | 49,732 | 16,732.6 | 10,538.5 | 3.0 | 16,139.7 | 13,352.7 | 3.1 |
| Carve 0.2 | prose | 31,069 | 3,095.4 | 2,914.0 | 10.0 | 3,663.6 | 3,455.5 | 8.5 |
| Carve 0.1 | prose | 31,069 | 4,521.9 | 3,843.5 | 6.9 | 8,281.5 | 7,603.7 | 3.8 |
| league/commonmark GFM | prose | 31,257 | 7,284.0 | 6,313.5 | 4.3 | 8,476.0 | 7,651.5 | 3.7 |
| php-collective/djot | prose | 31,069 | 3,611.1 | 3,231.3 | 8.6 | 4,793.9 | 4,207.3 | 6.5 |
| Carve 0.2 | lists-tables | 20,332 | 2,899.6 | 2,667.6 | 7.0 | 3,430.1 | 3,282.8 | 5.9 |
| Carve 0.1 | lists-tables | 20,332 | 11,277.0 | 10,732.1 | 1.8 | 15,567.6 | 14,835.1 | 1.3 |
| league/commonmark GFM | lists-tables | 20,513 | 6,995.6 | 6,187.1 | 2.9 | 8,150.2 | 7,487.8 | 2.5 |
| php-collective/djot | lists-tables | 20,420 | 3,210.7 | 3,035.6 | 6.4 | 4,307.3 | 3,932.3 | 4.7 |
| Carve 0.2 | reference-heavy | 20,617 | 2,151.0 | 2,035.7 | 9.6 | 2,660.1 | 2,536.5 | 7.8 |
| Carve 0.1 | reference-heavy | 20,617 | 7,476.1 | 7,245.1 | 2.8 | 10,483.5 | 9,972.8 | 2.0 |
| league/commonmark GFM | reference-heavy | 20,737 | 5,313.7 | 4,921.0 | 3.9 | 5,935.2 | 5,558.3 | 3.5 |
| php-collective/djot | reference-heavy | 20,617 | 2,420.1 | 2,111.4 | 8.5 | 3,241.1 | 2,684.0 | 6.4 |
| Carve 0.2 | 1mb | 1,095,785 | 271,370.7 | 240,437.6 | 4.0 | 399,826.7 | 359,307.5 | 2.7 |
| Carve 0.1 | 1mb | 1,095,785 | 1,496,894.1 | 1,433,451.5 | 0.7 | 2,463,449.1 | 2,346,559.6 | 0.4 |
| league/commonmark GFM | 1mb | 1,105,586 | 497,667.9 | 463,242.5 | 2.2 | 648,745.6 | 604,709.1 | 1.7 |
| php-collective/djot | 1mb | 1,096,577 | 201,495.3 | 191,588.6 | 5.4 | 270,400.1 | 252,913.5 | 4.1 |

## Engines

- JavaScript: Carve 0.2 0.2 (v2/src, 0.1.17 repo), Carve 0.1 0.1.17, markdown-it (token list) 15.0.0, commonmark.js 0.31.2, djot.js 0.3.2
- Rust: Carve 0.2 0.2 (carve2, v2/), Carve 0.2, no resolve 0.2 (carve2, v2/), Carve 0.1 carve-lang 0.1.14, pulldown-cmark (no tree) 0.13.4, comrak 0.54.0, comrak + extensions 0.54.0, jotdown (no tree) 0.10.0
- PHP, JIT off: Carve 0.2 0.2 (Carve2, v2/), Carve 0.1 carve-php 0.1.17+ (src/), league/commonmark GFM 2.10.7, php-collective/djot dev-master
- PHP, opcache.jit=tracing: Carve 0.2 0.2 (Carve2, v2/), Carve 0.1 carve-php 0.1.17+ (src/), league/commonmark GFM 2.10.7, php-collective/djot dev-master
