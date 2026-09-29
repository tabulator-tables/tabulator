#!/usr/bin/env node
/*
 * Compare two benchmark result files produced by run.mjs and print a
 * markdown table (suitable for a PR comment).
 *
 *   node test/bench/compare.mjs bench-results/base.json bench-results/head.json
 *   node test/bench/compare.mjs base.json head.json --threshold 5 --out comment.md
 *
 * A case is flagged only when BOTH hold:
 *   1. the median moved by more than --threshold percent (default 5), and
 *   2. the interquartile ranges of the two sample sets do not overlap.
 * Everything else is reported as unchanged. This keeps the table honest on
 * noisy runners: a 6% move whose samples overlap is noise, not a result.
 */

import { readFileSync, writeFileSync } from "node:fs";

function parseArgs(argv){
	const args = {files:[], threshold:5, out:null, title:null};

	for(let i = 0; i < argv.length; i++){
		const arg = argv[i];

		switch(arg){
			case "--threshold": args.threshold = Number(argv[++i]); break;
			case "--out": args.out = argv[++i]; break;
			case "--title": args.title = argv[++i]; break;
			default:
				if(arg.startsWith("--")){
					throw new Error("Unknown argument: " + arg);
				}
				args.files.push(arg);
		}
	}

	if(args.files.length !== 2){
		console.error("Usage: node test/bench/compare.mjs <base.json> <head.json> [--threshold pct] [--out file.md]");
		process.exit(2);
	}

	return args;
}

function formatMs(v){
	if(!Number.isFinite(v)){
		return "n/a";
	}

	return v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
}

function formatPct(v){
	if(!Number.isFinite(v)){
		return "n/a";
	}

	return (v > 0 ? "+" : "") + v.toFixed(1) + "%";
}

function formatInt(v){
	return Number.isFinite(v) ? Math.round(v).toLocaleString("en-US") : "n/a";
}

function classify(base, head, threshold){
	const delta = ((head.median - base.median) / base.median) * 100;
	const overlap = !(head.q75 < base.q25 || head.q25 > base.q75);
	const significant = Math.abs(delta) > threshold && !overlap;

	let verdict = "unchanged";

	if(significant){
		verdict = delta < 0 ? "faster" : "slower";
	}

	return {delta, overlap, verdict};
}

function short(sha){
	return sha ? sha.slice(0, 7) : "?";
}

export function compare(base, head, options = {}){
	const threshold = options.threshold ?? 5;
	const baseById = new Map(base.results.map((r) => [r.id, r]));
	const rows = [];
	const counts = {faster:0, slower:0, unchanged:0, missing:0};

	for(const h of head.results){
		const b = baseById.get(h.id);

		if(!b){
			counts.missing++;
			rows.push({id:h.id, head:h, base:null, verdict:"new"});
			continue;
		}

		const c = classify(b, h, threshold);
		counts[c.verdict]++;
		rows.push({id:h.id, head:h, base:b, ...c});
	}

	return {rows, counts, threshold};
}

export function renderMarkdown(base, head, report, title){
	const icon = {faster:"🟢", slower:"🔴", unchanged:"⚪", new:"🆕"};
	const lines = [];

	lines.push(`### ${title || "Benchmark results"}`);
	lines.push("");
	lines.push(`**${base.meta.name}** \`${short(base.meta.sha)}\` vs **${head.meta.name}** \`${short(head.meta.sha)}\` · ${head.meta.runs} runs + ${head.meta.warmup} warm-up each · ${head.meta.browser} · ${head.meta.platform}`);
	lines.push("");
	lines.push(`${icon.faster} ${report.counts.faster} faster · ${icon.slower} ${report.counts.slower} slower · ${icon.unchanged} ${report.counts.unchanged} unchanged${report.counts.missing ? ` · ${icon.new} ${report.counts.missing} new` : ""}. Flagged when the median moves more than ${report.threshold}% and the interquartile ranges do not overlap.`);
	lines.push("");
	lines.push("| Benchmark | base p50 | head p50 | Δ p50 | base p95 | head p95 | layouts base → head | |");
	lines.push("|---|---:|---:|---:|---:|---:|---:|:--:|");

	for(const row of report.rows){
		const h = row.head;
		const b = row.base;
		const layouts = b && h.counters && "LayoutCount" in h.counters ? `${formatInt(b.counters.LayoutCount)} → ${formatInt(h.counters.LayoutCount)}` : "";

		if(!b){
			lines.push(`| \`${row.id}\` | | ${formatMs(h.median)} | | | ${formatMs(h.p95)} | ${layouts} | ${icon.new} |`);
			continue;
		}

		const delta = formatPct(row.delta);
		const cell = row.verdict === "unchanged" ? delta : `**${delta}**`;

		lines.push(`| \`${row.id}\` | ${formatMs(b.median)} | ${formatMs(h.median)} | ${cell} | ${formatMs(b.p95)} | ${formatMs(h.p95)} | ${layouts} | ${icon[row.verdict]} |`);
	}

	lines.push("");
	lines.push("<details><summary>How to read this</summary>");
	lines.push("");
	lines.push("- Times are milliseconds measured inside the page with `performance.now()`; lower is better.");
	lines.push("- p50 is the median across runs, p95 the 95th percentile. Iterations of base and head are interleaved in the same process on the same machine.");
	lines.push("- \"layouts\" is Chromium's `LayoutCount` delta during the measured phase, a proxy for DOM thrash that pure JS timing misses.");
	lines.push("- Run locally with `npm run bench -- --dist base=<path> --dist head=<path>` then `npm run bench:compare`.");
	lines.push("");
	lines.push("</details>");

	return lines.join("\n");
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;

if(isMain){
	const args = parseArgs(process.argv.slice(2));
	const base = JSON.parse(readFileSync(args.files[0], "utf8"));
	const head = JSON.parse(readFileSync(args.files[1], "utf8"));
	const report = compare(base, head, {threshold:args.threshold});
	const markdown = renderMarkdown(base, head, report, args.title);

	if(args.out){
		writeFileSync(args.out, markdown + "\n");
	}

	console.log(markdown);
}
