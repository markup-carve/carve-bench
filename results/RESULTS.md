# Results

**Measured under load, to be repeated.** Measured 2026-11-15T18:44:55.494Z to 2026-11-15T19:02:09.320Z on AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics (16 threads), Linux 7.0.0-38-generic. v22.22.2, PHP 8.5.12, rustc 1.97.1 (8bab26f4f 2026-07-14). Harness commit `6e367be8e9a8300970f79fbaa1eeb4702b6cb1b6`. Engine commits: carve-js `c27a9dd40c1c0a359ebb2f3c3c44edbd0d429ae8`, carve-rs `8c70808759761875a7beba9289eb9c236ceda6e2`, carve-php `a9679962657af56f1b743ba7a1910e279fb935a5`. Load average at start 14.09, 11.29, 9.75, at end 8.66, 9.15, 9.57.

### Parse plus HTML, normal path

| JavaScript: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 9.7 | 26.9 | 15.6 | 20.6 | 11.9 |
| Carve 0.1 | 0.4 | 5.2 | 1.4 | 1.7 | 0.9 |
| markdown-it | 5.1 | 13.7 | 9.6 | 10.7 | 6.2 |
| commonmark.js | 9.0 | 36.3 | 30.1 | 28.9 | 9.2 |
| djot.js | 4.1 | 16.3 | 9.2 | 14.0 | 5.2 |

| Rust: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 9.4 | 23.3 | 16.9 | 21.2 | 7.0 |
| Carve 0.1 | 5.8 | 29.7 | 25.6 | 7.4 | 2.1 |
| pulldown-cmark | 113.5 | 236.9 | 215.5 | 198.1 | 149.1 |
| comrak | 40.6 | 96.2 | 80.0 | 80.9 | 29.8 |
| jotdown | 47.1 | 97.5 | 73.0 | 90.6 | 57.9 |

| PHP, JIT off: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.4 | 4.8 | 3.1 | 4.3 | 2.0 |
| Carve 0.1 | 0.2 | 2.4 | 0.8 | 1.2 | 0.3 |
| league/commonmark GFM | 0.9 | 2.7 | 1.9 | 2.7 | 1.3 |
| php-collective/djot | 2.1 | 4.3 | 3.0 | 4.2 | 3.2 |

| PHP, opcache.jit=tracing: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.2 | 4.0 | 2.7 | 4.0 | 1.9 |
| Carve 0.1 | 0.2 | 2.4 | 0.8 | 1.2 | 0.2 |
| league/commonmark GFM | 0.9 | 2.7 | 1.7 | 2.3 | 1.2 |
| php-collective/djot | 2.0 | 4.6 | 2.9 | 4.2 | 2.7 |

### Parse to tree

| JavaScript: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 9.6 | 24.6 | 17.5 | 21.6 | 11.5 |
| Carve 0.1 | 0.4 | 5.7 | 1.2 | 1.7 | 1.0 |
| markdown-it | 5.5 | 14.8 | 10.8 | 12.8 | 6.6 |
| commonmark.js | 17.4 | 51.4 | 43.7 | 42.1 | 14.3 |
| djot.js | 5.0 | 18.6 | 10.0 | 15.3 | 7.1 |

| Rust: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 13.0 | 32.1 | 23.6 | 30.0 | 10.0 |
| Carve 0.1 | 6.9 | 36.5 | 33.5 | 9.8 | 2.7 |
| pulldown-cmark | 111.1 | 262.7 | 238.8 | 213.3 | 146.9 |
| comrak | 51.0 | 122.1 | 97.6 | 94.0 | 41.5 |
| jotdown | 50.9 | 114.5 | 84.0 | 112.0 | 64.6 |

| PHP, JIT off: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.9 | 5.0 | 3.3 | 4.8 | 3.1 |
| Carve 0.1 | 0.2 | 3.6 | 1.0 | 1.6 | 0.4 |
| league/commonmark GFM | 1.1 | 3.4 | 2.3 | 3.1 | 1.8 |
| php-collective/djot | 3.6 | 6.6 | 4.4 | 6.2 | 5.1 |

| PHP, opcache.jit=tracing: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.6 | 4.4 | 3.2 | 3.9 | 2.9 |
| Carve 0.1 | 0.2 | 4.0 | 1.1 | 1.7 | 0.5 |
| league/commonmark GFM | 1.1 | 3.3 | 2.1 | 2.8 | 1.6 |
| php-collective/djot | 3.3 | 6.0 | 3.8 | 5.4 | 4.4 |

