# Results

**Measured under load, to be repeated.** Measured 2026-11-15T18:09:20.452Z to 2026-11-15T18:25:55.545Z on AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics (16 threads), Linux 7.0.0-38-generic. v22.22.2, PHP 8.5.12, rustc 1.97.1 (8bab26f4f 2026-07-14). Harness commit `f771a04f0686cd1c375f6c8fb52f235b2c2b5d8c`. Engine commits: carve-js `c27a9dd40c1c0a359ebb2f3c3c44edbd0d429ae8`, carve-rs `8c70808759761875a7beba9289eb9c236ceda6e2`, carve-php `a9679962657af56f1b743ba7a1910e279fb935a5`. Load average at start 6.73, 5.76, 5.92, at end 13.08, 10.05, 8.01.

### Parse plus HTML, normal path

| JavaScript: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 11.0 | 26.8 | 18.8 | 21.2 | 13.4 |
| Carve 0.1 | 0.8 | 6.5 | 2.4 | 2.5 | 1.2 |
| markdown-it | 5.4 | 12.9 | 10.1 | 11.8 | 7.3 |
| commonmark.js | 11.2 | 36.2 | 29.1 | 30.2 | 9.6 |
| djot.js | 4.9 | 19.6 | 10.9 | 16.5 | 7.2 |

| Rust: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 8.5 | 20.5 | 15.7 | 18.8 | 6.5 |
| Carve 0.1 | 5.6 | 25.1 | 22.8 | 6.9 | 1.9 |
| pulldown-cmark | 102.9 | 217.6 | 191.4 | 179.8 | 126.2 |
| comrak | 39.3 | 78.8 | 71.7 | 70.5 | 28.5 |
| jotdown | 41.1 | 87.2 | 68.5 | 77.4 | 50.4 |

| PHP, JIT off: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.5 | 5.7 | 3.9 | 4.4 | 1.8 |
| Carve 0.1 | 0.2 | 1.6 | 0.7 | 0.9 | 0.2 |
| league/commonmark GFM | 0.1 | 2.3 | 1.5 | 2.0 | 1.1 |
| php-collective/djot | 10.7 | 4.4 | 2.5 | 4.0 | 2.1 |

| PHP, opcache.jit=tracing: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.2 | 3.9 | 2.6 | 3.6 | 1.9 |
| Carve 0.1 | 0.2 | 2.1 | 0.8 | 1.1 | 0.2 |
| league/commonmark GFM | 0.1 | 2.4 | 1.6 | 2.1 | 1.0 |
| php-collective/djot | 9.3 | 4.2 | 2.4 | 3.4 | 1.9 |

### Parse to tree

| JavaScript: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 11.1 | 25.9 | 18.6 | 23.5 | 13.7 |
| Carve 0.1 | 0.7 | 7.2 | 1.9 | 2.6 | 1.2 |
| markdown-it | 6.0 | 14.3 | 11.0 | 12.6 | 7.9 |
| commonmark.js | 17.2 | 47.3 | 38.3 | 39.8 | 13.9 |
| djot.js | 5.6 | 20.4 | 11.6 | 19.0 | 8.0 |

| Rust: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 11.8 | 27.2 | 21.6 | 27.5 | 9.4 |
| Carve 0.1 | 6.1 | 32.8 | 31.2 | 8.8 | 2.5 |
| pulldown-cmark | 100.5 | 238.7 | 212.8 | 195.7 | 131.1 |
| comrak | 49.5 | 107.9 | 90.5 | 86.1 | 39.1 |
| jotdown | 44.4 | 102.0 | 78.0 | 98.1 | 55.9 |

| PHP, JIT off: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.9 | 6.0 | 4.1 | 4.4 | 2.8 |
| Carve 0.1 | 0.2 | 4.2 | 1.0 | 1.4 | 0.4 |
| league/commonmark GFM | 1.1 | 0.8 | 0.6 | 2.3 | 1.4 |
| php-collective/djot | 2.3 | 4.5 | 3.8 | 5.2 | 3.7 |

| PHP, opcache.jit=tracing: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.6 | 4.6 | 2.9 | 4.1 | 2.7 |
| Carve 0.1 | 0.2 | 4.6 | 1.0 | 1.6 | 0.4 |
| league/commonmark GFM | 1.0 | 0.1 | 0.5 | 1.9 | 1.3 |
| php-collective/djot | 3.1 | 3.2 | 3.2 | 4.9 | 3.4 |

