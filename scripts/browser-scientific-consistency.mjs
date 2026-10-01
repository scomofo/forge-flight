// Desktop real-component acceptance. Independent values come from displayed
// boundary tables and explicit fixture conditions, never hidden answer helpers.
import assert from "node:assert/strict";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createServer, build, preview } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
import { getLesson } from "../src/course/catalog.ts";
const root = resolve("."),
  built = process.env.ACCEPTANCE_BUILD === "1";
const out = resolve(
  `artifacts/scientific-consistency/${built ? "production" : "development"}`,
);
const entry = join(root, "__science_check.tsx"),
  html = join(root, "__science_check.html");
const buildDir = resolve("artifacts/science-check-build");
const cases = [],
  checks = [],
  failures = [];
let server, browser;
await mkdir(out, { recursive: true });
const url = (mode, key) =>
  `http://127.0.0.1:8097/__science_check.html?mode=${mode}&key=${encodeURIComponent(key)}`;
async function attempt(key, fn) {
  const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    }),
    page = await ctx.newPage(),
    errors = [];
  page.setDefaultTimeout(15000);
  page.on("pageerror", (e) => errors.push(e.message));
  const start = checks.length;
  const ok = (message, pass) => {
    checks.push({ key, message, pass: !!pass });
    assert.ok(pass, `${key}: ${message}`);
  };
  try {
    await fn(page, ok);
    ok("no uncaught browser errors", errors.length === 0);
    ok(
      "no horizontal overflow",
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    cases.push({ key, pass: true, checks: checks.length - start });
  } catch (e) {
    failures.push({
      key,
      error: String(e.stack || e),
      errors,
      text: await page
        .locator("body")
        .innerText()
        .catch(() => ""),
    });
    cases.push({ key, pass: false });
    await page
      .screenshot({ path: join(out, key + "-failure.png"), fullPage: true })
      .catch(() => {});
  } finally {
    await ctx.close();
  }
}
const radio = (page, group, name) =>
  page
    .getByRole("radiogroup", { name: group, exact: true })
    .getByRole("radio", { name, exact: true });