### Carve 0.2 against Carve 0.1 (speed ratio of the medians, above 1x means 0.2 is faster)

| Lane | Measure | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|---|--:|--:|--:|--:|--:|
| JavaScript | parse to tree | 23.92x | 4.33x | 14.42x | 12.71x | 11.80x |
| JavaScript | parse plus HTML | 23.27x | 5.13x | 11.43x | 12.36x | 13.88x |
| Rust | parse to tree | 1.89x | 0.88x | 0.70x | 3.07x | 3.67x |
| Rust | parse plus HTML | 1.62x | 0.78x | 0.66x | 2.85x | 3.33x |
| PHP, JIT off | parse to tree | 8.63x | 1.38x | 3.16x | 3.00x | 6.91x |
| PHP, JIT off | parse plus HTML | 7.71x | 1.98x | 3.82x | 3.76x | 7.89x |
| PHP, opcache.jit=tracing | parse to tree | 7.33x | 1.11x | 2.90x | 2.31x | 6.12x |
| PHP, opcache.jit=tracing | parse plus HTML | 6.84x | 1.69x | 3.25x | 3.24x | 7.76x |

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

Runtime: Node v22.22.2. Load average (1, 5, 15 min) at start 14.09, 11.29, 9.75, at end 12.94, 12.06, 10.36.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 5,156.7 | 4,084.0 | 9.6 | 5,150.0 | 3,811.8 | 9.7 |
| Carve 0.1 | commonmark-core | 49,732 | 123,326.1 | 86,421.2 | 0.4 | 119,826.9 | 72,001.3 | 0.4 |
| markdown-it | commonmark-core | 50,332 | 9,101.7 | 7,327.6 | 5.5 | 9,782.4 | 7,614.4 | 5.1 |
| commonmark.js | commonmark-core | 50,332 | 2,894.1 | 2,283.8 | 17.4 | 5,594.0 | 3,643.6 | 9.0 |
| djot.js | commonmark-core | 49,732 | 10,022.6 | 7,413.3 | 5.0 | 12,108.9 | 9,034.1 | 4.1 |
| Carve 0.2 | prose | 31,069 | 1,261.1 | 1,048.2 | 24.6 | 1,156.7 | 1,062.1 | 26.9 |
| Carve 0.1 | prose | 31,069 | 5,459.3 | 4,276.3 | 5.7 | 5,936.3 | 4,686.3 | 5.2 |
| markdown-it | prose | 31,257 | 2,116.2 | 1,779.1 | 14.8 | 2,285.6 | 1,973.9 | 13.7 |
| commonmark.js | prose | 31,257 | 608.3 | 533.9 | 51.4 | 860.4 | 738.2 | 36.3 |
| djot.js | prose | 31,069 | 1,671.0 | 1,362.8 | 18.6 | 1,901.6 | 1,585.7 | 16.3 |
| Carve 0.2 | lists-tables | 20,332 | 1,158.7 | 1,015.5 | 17.5 | 1,307.3 | 1,015.7 | 15.6 |
| Carve 0.1 | lists-tables | 20,332 | 16,710.6 | 15,156.9 | 1.2 | 14,937.7 | 10,721.7 | 1.4 |
| markdown-it | lists-tables | 20,513 | 1,907.0 | 1,617.7 | 10.8 | 2,135.4 | 1,824.8 | 9.6 |
| commonmark.js | lists-tables | 20,513 | 469.5 | 443.6 | 43.7 | 682.6 | 616.9 | 30.1 |
| djot.js | lists-tables | 20,420 | 2,050.2 | 1,564.7 | 10.0 | 2,224.9 | 1,866.0 | 9.2 |
| Carve 0.2 | reference-heavy | 20,617 | 954.3 | 807.8 | 21.6 | 1,002.5 | 867.4 | 20.6 |
| Carve 0.1 | reference-heavy | 20,617 | 12,132.9 | 10,142.5 | 1.7 | 12,389.8 | 9,101.8 | 1.7 |
| markdown-it | reference-heavy | 20,737 | 1,616.7 | 1,440.2 | 12.8 | 1,943.8 | 1,524.3 | 10.7 |
| commonmark.js | reference-heavy | 20,737 | 492.7 | 449.3 | 42.1 | 718.2 | 608.5 | 28.9 |
| djot.js | reference-heavy | 20,617 | 1,347.9 | 1,001.4 | 15.3 | 1,477.0 | 1,163.7 | 14.0 |
| Carve 0.2 | 1mb | 1,095,785 | 94,937.9 | 72,691.8 | 11.5 | 92,394.6 | 81,644.1 | 11.9 |
| Carve 0.1 | 1mb | 1,095,785 | 1,120,134.9 | 960,231.8 | 1.0 | 1,282,446.0 | 1,121,335.2 | 0.9 |
| markdown-it | 1mb | 1,105,586 | 168,257.0 | 142,080.9 | 6.6 | 177,460.1 | 152,162.3 | 6.2 |
| commonmark.js | 1mb | 1,105,586 | 77,264.3 | 67,214.5 | 14.3 | 120,650.9 | 104,645.3 | 9.2 |
| djot.js | 1mb | 1,096,577 | 153,476.4 | 125,857.1 | 7.1 | 210,888.1 | 149,393.9 | 5.2 |
### Rust

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Load average (1, 5, 15 min) at start 12.94, 12.06, 10.36, at end 9.24, 10.21, 9.89.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 3,814.9 | 3,155.4 | 13.0 | 5,291.2 | 4,379.7 | 9.4 |
| Carve 0.1 | commonmark-core | 49,732 | 7,193.3 | 6,590.2 | 6.9 | 8,548.8 | 7,509.7 | 5.8 |
| pulldown-cmark | commonmark-core | 50,332 | 453.0 | 422.1 | 111.1 | 443.3 | 406.9 | 113.5 |
| comrak | commonmark-core | 50,332 | 986.1 | 853.5 | 51.0 | 1,240.9 | 1,090.2 | 40.6 |
| jotdown | commonmark-core | 49,732 | 976.9 | 907.2 | 50.9 | 1,056.1 | 993.7 | 47.1 |
| Carve 0.2 | prose | 31,069 | 967.6 | 922.2 | 32.1 | 1,333.8 | 1,219.9 | 23.3 |
| Carve 0.1 | prose | 31,069 | 851.2 | 771.5 | 36.5 | 1,044.6 | 968.3 | 29.7 |
| pulldown-cmark | prose | 31,257 | 119.0 | 109.2 | 262.7 | 131.9 | 117.4 | 236.9 |
| comrak | prose | 31,257 | 256.0 | 233.5 | 122.1 | 325.0 | 303.3 | 96.2 |
| jotdown | prose | 31,069 | 271.3 | 255.5 | 114.5 | 318.5 | 290.2 | 97.5 |
| Carve 0.2 | lists-tables | 20,332 | 861.6 | 765.2 | 23.6 | 1,202.8 | 1,046.6 | 16.9 |
| Carve 0.1 | lists-tables | 20,332 | 607.0 | 535.9 | 33.5 | 794.3 | 715.9 | 25.6 |
| pulldown-cmark | lists-tables | 20,513 | 85.9 | 79.8 | 238.8 | 95.2 | 87.8 | 215.5 |
| comrak | lists-tables | 20,513 | 210.2 | 194.7 | 97.6 | 256.6 | 238.8 | 80.0 |
| jotdown | lists-tables | 20,420 | 243.2 | 223.8 | 84.0 | 279.6 | 252.3 | 73.0 |
| Carve 0.2 | reference-heavy | 20,617 | 686.3 | 616.5 | 30.0 | 973.8 | 882.2 | 21.2 |
| Carve 0.1 | reference-heavy | 20,617 | 2,108.8 | 1,962.5 | 9.8 | 2,773.1 | 2,519.5 | 7.4 |
| pulldown-cmark | reference-heavy | 20,737 | 97.2 | 90.7 | 213.3 | 104.7 | 99.3 | 198.1 |
| comrak | reference-heavy | 20,737 | 220.6 | 198.5 | 94.0 | 256.2 | 240.7 | 80.9 |
| jotdown | reference-heavy | 20,617 | 184.1 | 175.1 | 112.0 | 227.6 | 220.7 | 90.6 |
| Carve 0.2 | 1mb | 1,095,785 | 109,748.2 | 101,971.2 | 10.0 | 156,123.8 | 150,266.3 | 7.0 |
| Carve 0.1 | 1mb | 1,095,785 | 402,457.0 | 375,958.1 | 2.7 | 520,226.9 | 484,461.6 | 2.1 |
| pulldown-cmark | 1mb | 1,105,586 | 7,528.6 | 6,968.3 | 146.9 | 7,413.1 | 6,728.7 | 149.1 |
| comrak | 1mb | 1,105,586 | 26,662.6 | 23,489.0 | 41.5 | 37,106.3 | 31,795.7 | 29.8 |
| jotdown | 1mb | 1,096,577 | 16,969.2 | 15,248.3 | 64.6 | 18,952.7 | 17,357.7 | 57.9 |
### PHP, JIT off