### Carve 0.2 against Carve 0.1 (speed ratio of the medians, above 1x means 0.2 is faster)

| Lane | Measure | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|---|--:|--:|--:|--:|--:|
| JavaScript | parse to tree | 15.62x | 3.61x | 9.79x | 8.89x | 11.00x |
| JavaScript | parse plus HTML | 13.89x | 4.12x | 7.71x | 8.57x | 11.14x |
| Rust | parse to tree | 1.92x | 0.83x | 0.69x | 3.12x | 3.77x |
| Rust | parse plus HTML | 1.53x | 0.82x | 0.69x | 2.72x | 3.51x |
| PHP, JIT off | parse to tree | 10.59x | 1.42x | 4.09x | 3.14x | 7.14x |
| PHP, JIT off | parse plus HTML | 7.49x | 3.54x | 5.25x | 4.64x | 7.46x |
| PHP, opcache.jit=tracing | parse to tree | 9.71x | 1.01x | 2.81x | 2.61x | 6.24x |
| PHP, opcache.jit=tracing | parse plus HTML | 6.51x | 1.88x | 3.28x | 3.21x | 8.12x |

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

Runtime: Node v22.22.2. Load average (1, 5, 15 min) at start 6.73, 5.76, 5.92, at end 6.18, 6.4, 6.15.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 4,464.1 | 4,109.4 | 11.1 | 4,504.1 | 3,852.1 | 11.0 |
| Carve 0.1 | commonmark-core | 49,732 | 69,740.5 | 54,192.1 | 0.7 | 62,553.0 | 51,516.5 | 0.8 |
| markdown-it | commonmark-core | 50,332 | 8,357.2 | 7,439.6 | 6.0 | 9,322.8 | 8,597.0 | 5.4 |
| commonmark.js | commonmark-core | 50,332 | 2,920.7 | 2,568.6 | 17.2 | 4,481.6 | 3,787.7 | 11.2 |
| djot.js | commonmark-core | 49,732 | 8,835.0 | 7,508.6 | 5.6 | 10,106.8 | 8,777.4 | 4.9 |
| Carve 0.2 | prose | 31,069 | 1,198.3 | 1,118.4 | 25.9 | 1,159.2 | 1,087.1 | 26.8 |
| Carve 0.1 | prose | 31,069 | 4,328.6 | 3,753.3 | 7.2 | 4,771.6 | 4,108.4 | 6.5 |
| markdown-it | prose | 31,257 | 2,180.2 | 1,994.7 | 14.3 | 2,423.4 | 2,178.9 | 12.9 |
| commonmark.js | prose | 31,257 | 661.5 | 577.2 | 47.3 | 864.3 | 819.0 | 36.2 |
| djot.js | prose | 31,069 | 1,520.6 | 1,348.2 | 20.4 | 1,589.1 | 1,463.1 | 19.6 |
| Carve 0.2 | lists-tables | 20,332 | 1,091.2 | 1,029.4 | 18.6 | 1,081.7 | 1,033.5 | 18.8 |
| Carve 0.1 | lists-tables | 20,332 | 10,688.3 | 8,438.6 | 1.9 | 8,339.9 | 7,773.3 | 2.4 |
| markdown-it | lists-tables | 20,513 | 1,862.5 | 1,776.2 | 11.0 | 2,026.6 | 1,882.5 | 10.1 |
| commonmark.js | lists-tables | 20,513 | 535.3 | 486.8 | 38.3 | 704.9 | 667.1 | 29.1 |
| djot.js | lists-tables | 20,420 | 1,763.2 | 1,531.2 | 11.6 | 1,866.5 | 1,620.1 | 10.9 |
| Carve 0.2 | reference-heavy | 20,617 | 877.5 | 837.0 | 23.5 | 973.4 | 849.5 | 21.2 |
| Carve 0.1 | reference-heavy | 20,617 | 7,803.8 | 6,801.0 | 2.6 | 8,346.6 | 7,579.1 | 2.5 |
| markdown-it | reference-heavy | 20,737 | 1,641.7 | 1,536.5 | 12.6 | 1,751.7 | 1,640.4 | 11.8 |
| commonmark.js | reference-heavy | 20,737 | 520.5 | 496.9 | 39.8 | 687.3 | 650.8 | 30.2 |
| djot.js | reference-heavy | 20,617 | 1,085.4 | 1,005.2 | 19.0 | 1,249.1 | 1,112.5 | 16.5 |
| Carve 0.2 | 1mb | 1,095,785 | 79,770.7 | 74,378.5 | 13.7 | 82,059.6 | 73,427.2 | 13.4 |
| Carve 0.1 | 1mb | 1,095,785 | 877,619.8 | 823,549.9 | 1.2 | 914,223.3 | 849,517.2 | 1.2 |
| markdown-it | 1mb | 1,105,586 | 140,346.1 | 126,873.4 | 7.9 | 152,336.8 | 144,208.3 | 7.3 |
| commonmark.js | 1mb | 1,105,586 | 79,592.0 | 72,740.4 | 13.9 | 115,584.0 | 106,971.6 | 9.6 |
| djot.js | 1mb | 1,096,577 | 136,829.0 | 123,975.3 | 8.0 | 152,315.1 | 136,530.9 | 7.2 |
### Rust

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Load average (1, 5, 15 min) at start 6.18, 6.4, 6.15, at end 6.15, 6.64, 6.3.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 4,226.4 | 3,285.1 | 11.8 | 5,858.2 | 4,506.9 | 8.5 |
| Carve 0.1 | commonmark-core | 49,732 | 8,095.7 | 6,630.7 | 6.1 | 8,942.7 | 7,522.5 | 5.6 |
| pulldown-cmark | commonmark-core | 50,332 | 501.0 | 468.5 | 100.5 | 489.1 | 465.6 | 102.9 |
| comrak | commonmark-core | 50,332 | 1,017.4 | 965.7 | 49.5 | 1,281.6 | 1,219.7 | 39.3 |
| jotdown | commonmark-core | 49,732 | 1,120.1 | 1,049.2 | 44.4 | 1,211.0 | 1,150.7 | 41.1 |
| Carve 0.2 | prose | 31,069 | 1,142.9 | 1,015.6 | 27.2 | 1,516.5 | 1,353.9 | 20.5 |
| Carve 0.1 | prose | 31,069 | 948.6 | 885.0 | 32.8 | 1,240.0 | 1,095.0 | 25.1 |
| pulldown-cmark | prose | 31,257 | 130.9 | 123.1 | 238.7 | 143.7 | 137.0 | 217.6 |
| comrak | prose | 31,257 | 289.6 | 269.0 | 107.9 | 396.8 | 347.1 | 78.8 |
| jotdown | prose | 31,069 | 304.7 | 287.2 | 102.0 | 356.3 | 338.8 | 87.2 |
| Carve 0.2 | lists-tables | 20,332 | 940.7 | 873.6 | 21.6 | 1,294.8 | 1,202.4 | 15.7 |
| Carve 0.1 | lists-tables | 20,332 | 651.0 | 626.9 | 31.2 | 891.7 | 823.9 | 22.8 |
| pulldown-cmark | lists-tables | 20,513 | 96.4 | 93.3 | 212.8 | 107.2 | 102.7 | 191.4 |
| comrak | lists-tables | 20,513 | 226.6 | 213.6 | 90.5 | 286.2 | 274.0 | 71.7 |
| jotdown | lists-tables | 20,420 | 261.7 | 254.1 | 78.0 | 298.0 | 291.2 | 68.5 |
| Carve 0.2 | reference-heavy | 20,617 | 748.7 | 708.2 | 27.5 | 1,094.7 | 995.3 | 18.8 |
| Carve 0.1 | reference-heavy | 20,617 | 2,335.1 | 2,204.5 | 8.8 | 2,973.5 | 2,794.6 | 6.9 |
| pulldown-cmark | reference-heavy | 20,737 | 106.0 | 102.8 | 195.7 | 115.3 | 113.3 | 179.8 |
| comrak | reference-heavy | 20,737 | 240.9 | 235.2 | 86.1 | 294.3 | 279.1 | 70.5 |
| jotdown | reference-heavy | 20,617 | 210.3 | 200.9 | 98.1 | 266.3 | 254.4 | 77.4 |
| Carve 0.2 | 1mb | 1,095,785 | 116,528.5 | 102,043.7 | 9.4 | 167,722.4 | 154,977.9 | 6.5 |
| Carve 0.1 | 1mb | 1,095,785 | 439,782.5 | 394,720.6 | 2.5 | 588,259.8 | 497,667.2 | 1.9 |
| pulldown-cmark | 1mb | 1,105,586 | 8,434.1 | 7,964.9 | 131.1 | 8,761.7 | 7,895.9 | 126.2 |
| comrak | 1mb | 1,105,586 | 28,285.0 | 24,275.4 | 39.1 | 38,733.4 | 33,218.6 | 28.5 |
| jotdown | 1mb | 1,096,577 | 19,605.8 | 18,161.0 | 55.9 | 21,765.5 | 20,050.7 | 50.4 |
### PHP, JIT off

