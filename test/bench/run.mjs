#!/usr/bin/env node
/*
 * Tabulator benchmark runner.
 *
 * Drives test/bench/bench.html in headless Chromium (via Playwright) against
 * one or more Tabulator builds and writes one JSON results file per build.
 *
 *   node test/bench/run.mjs                         # benchmark ./dist as "local"
 *   node test/bench/run.mjs --dist head=dist --dist base=../base/dist
 *   node test/bench/run.mjs --filter sort --runs 5 --warmup 1
 *
 * When several builds are given, iterations are interleaved (base, head,
 * base, head, ...) so that thermal drift and background noise on the machine
 * hit both builds equally. Always compare builds from the same run; never
 * compare against numbers recorded on another day or another machine.
 *
 * Options:
 *   --dist name=path   build to benchmark (repeatable). Default: local=./dist
 *   --out dir          output directory. Default: bench-results
 *   --runs n           measured iterations per case. Default: 9
 *   --warmup n         discarded warm-up iterations per case. Default: 3
 *   --filter text      only run scenarios whose id contains text (repeatable)
 *   --tier n           only run scenarios of this tier. Default: 1
 *   --headed           show the browser
 *
 * Set BENCH_CHROMIUM=/path/to/chrome to use a specific Chromium binary instead
 * of the one bundled with the installed Playwright version.
 */

import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

//////////////////////////////////////////////////
// CLI
//////////////////////////////////////////////////

function parseArgs(argv){
	const args = {dist:[], filter:[], runs:9, warmup:3, tier:1, out:"bench-results", headed:false};

	for(let i = 0; i < argv.length; i++){
		const arg = argv[i];
		const next = () => argv[++i];

		switch(arg){
			case "--dist": args.dist.push(next()); break;
			case "--out": args.out = next(); break;
			case "--runs": args.runs = Number(next()); break;
			case "--warmup": args.warmup = Number(next()); break;
			case "--filter": args.filter.push(next()); break;
			case "--tier": args.tier = Number(next()); break;
			case "--headed": args.headed = true; break;
			case "--help":
			case "-h":
				console.log(usage());
				process.exit(0);
				break;
			default:
				throw new Error("Unknown argument: " + arg);
		}
	}

	if(!args.dist.length){
		args.dist.push("local=dist");
	}

	args.builds = args.dist.map((spec) => {
		const eq = spec.indexOf("=");
		const name = eq > -1 ? spec.slice(0, eq) : "local";
		const path = resolve(eq > -1 ? spec.slice(eq + 1) : spec);

		return {name, path};
	});

	return args;
}

function usage(){
	return `Usage: node test/bench/run.mjs [--dist name=path]... [--out dir] [--runs n] [--warmup n] [--filter text] [--tier n] [--headed]`;
}

//////////////////////////////////////////////////
// Stats
//////////////////////////////////////////////////