Runtime: PHP 8.5.12, JIT off. Load average (1, 5, 15 min) at start 9.24, 10.21, 9.89, at end 8.44, 9.54, 9.8.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 26,878.3 | 25,258.5 | 1.9 | 35,475.0 | 31,282.8 | 1.4 |
| Carve 0.1 | commonmark-core | 49,732 | 231,978.2 | 203,757.9 | 0.2 | 273,513.7 | 211,854.4 | 0.2 |
| league/commonmark GFM | commonmark-core | 50,332 | 45,082.8 | 39,460.1 | 1.1 | 54,119.4 | 45,925.8 | 0.9 |
| php-collective/djot | commonmark-core | 49,732 | 13,778.3 | 12,034.7 | 3.6 | 23,747.3 | 20,012.4 | 2.1 |
| Carve 0.2 | prose | 31,069 | 6,181.2 | 5,450.4 | 5.0 | 6,489.5 | 5,229.6 | 4.8 |
| Carve 0.1 | prose | 31,069 | 8,548.9 | 6,578.6 | 3.6 | 12,855.6 | 11,925.0 | 2.4 |
| league/commonmark GFM | prose | 31,257 | 9,327.4 | 7,862.2 | 3.4 | 11,384.7 | 9,796.3 | 2.7 |
| php-collective/djot | prose | 31,069 | 4,672.8 | 3,954.7 | 6.6 | 7,150.3 | 6,113.2 | 4.3 |
| Carve 0.2 | lists-tables | 20,332 | 6,208.1 | 4,571.4 | 3.3 | 6,568.3 | 4,566.6 | 3.1 |
| Carve 0.1 | lists-tables | 20,332 | 19,604.9 | 15,753.7 | 1.0 | 25,067.8 | 22,750.5 | 0.8 |
| league/commonmark GFM | lists-tables | 20,513 | 8,763.2 | 7,812.5 | 2.3 | 10,692.6 | 10,003.9 | 1.9 |
| php-collective/djot | lists-tables | 20,420 | 4,659.1 | 4,141.8 | 4.4 | 6,770.0 | 5,362.7 | 3.0 |
| Carve 0.2 | reference-heavy | 20,617 | 4,296.2 | 3,486.8 | 4.8 | 4,751.7 | 3,482.4 | 4.3 |
| Carve 0.1 | reference-heavy | 20,617 | 12,907.4 | 11,663.6 | 1.6 | 17,875.8 | 15,183.7 | 1.2 |
| league/commonmark GFM | reference-heavy | 20,737 | 6,674.0 | 5,768.3 | 3.1 | 7,817.1 | 7,072.9 | 2.7 |
| php-collective/djot | reference-heavy | 20,617 | 3,322.7 | 2,953.2 | 6.2 | 4,857.0 | 4,127.2 | 4.2 |
| Carve 0.2 | 1mb | 1,095,785 | 356,485.3 | 318,799.3 | 3.1 | 554,649.2 | 471,429.0 | 2.0 |
| Carve 0.1 | 1mb | 1,095,785 | 2,461,653.5 | 2,194,081.1 | 0.4 | 4,373,841.8 | 3,792,989.0 | 0.3 |
| league/commonmark GFM | 1mb | 1,105,586 | 613,946.3 | 533,436.9 | 1.8 | 824,003.9 | 748,705.9 | 1.3 |
| php-collective/djot | 1mb | 1,096,577 | 215,771.8 | 206,962.8 | 5.1 | 345,252.7 | 318,364.1 | 3.2 |
### PHP, opcache.jit=tracing