Runtime: PHP 8.5.12, JIT off. Load average (1, 5, 15 min) at start 6.15, 6.64, 6.3, at end 6.73, 6.93, 6.54.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 26,452.3 | 21,152.2 | 1.9 | 33,856.0 | 21,782.0 | 1.5 |
| Carve 0.1 | commonmark-core | 49,732 | 280,109.9 | 246,226.6 | 0.2 | 253,742.2 | 181,990.2 | 0.2 |
| league/commonmark GFM | commonmark-core | 50,332 | 47,621.7 | 41,045.2 | 1.1 | 368,984.8 | 50,381.4 | 0.1 |
| php-collective/djot | commonmark-core | 49,732 | 22,024.6 | 13,627.1 | 2.3 | 4,664.3 | 4,294.0 | 10.7 |
| Carve 0.2 | prose | 31,069 | 5,158.6 | 4,321.7 | 6.0 | 5,483.5 | 4,868.3 | 5.7 |
| Carve 0.1 | prose | 31,069 | 7,340.5 | 6,197.7 | 4.2 | 19,412.5 | 12,279.1 | 1.6 |
| league/commonmark GFM | prose | 31,257 | 40,493.4 | 8,348.6 | 0.8 | 13,684.8 | 9,649.5 | 2.3 |
| php-collective/djot | prose | 31,069 | 6,915.8 | 5,631.5 | 4.5 | 7,082.2 | 5,443.6 | 4.4 |
| Carve 0.2 | lists-tables | 20,332 | 5,003.4 | 3,853.6 | 4.1 | 5,273.0 | 4,603.0 | 3.9 |
| Carve 0.1 | lists-tables | 20,332 | 20,455.8 | 17,033.4 | 1.0 | 27,683.0 | 22,526.7 | 0.7 |
| league/commonmark GFM | lists-tables | 20,513 | 33,780.1 | 8,564.7 | 0.6 | 14,124.8 | 10,554.5 | 1.5 |
| php-collective/djot | lists-tables | 20,420 | 5,428.0 | 4,139.6 | 3.8 | 8,187.2 | 5,850.2 | 2.5 |
| Carve 0.2 | reference-heavy | 20,617 | 4,693.2 | 2,817.0 | 4.4 | 4,715.4 | 3,483.1 | 4.4 |
| Carve 0.1 | reference-heavy | 20,617 | 14,740.9 | 12,601.2 | 1.4 | 21,890.8 | 16,911.0 | 0.9 |
| league/commonmark GFM | reference-heavy | 20,737 | 8,988.4 | 6,526.3 | 2.3 | 10,371.6 | 9,093.7 | 2.0 |
| php-collective/djot | reference-heavy | 20,617 | 3,958.6 | 3,261.6 | 5.2 | 5,184.1 | 4,179.7 | 4.0 |
| Carve 0.2 | 1mb | 1,095,785 | 385,895.5 | 320,124.2 | 2.8 | 609,561.7 | 474,677.9 | 1.8 |
| Carve 0.1 | 1mb | 1,095,785 | 2,756,548.0 | 2,246,550.6 | 0.4 | 4,549,530.5 | 3,587,352.4 | 0.2 |
| league/commonmark GFM | 1mb | 1,105,586 | 790,133.5 | 691,021.4 | 1.4 | 1,003,134.3 | 813,364.1 | 1.1 |
| php-collective/djot | 1mb | 1,096,577 | 297,574.1 | 259,411.3 | 3.7 | 532,292.2 | 435,208.4 | 2.1 |
### PHP, opcache.jit=tracing