try {
  await writeFile(
    html,
    '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Science consistency</title></head><body><div id="root"></div><script type="module" src="/__science_check.tsx"></script></body></html>',
  );
  await writeFile(
    entry,
    `import React from 'react';import{createRoot}from'react-dom/client';import{createRootRoute,createRoute,createRouter,createMemoryHistory,RouterProvider,Outlet}from'@tanstack/react-router';
import{LessonView}from'./src/components/lesson-view';import{Bench}from'./src/components/bench';import{getLesson}from'./src/course/catalog';import{ProgressHydrator}from'./src/course/progress';import'./src/styles.css';
const q=new URLSearchParams(location.search),key=q.get('key')||'phaseset';const r=createRootRoute({component:()=> <><ProgressHydrator/><Outlet/></>});
const l=createRoute({getParentRoute:()=>r,path:'/learn/$trackId/$lessonId',component:()=>{const {trackId,lessonId}=l.useParams();return <LessonView lesson={getLesson(trackId,lessonId)!}/>} });
const b=createRoute({getParentRoute:()=>r,path:'/bench',component:()=> <main className="mx-auto max-w-3xl p-5"><Bench id={key as any}/></main>});
const t=createRoute({getParentRoute:()=>r,path:'/learn/$trackId',component:()=> <h1>Course</h1>});const j=createRoute({getParentRoute:()=>r,path:'/learn/job',component:()=> <h1>Job</h1>});const h=createRoute({getParentRoute:()=>r,path:'/',component:()=> <h1>Home</h1>});
const router=createRouter({routeTree:r.addChildren([l,b,t,j,h]),history:createMemoryHistory({initialEntries:[q.get('mode')==='lesson'?'/learn/'+key:'/bench']})});createRoot(document.getElementById('root')!).render(<RouterProvider router={router}/>);`,
  );
  const config = {
    configFile: false,
    root,
    cacheDir: "node_modules/.vite-science-check",
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": join(root, "src") } },
  };
  if (built) {
    await build({
      ...config,
      build: {
        outDir: buildDir,
        emptyOutDir: true,
        rolldownOptions: { input: html },
      },
    });
    server = await preview({
      ...config,
      build: { outDir: buildDir },
      preview: { host: "127.0.0.1", port: 8097, strictPort: true },
    });
  } else {
    server = await createServer({
      ...config,
      server: {
        host: "127.0.0.1",
        port: 8097,
        strictPort: true,
        hmr: false,
        watch: { ignored: ["**/artifacts/**", "**/.vercel/**"] },
      },
    });
    await server.listen();
  }
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  await attempt("phase-practical-visible-data", async (page, ok) => {
    await page.goto(url("bench", "phaseset"));
    await page
      .getByRole("button", { name: "Check this problem", exact: true })
      .waitFor();
    const problems = [
      {
        c: 20,
        r: "L + α",
        ends: ["α solid boundary", "Pb-side liquid boundary"],
      },
      { c: 70, r: "α + β", ends: ["α solvus", "β solvus"] },
      { c: 61.9, r: "Eutectic reaction (L + α + β)" },
      { c: 10, r: "α (Pb-rich solid)" },
      {
        c: 40,
        r: "L + α",
        ends: ["α solid boundary", "Pb-side liquid boundary"],
      },
      {
        c: 90,
        r: "L + β",
        ends: ["Sn-side liquid boundary", "β solid boundary"],
      },
    ];
    for (const [i, p] of problems.entries()) {
      ok(
        `problem ${i + 1}: solution tie hidden before marking`,
        (await page.locator("[data-phase-tie]").count()) === 0,
      );
      await radio(page, "Phase field", p.r).click();
      if (p.ends) {
        if (
          (await page
            .locator("[data-phase-boundaries]")
            .getAttribute("open")) === null
        )
          await page.locator("[data-phase-boundaries] summary").click();
        ok(
          `problem ${i + 1}: boundary data visible`,
          await page.locator("[data-phase-boundaries] table").isVisible(),
        );
        const rows = await page
          .locator("[data-phase-boundaries] tbody tr")
          .evaluateAll((ns) =>
            Object.fromEntries(
              ns.map((n) => [
                n.querySelector("th").textContent,
                Number(n.querySelector("td").textContent),
              ]),
            ),
          );
        const a = rows[p.ends[0]],
          b = rows[p.ends[1]],
          wa = (b - p.c) / (b - a),
          wb = 1 - wa;
        ok(
          `problem ${i + 1}: displayed data enclose overall composition`,
          a < p.c && p.c < b,
        );
        for (const [name, value] of [
          ["left end", a],
          ["right end", b],
          ["W low", wa],
          ["W high", wb],
        ])
          await page
            .getByRole("spinbutton", { name, exact: true })
            .fill(value.toFixed(5));
        if (i === 5) {
          await page
            .getByRole("spinbutton", { name: "W low", exact: true })
            .fill(wb.toFixed(5));
          await page
            .getByRole("spinbutton", { name: "W high", exact: true })
            .fill(wa.toFixed(5));
          await page
            .getByRole("button", { name: "Check this problem", exact: true })
            .click();
          ok(
            "reversed liquid/beta amounts rejected",
            (await page.locator("[data-phase-feedback]").innerText()).includes(
              "✗ Fractions",
            ),
          );
          await page
            .getByRole("spinbutton", { name: "W low", exact: true })
            .fill(wa.toFixed(5));
          await page
            .getByRole("spinbutton", { name: "W high", exact: true })
            .fill(wb.toFixed(5));
        }
      }
      await page
        .getByRole("button", { name: "Check this problem", exact: true })
        .click();
      const feedback = await page.locator("[data-phase-feedback]").innerText();
      ok(
        `problem ${i + 1}: independently read answer accepted`,
        !feedback.includes("✗") && feedback.includes("✓ Fractions"),
      );
      if (i === 2)
        ok("three-phase amounts not invented", feedback.includes("not fixed"));
      if (i === 5)
        await page
          .locator("main")
          .screenshot({ path: join(out, "tin-rich-grading.png") });
      await page
        .getByRole("button", {
          name: i === 5 ? "Back to problem 1" : "Next problem",
          exact: true,
        })
        .click();
    }
    ok(
      "all six solved",
      (await page.locator("main").innerText()).includes("6 of 6"),
    );
    await page
      .getByRole("button", { name: "Check this problem", exact: true })
      .click();
    ok(
      "blank entries are not zero answers",
      (await page.locator("[data-phase-feedback]").innerText()).includes(
        "✗ Tie line",
      ),
    );
  });
  await attempt("phase-boundaries-and-solidification", async (page, ok) => {
    await page.goto(url("bench", "phaseset"));
    await radio(page, "Mode", "Explore the diagram").click();
    await page
      .getByRole("slider", { name: /^Composition\s/ })
      .fill("100");
    await page
      .getByRole("slider", { name: /^Temperature\s/ })
      .fill("232");
    ok(
      "pure-component melting is not a fictitious unique amount",
      (await page.locator("main").innerText()).includes(
        "Coexisting phase amounts not uniquely fixed",
      ),
    );
    ok(
      "no zero-length tie",
      (await page.locator("[data-phase-tie]").count()) === 0,
    );
    await page
      .getByRole("slider", { name: /^Composition\s/ })
      .fill("90");
    await page
      .getByRole("slider", { name: /^Temperature\s/ })
      .fill("200");
    ok(
      "liquid stays at low-tin end",
      (await page.locator("main").innerText()).includes(
        "liquid 75.12 → β solid 98.37",
      ),
    );
    await page.goto(url("bench", "solidify"));
    await page
      .getByRole("slider", { name: /^Alloy composition\s/ })
      .waitFor();
    ok(
      "local model does not extrapolate to pure nickel",
      (await page
        .getByRole("slider", { name: /^Alloy composition\s/ })
        .getAttribute("max")) === "45",
    );
    await radio(
      page,
      "Composition comparison",
      "Compare first and final equilibrium solid",
    ).click();
    ok(
      "no invented quenched rim",
      (await page.locator("main").innerText()).includes(
        "does not predict a quenched rim",
      ),
    );
  });
  await attempt("stability-sign-and-target", async (page, ok) => {
    await page.goto(url("bench", "gliderprelab"));
    await page.locator("[data-stability-sketch]").waitFor();
    const options = [
      ["0.305", "Statically unstable (negative margin)"],
      ["0.3", "Neutral (zero margin)"],
      ["0.295", "Statically stable — below classroom target"],
      ["0.27", "Statically stable — within classroom target"],
      ["0.26", "Statically stable — above classroom target"],
    ];
    for (const [cg, label] of options) {
      await page
        .getByRole("slider", { name: /^CG from nose\s/ })
        .fill(cg);
      await radio(page, "Stability", label).click();
      await page
        .getByRole("spinbutton", { name: "Stall speed (m/s)", exact: true })
        .fill(String(Math.sqrt((2 * 0.25 * 9.81) / (1.225 * 0.06 * 1.1))));
      await page
        .getByRole("button", { name: "Check against model", exact: true })
        .click();
      ok(
        label,
        (await page.locator("[data-stability-feedback]").innerText()).includes(
          "Stability: ✓",
        ),
      );
    }
    await page
      .locator("main")
      .screenshot({ path: join(out, "static-margin-meaning.png") });
    await page
      .getByRole("slider", { name: /^CG from nose\s/ })
      .focus();
    await page.keyboard.press("ArrowRight");
    ok(
      "changing geometry clears stale feedback",
      (await page.locator("[data-stability-feedback]").count()) === 0,
    );
  });
  await attempt("bonding-qualified-families", async (page, ok) => {
    await page.goto(url("bench", "bondenergy"));
    await page.getByRole("button", { name: "Metallic", exact: true }).click();
    ok(
      "metallic ductility needs conditions",
      (await page.locator("main").innerText()).includes(
        "Needs material and conditions",
      ),
    );
    ok(
      "molar basis shown",
      (await page.locator("main").innerText()).includes("per mole of atoms"),
    );
    await page
      .getByRole("button", { name: "Covalent (network)", exact: true })
      .click();
    ok(
      "network not automatically insulating",
      (await page.locator("main").innerText()).includes(
        "Not determined by bond alone",
      ),
    );
    await page
      .getByRole("button", { name: "Secondary (dominant)", exact: true })
      .click();
    ok(
      "polymer transitions distinguished",
      (await page.locator("main").innerText()).includes(
        "Glass-transition softening, crystalline melting and chemical degradation are different",
      ),
    );
    await page
      .locator("main")
      .screenshot({ path: join(out, "bonding-family-conditions.png") });
  });
  await attempt("bonding-named-reference-bank", async (page, ok) => {
    await page.goto(url("bench", "bondpredict"));
    await radio(page, "Electrical", "Insulator").click();
    await page
      .getByRole("button", { name: "Reveal the reference", exact: true })
      .click();
    ok(
      "SiC insulator guess is not accepted",
      !(await page.locator("[data-bonding-reference]").innerText()).includes(
        "3 / 3",
      ) &&
        (await page.locator("[data-bonding-reference]").innerText()).includes(
          "Semiconductor",
        ),
    );
    await page.reload();
    const choices = [
      ["Semiconductor", "Brittle", "High-temperature resistance"],
      ["Conductor", "Ductile", "High melting point"],
      [
        "Insulator",
        "Soft / easy layer sliding",
        "Softening / degradation: distinguish the process",
      ],
      ["Insulates solid, conducts molten", "Brittle", "High melting point"],
      ["Insulator", "Brittle", "Low melting point"],
      ["Conductor", "Soft / easy layer sliding", "High-temperature resistance"],
    ];
    for (const [i, p] of choices.entries()) {
      for (const [j, group] of [
        "Electrical",
        "Mechanical",
        "Thermal",
      ].entries())
        await radio(page, group, p[j]).click();
      await page
        .getByRole("button", { name: "Reveal the reference", exact: true })
        .click();
      ok(
        `reference ${i + 1} correct`,
        (await page.locator("[data-bonding-reference]").innerText()).includes(
          "3 / 3",
        ),
      );
      await page
        .getByRole("button", {
          name: i === 5 ? "Finish" : "Next substance",
          exact: true,
        })
        .click();
    }
    ok(
      "qualitative bank completes 18/18",
      (await page.locator("main").innerText()).includes("18 / 18"),
    );
    await page.reload();
    ok(
      "corrected-bank best preserved on reload",
      (await page.evaluate(() =>
        localStorage.getItem("ff:bondpredict-reference-v2"),
      )) === "18",
    );
  });
  for (const key of [
    "materials/bondzoo",
    "materials/bondpacks",
    "materials/bondread",
    "materials/phasediagram",
    "materials/leverrule",
    "materials/transformations",
    "physics/lift",
  ])
    await attempt("lesson-" + key.replace("/", "-"), async (page, ok) => {
      await page.goto(url("lesson", key));
      const l = getLesson(...key.split("/"));
      await page.getByRole("heading", { name: l.title, exact: true }).waitFor();
      const text = await page.locator("article").innerText();
      if (key.startsWith("materials/bond")) {
        const labelBounds = await page.locator("article svg").first().evaluate(svg => {
          const frame = svg.getBoundingClientRect();
          return [...svg.querySelectorAll("text")].filter(node => {
            const r = node.getBoundingClientRect();
            return r.width > 0 && (r.left < frame.left - 1 || r.right > frame.right + 1);
          }).map(node => node.textContent);
        });
        ok(`intro figure text stays within SVG: ${labelBounds.join("; ")}`, labelBounds.length === 0);
      }
      ok(
        "legacy misinformation absent",
        !text.includes("broken wholesale") &&
          !text.includes("survives past 3500") &&
          !text.includes("same well depth gives"),
      );
      if (key === "materials/bondread")
        ok(
          "figure and reading agree on SiC",
          text.includes("silicon carbide: a semiconductor"),
        );
      if (key === "materials/bondpacks")
        ok(
          "tungsten condition explained",
          text.includes("rolled tungsten foil"),
        );
      if (key === "materials/bondread")
        await page
          .locator("article")
          .screenshot({ path: join(out, "bonding-reconciled-lesson.png") });
      await page.getByRole("tab", { name: /2 Try/ }).click();
      ok(
        "lesson embeds working activity",
        (await page
          .locator("article")
          .locator('svg,input,[role="radiogroup"]')
          .count()) > 0,
      );
      await page.getByRole("tab", { name: /3 Check/ }).click();
      for (const [i, q] of l.checks.entries()) {
        await page
          .locator("fieldset")
          .getByRole("button", { name: q.options[q.answer], exact: true })
          .click();
        ok(
          "authored revised answer grades correctly",
          await page.getByText("Yes.", { exact: true }).isVisible(),
        );
        await page
          .getByRole("button", {
            name: i === 3 ? "See the result" : "Next question",
            exact: true,
          })
          .click();
      }
      await page.getByText("4 of 4.", { exact: true }).waitFor();
    });
} catch (e) {
  failures.push({ key: "harness", error: String(e.stack || e) });
} finally {
  if (cases.length !== 12)
    failures.push({
      key: "coverage",
      error: `Expected 12 scenarios; got ${cases.length}`,
    });
  await writeFile(
    join(out, "results.json"),
    JSON.stringify(
      {
        mode: built ? "production-components" : "development-components",
        browser: browser?.version(),
        cases,
        checks,
        failures,
        scope:
          "Desktop real components, independent phase arithmetic from displayed boundary data; no hidden helper answer imports. Not physical validation, learner study or authenticated deployment.",
      },
      null,
      2,
    ),
  );
  await browser?.close();
  if (server?.close) await server.close();
  else if (server?.httpServer)
    await new Promise((done) => server.httpServer.close(done));
  await Promise.all([rm(entry, { force: true }), rm(html, { force: true })]);
}
console.log(
  JSON.stringify({
    cases: cases.length,
    checks: checks.length,
    failures: failures.length,
    out,
  }),
);
if (failures.length) process.exitCode = 1;