function quantile(sorted, q){
	if(!sorted.length){
		return NaN;
	}

	const pos = (sorted.length - 1) * q;
	const lo = Math.floor(pos);
	const hi = Math.ceil(pos);

	return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function summarize(samples){
	const sorted = samples.slice().sort((a, b) => a - b);
	const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
	const variance = sorted.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(sorted.length - 1, 1);

	return {
		samples,
		n:sorted.length,
		min:sorted[0],
		max:sorted[sorted.length - 1],
		mean,
		stdev:Math.sqrt(variance),
		median:quantile(sorted, 0.5),
		q25:quantile(sorted, 0.25),
		q75:quantile(sorted, 0.75),
		p95:quantile(sorted, 0.95),
	};
}

//////////////////////////////////////////////////
// Chromium performance counters
//////////////////////////////////////////////////

const CDP_COUNTERS = ["LayoutCount", "RecalcStyleCount", "LayoutDuration", "RecalcStyleDuration", "ScriptDuration", "TaskDuration", "JSHeapUsedSize", "Nodes"];

async function readCounters(cdp){
	const {metrics} = await cdp.send("Performance.getMetrics");
	const out = {};

	for(const m of metrics){
		if(CDP_COUNTERS.includes(m.name)){
			out[m.name] = m.value;
		}
	}

	return out;
}

function counterDelta(before, after){
	const out = {};

	for(const key of CDP_COUNTERS){
		if(key in before && key in after){
			// heap and node count are levels, not counters: report the value after
			out[key] = (key === "JSHeapUsedSize" || key === "Nodes") ? after[key] : after[key] - before[key];
		}
	}

	// durations come back in seconds
	for(const key of ["LayoutDuration", "RecalcStyleDuration", "ScriptDuration", "TaskDuration"]){
		if(key in out){
			out[key] = out[key] * 1000;
		}
	}

	return out;
}

//////////////////////////////////////////////////
// Page setup
//////////////////////////////////////////////////

async function openBuild(browser, build){
	const css = join(build.path, "css", "tabulator.min.css");
	const js = join(build.path, "js", "tabulator.js");

	for(const file of [css, js]){
		if(!existsSync(file)){
			throw new Error(`Build "${build.name}" is missing ${file} (run npm run build first)`);
		}
	}

	const context = await browser.newContext({viewport:{width:1280, height:900}});
	const page = await context.newPage();

	page.on("pageerror", (err) => console.error(`[${build.name}] page error:`, err.message));
	page.on("console", (msg) => {
		if(msg.type() === "error" || msg.type() === "warning"){
			console.error(`[${build.name}] console.${msg.type()}:`, msg.text());
		}
	});

	await page.goto(pathToFileURL(join(here, "bench.html")).href);
	await page.addStyleTag({path:css});
	await page.addScriptTag({path:js});
	await page.addScriptTag({path:join(here, "scenarios.js")});

	const cdp = await context.newCDPSession(page);
	await cdp.send("Performance.enable");

	const version = await page.evaluate(() => window.__bench.version());

	return {build, context, page, cdp, version};
}

async function runIteration(target, scenarioId, params){
	const {page, cdp} = target;

	await page.evaluate(([id, p]) => window.__bench.setup(id, p), [scenarioId, params]);

	const before = await readCounters(cdp);
	const result = await page.evaluate(([id, p]) => window.__bench.measure(id, p), [scenarioId, params]);
	const after = await readCounters(cdp);

	await page.evaluate((id) => window.__bench.teardown(id), scenarioId);

	return {metrics:result.metrics, guards:result.guards || {}, counters:counterDelta(before, after)};
}

//////////////////////////////////////////////////
// Main
//////////////////////////////////////////////////

// The commit a build came from: git is asked from inside the dist folder, so a
// dist inside a worktree of the base branch reports the base commit.
function gitInfo(dir){
	const info = {sha:null, ref:null};
	const opts = {cwd:existsSync(dir) ? dir : repoRoot, stdio:["ignore", "pipe", "ignore"]};

	try{
		info.sha = execSync("git rev-parse HEAD", opts).toString().trim();
		info.ref = execSync("git rev-parse --abbrev-ref HEAD", opts).toString().trim();
	}catch(e){
		// not a git checkout; fine
	}

	return info;
}

function caseId(scenarioId, params){
	const parts = Object.keys(params).map((k) => `${k}=${params[k]}`);
	return `${scenarioId}[${parts.join(",")}]`;
}

function formatMs(v){
	return v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
}

async function main(){
	const args = parseArgs(process.argv.slice(2));
	const outDir = resolve(args.out);

	mkdirSync(outDir, {recursive:true});

	const launchOptions = {headless:!args.headed};

	if(process.env.BENCH_CHROMIUM){
		launchOptions.executablePath = process.env.BENCH_CHROMIUM;
	}

	const browser = await chromium.launch(launchOptions);
	const targets = [];

	try{
		for(const build of args.builds){
			targets.push(await openBuild(browser, build));
		}

		const scenarios = (await targets[0].page.evaluate(() => window.__bench.list()))
			.filter((s) => !args.tier || s.tier === args.tier)
			.filter((s) => !args.filter.length || args.filter.some((f) => s.id.includes(f)));

		if(!scenarios.length){
			throw new Error("No scenarios matched");
		}

		// per build: caseId -> { scenario, params, metrics: {name: [samples]}, guards, counters: {name: [samples]} }
		const collected = new Map(targets.map((t) => [t.build.name, new Map()]));

		console.log(`Benchmarking ${targets.map((t) => `${t.build.name} (${t.build.path}${t.version ? ", v" + t.version : ""})`).join(" vs ")}`);
		console.log(`${scenarios.length} scenarios, ${args.warmup} warm-up + ${args.runs} measured iterations each\n`);

		for(const scenario of scenarios){
			for(const params of scenario.params){
				const id = caseId(scenario.id, params);
				process.stdout.write(`${id} `);

				for(const target of targets){
					collected.get(target.build.name).set(id, {scenario:scenario.id, params, metrics:{}, guards:{}, counters:{}});
				}

				for(let iter = 0; iter < args.warmup + args.runs; iter++){
					const measured = iter >= args.warmup;

					for(const target of targets){
						const result = await runIteration(target, scenario.id, params);

						if(!measured){
							continue;
						}

						const entry = collected.get(target.build.name).get(id);

						for(const [name, value] of Object.entries(result.metrics)){
							(entry.metrics[name] ||= []).push(value);
						}

						for(const [name, value] of Object.entries(result.counters)){
							(entry.counters[name] ||= []).push(value);
						}

						entry.guards = result.guards;
					}

					process.stdout.write(measured ? "." : "w");
				}

				const summary = targets.map((t) => {
					const entry = collected.get(t.build.name).get(id);
					const first = Object.keys(entry.metrics)[0];
					return `${t.build.name} ${first}=${formatMs(summarize(entry.metrics[first]).median)}ms`;
				});

				console.log(`  ${summary.join(" | ")}`);
			}
		}

		for(const target of targets){
			const results = [];

			for(const [id, entry] of collected.get(target.build.name)){
				for(const [metric, samples] of Object.entries(entry.metrics)){
					const counters = {};

					for(const [name, values] of Object.entries(entry.counters)){
						counters[name] = summarize(values).median;
					}

					results.push({
						id:`${id}#${metric}`,
						scenario:entry.scenario,
						params:entry.params,
						metric,
						unit:"ms",
						...summarize(samples),
						guards:entry.guards,
						counters,
					});
				}
			}

			const git = gitInfo(target.build.path);
			const output = {
				meta:{
					name:target.build.name,
					dist:target.build.path,
					tabulatorVersion:target.version,
					sha:git.sha,
					ref:git.ref,
					date:new Date().toISOString(),
					runs:args.runs,
					warmup:args.warmup,
					tier:args.tier,
					node:process.version,
					browser:browser.version(),
					platform:`${process.platform} ${process.arch}`,
				},
				results,
			};

			const file = join(outDir, `${target.build.name}.json`);
			writeFileSync(file, JSON.stringify(output, null, "\t"));

			// github-action-benchmark "customSmallerIsBetter" format, for tracking over time
			const gab = results.map((r) => ({
				name:r.id,
				unit:"ms",
				value:Number(r.median.toFixed(3)),
				range:`±${(r.p95 - r.min).toFixed(3)}`,
				extra:`p95=${r.p95.toFixed(3)} min=${r.min.toFixed(3)} n=${r.n}`,
			}));
			writeFileSync(join(outDir, `${target.build.name}.gab.json`), JSON.stringify(gab, null, "\t"));

			console.log(`\nWrote ${file}`);
		}
	}finally{
		await browser.close();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