Runtime: PHP 8.5.12, JIT tracing. Load average (1, 5, 15 min) at start 6.73, 6.93, 6.54, at end 13.08, 10.05, 8.01.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 30,409.9 | 27,813.8 | 1.6 | 39,965.9 | 38,068.5 | 1.2 |
| Carve 0.1 | commonmark-core | 49,732 | 295,194.0 | 243,164.9 | 0.2 | 259,983.4 | 228,952.6 | 0.2 |
| league/commonmark GFM | commonmark-core | 50,332 | 48,085.3 | 43,239.8 | 1.0 | 417,424.5 | 60,764.3 | 0.1 |
| php-collective/djot | commonmark-core | 49,732 | 15,960.2 | 14,469.5 | 3.1 | 5,355.6 | 4,606.2 | 9.3 |
| Carve 0.2 | prose | 31,069 | 6,777.7 | 5,862.3 | 4.6 | 7,867.7 | 5,799.6 | 3.9 |
| Carve 0.1 | prose | 31,069 | 6,821.5 | 6,105.3 | 4.6 | 14,800.4 | 11,576.6 | 2.1 |
| league/commonmark GFM | prose | 31,257 | 241,090.1 | 9,343.9 | 0.1 | 12,839.6 | 11,842.8 | 2.4 |
| php-collective/djot | prose | 31,069 | 9,732.7 | 4,389.1 | 3.2 | 7,481.6 | 6,241.0 | 4.2 |
| Carve 0.2 | lists-tables | 20,332 | 6,975.6 | 5,633.2 | 2.9 | 7,724.9 | 6,355.7 | 2.6 |
| Carve 0.1 | lists-tables | 20,332 | 19,576.0 | 17,891.2 | 1.0 | 25,365.3 | 22,253.2 | 0.8 |
| league/commonmark GFM | lists-tables | 20,513 | 41,461.7 | 10,526.5 | 0.5 | 13,194.7 | 11,968.6 | 1.6 |
| php-collective/djot | lists-tables | 20,420 | 6,359.1 | 5,416.2 | 3.2 | 8,570.9 | 6,730.9 | 2.4 |
| Carve 0.2 | reference-heavy | 20,617 | 5,029.1 | 4,114.5 | 4.1 | 5,732.5 | 4,235.4 | 3.6 |
| Carve 0.1 | reference-heavy | 20,617 | 13,138.9 | 11,925.2 | 1.6 | 18,419.5 | 15,760.9 | 1.1 |
| league/commonmark GFM | reference-heavy | 20,737 | 10,872.7 | 7,363.4 | 1.9 | 9,832.4 | 8,326.3 | 2.1 |
| php-collective/djot | reference-heavy | 20,617 | 4,200.8 | 3,658.7 | 4.9 | 6,139.6 | 4,420.3 | 3.4 |
| Carve 0.2 | 1mb | 1,095,785 | 400,028.6 | 373,537.7 | 2.7 | 588,887.7 | 574,608.1 | 1.9 |
| Carve 0.1 | 1mb | 1,095,785 | 2,497,891.2 | 2,242,722.2 | 0.4 | 4,783,442.4 | 4,427,687.2 | 0.2 |
| league/commonmark GFM | 1mb | 1,105,586 | 866,906.1 | 786,163.6 | 1.3 | 1,060,456.8 | 925,968.3 | 1.0 |
| php-collective/djot | 1mb | 1,096,577 | 320,531.8 | 287,237.1 | 3.4 | 572,724.0 | 519,873.5 | 1.9 |

## Engines

- JavaScript: Carve 0.2 0.2 (v2/src, 0.1.17 repo), Carve 0.1 0.1.17, markdown-it 15.0.0, commonmark.js 0.31.2, djot.js 0.3.2
- Rust: Carve 0.2 0.2 (carve2, v2/), Carve 0.1 carve-lang 0.1.14, pulldown-cmark 0.13.4, comrak 0.54.0, jotdown 0.10.0
- PHP, JIT off: Carve 0.2 0.2 (Carve2, v2/), Carve 0.1 carve-php 0.1 (src/), league/commonmark GFM 2.10.7, php-collective/djot dev-master
- PHP, opcache.jit=tracing: Carve 0.2 0.2 (Carve2, v2/), Carve 0.1 carve-php 0.1 (src/), league/commonmark GFM 2.10.7, php-collective/djot dev-master
