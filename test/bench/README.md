# Browser benchmarks

Grid-level performance benchmarks for Tabulator, run in headless Chromium
through Playwright against a built `dist/`. They exist so that performance
pull requests can be judged on numbers from the same machine, same process
and same data, rather than on isolated micro-benchmarks.

They are **not tests**: nothing here fails a build. On a pull request labelled
`perf` the workflow in `.github/workflows/bench.yml` posts a comparison table
as a comment; on pushes to `master` it appends the numbers to the
`benchmarks` branch so trends can be tracked over time.

## Running locally

```sh
npm run build                       # produces dist/
npm run bench                       # benchmarks dist/ as "local", writes bench-results/local.json
```

To compare two builds, build each into its own checkout and pass both. A git
worktree is the easiest way to get a base build:

```sh
git worktree add ../tabulator-base master
(cd ../tabulator-base && npm ci && npm run build)

npm run bench -- --dist base=../tabulator-base/dist --dist head=dist
npm run bench:compare               # prints a markdown table from bench-results/{base,head}.json
```

Iterations of the builds are interleaved (base, head, base, head, ...) so
that machine noise hits both equally. Only ever compare builds from the same
run.

Useful options:

| Option | Default | Meaning |
|---|---|---|
| `--dist name=path` | `local=dist` | build to benchmark, repeatable |
| `--runs n` | 9 | measured iterations per case |
| `--warmup n` | 3 | discarded warm-up iterations per case |
| `--filter text` | | only scenarios whose id contains `text`, repeatable |
| `--tier n` | 1 | only scenarios of this tier |
| `--out dir` | `bench-results` | output directory |
| `--headed` | | show the browser |

Set `BENCH_CHROMIUM=/path/to/chrome` to use a specific Chromium binary instead
of the one bundled with the installed Playwright version.

## What is measured

Each scenario has an untimed `setup`, a `measure` phase and an untimed
`teardown`. Only the measure phase is timed, with `performance.now()` inside
the page. Tabulator renders synchronously inside `setSort`, `setFilter`,
`redraw` and the scroll handler, including any forced layouts, so the
synchronous timing captures the real cost without adding a frame of
`requestAnimationFrame` noise. Cold start is timed from `new Tabulator()` to
the `tableBuilt` event, which fires after the first render.

Around the measure phase the runner also snapshots Chromium's performance
counters (`LayoutCount`, `RecalcStyleCount`, `JSHeapUsedSize`, ...). Layout
count is a useful proxy for DOM thrash that pure JS timing misses.

Data is generated from a seeded PRNG so both builds see identical rows.

### Tier 1 (run on every `perf` pull request)

| Scenario | Cases | Metrics |
|---|---|---|
| `init-virtual` | 1k / 20k / 250k rows × 10 cols | `ms` to `tableBuilt` |
| `init-basic` | 500 / 2k rows × 10 cols, `renderVertical:"basic"` | `ms` to `tableBuilt` |
| `scroll-vertical` | 20k rows | `sweep_ms` (150 viewport steps), `jump_ms` (10 random jumps), `scroll_to_row_ms` |
| `sort` | 20k / 250k rows | `numeric_ms`, `numeric_reverse_ms`, `string_ms`, `multi_ms` (3 columns) |
| `filter` | 20k rows | `single_ms`, `clear_ms`, `multi_ms` (3 conditions), `header_keystrokes_ms` (5 progressive header-filter values) |
| `rerender` | 20k rows | `redraw_ms`, `replace_data_ms`, `update_data_ms` (1k rows), `add_data_ms` (1k rows), `delete_rows_ms` (50 single deletes), `delete_rows_blocked_ms` (50 under `blockRedraw`) |
| `wide` | 5k × 200 and 10k × 300 cols, `renderHorizontal` basic and virtual | `init_ms`, `hscroll_steps_ms` (40 × 200px wheel-style steps), `hscroll_jumps_ms` (5 random viewport-sized jumps) |

Guards (row counts in the DOM, active row counts after a filter, ...) are
recorded alongside the metrics as a sanity check that both builds did the
same work. They are not compared.

## Reading the comparison

`compare.mjs` flags a case only when both hold:

1. the median moved by more than the threshold (default 5%), and
2. the interquartile ranges of the two sample sets do not overlap.

Anything else is reported as unchanged. A 6% move whose samples overlap is
noise, not a result. If you want to know the noise floor of a machine, run
the same build twice under two names and compare them.

## Output

`run.mjs` writes one file per build to the output directory:

- `<name>.json`: full results with samples, summary statistics, counters and
  guards, plus a `meta` block (commit, Tabulator version, browser, runs).
- `<name>.gab.json`: the same medians in the `customSmallerIsBetter` format
  consumed by [github-action-benchmark](https://github.com/benchmark-action/github-action-benchmark)
  for the history on the `benchmarks` branch.

## Adding a scenario

Add an entry to `scenarios` in `scenarios.js` with `tier`, `description`,
`params` (one object per case), and `setup` / `measure` / `teardown`
functions. `measure` returns `{metrics, guards}`. Keep everything that is not
being measured in `setup`, and destroy the table in `teardown` so the page
stays clean between iterations. Metric names end in `_ms` unless they are
not milliseconds.