Runtime: PHP 8.5.12, JIT tracing. Load average (1, 5, 15 min) at start 8.44, 9.54, 9.8, at end 8.66, 9.15, 9.57.

| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |
|---|---|--:|--:|--:|--:|--:|--:|--:|
| Carve 0.2 | commonmark-core | 49,732 | 30,937.2 | 24,823.2 | 1.6 | 39,814.2 | 35,127.8 | 1.2 |
| Carve 0.1 | commonmark-core | 49,732 | 226,854.8 | 169,499.2 | 0.2 | 272,195.7 | 207,952.3 | 0.2 |
| league/commonmark GFM | commonmark-core | 50,332 | 45,331.6 | 40,392.5 | 1.1 | 54,543.0 | 47,229.6 | 0.9 |
| php-collective/djot | commonmark-core | 49,732 | 15,253.8 | 13,249.9 | 3.3 | 25,025.9 | 20,897.1 | 2.0 |
| Carve 0.2 | prose | 31,069 | 6,989.7 | 6,120.1 | 4.4 | 7,726.8 | 6,007.3 | 4.0 |
| Carve 0.1 | prose | 31,069 | 7,784.3 | 6,571.2 | 4.0 | 13,051.1 | 11,202.2 | 2.4 |
| league/commonmark GFM | prose | 31,257 | 9,389.7 | 7,997.1 | 3.3 | 11,537.5 | 9,961.0 | 2.7 |
| php-collective/djot | prose | 31,069 | 5,135.8 | 4,225.8 | 6.0 | 6,788.9 | 5,903.2 | 4.6 |
| Carve 0.2 | lists-tables | 20,332 | 6,393.7 | 5,830.4 | 3.2 | 7,567.3 | 5,914.8 | 2.7 |
| Carve 0.1 | lists-tables | 20,332 | 18,514.9 | 15,264.0 | 1.1 | 24,621.5 | 21,418.3 | 0.8 |
| league/commonmark GFM | lists-tables | 20,513 | 9,820.7 | 8,814.3 | 2.1 | 12,161.8 | 11,123.7 | 1.7 |
| php-collective/djot | lists-tables | 20,420 | 5,439.6 | 4,361.2 | 3.8 | 6,984.7 | 6,116.6 | 2.9 |
| Carve 0.2 | reference-heavy | 20,617 | 5,273.3 | 3,981.1 | 3.9 | 5,214.8 | 3,906.1 | 4.0 |
| Carve 0.1 | reference-heavy | 20,617 | 12,174.4 | 10,593.9 | 1.7 | 16,903.5 | 15,475.7 | 1.2 |
| league/commonmark GFM | reference-heavy | 20,737 | 7,368.8 | 6,684.5 | 2.8 | 8,929.3 | 7,816.4 | 2.3 |
| php-collective/djot | reference-heavy | 20,617 | 3,850.9 | 3,338.7 | 5.4 | 4,904.7 | 4,351.4 | 4.2 |
| Carve 0.2 | 1mb | 1,095,785 | 381,089.3 | 349,943.0 | 2.9 | 586,578.0 | 536,067.8 | 1.9 |
| Carve 0.1 | 1mb | 1,095,785 | 2,331,000.4 | 2,054,549.2 | 0.5 | 4,554,568.5 | 4,063,301.7 | 0.2 |
| league/commonmark GFM | 1mb | 1,105,586 | 670,796.6 | 599,236.6 | 1.6 | 936,047.2 | 819,671.7 | 1.2 |
| php-collective/djot | 1mb | 1,096,577 | 247,790.9 | 218,154.1 | 4.4 | 399,938.4 | 325,736.5 | 2.7 |

## Engines

- JavaScript: Carve 0.2 0.2 (v2/src, 0.1.17 repo), Carve 0.1 0.1.17, markdown-it 15.0.0, commonmark.js 0.31.2, djot.js 0.3.2
- Rust: Carve 0.2 0.2 (carve2, v2/), Carve 0.1 carve-lang 0.1.14, pulldown-cmark 0.13.4, comrak 0.54.0, jotdown 0.10.0
- PHP, JIT off: Carve 0.2 0.2 (Carve2, v2/), Carve 0.1 carve-php 0.1.17+ (src/), league/commonmark GFM 2.10.7, php-collective/djot dev-master
- PHP, opcache.jit=tracing: Carve 0.2 0.2 (Carve2, v2/), Carve 0.1 carve-php 0.1.17+ (src/), league/commonmark GFM 2.10.7, php-collective/djot dev-master
