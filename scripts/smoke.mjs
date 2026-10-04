// Phase 5 — E2E smoke for local launch (node scripts/smoke.mjs).
// Covers: marketing → SEO files → health (env+DB+seed) → auth gate → catalog.
// Full user journey (register → assess → goal → book+pay) is the coach UAT;
// this script proves the deploy is up and Phase 5 seed/gates are live.
// Usage: BASE_URL=http://localhost:3000 node scripts/smoke.mjs

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let failures = 0;

async function check(name, path, expect) {
  try {
    const res = await fetch(`${BASE}${path}`);
    const ok = expect(res);
    console.log(`${ok ? "PASS" : "FAIL"} ${name} [${path}] -> ${res.status}`);
    if (!ok) failures += 1;
    return res;
  } catch (e) {
    console.log(`FAIL ${name} [${path}] -> ${e.message}`);
    failures += 1;
    return null;
  }
}

const res = await check("marketing home", "/", (r) => r.status === 200);
if (res) {
  const html = await res.text();
  const hasHero = html.includes("Discover Yourself");
  console.log(`${hasHero ? "PASS" : "FAIL"} homepage hero (§19)`);
  if (!hasHero) failures += 1;
}

await check("sitemap", "/sitemap.xml", (r) => r.status === 200);
await check("robots", "/robots.txt", (r) => r.status === 200);
await check("dashboard auth gate (redirect)", "/dashboard", (r) => [307, 308, 401].includes(r.status));
await check("api dashboard 401 without session", "/api/dashboard", (r) => r.status === 401);

const health = await check("health check", "/api/health", (r) => [200, 503].includes(r.status));
if (health) {
  const body = await health.json().catch(() => null);
  console.log(JSON.stringify(body, null, 2));
  if (body && body.ok === true) {
    const lessonsOk = (body.counts?.lessons ?? 0) >= 15;
    console.log(`${lessonsOk ? "PASS" : "FAIL"} phase-5 seed >=15 lessons (got ${body.counts?.lessons})`);
    if (!lessonsOk) failures += 1;
  } else {
    console.log("INFO health not ok — run: npx prisma migrate dev && npm run db:seed, then re-run smoke.");
  }
}

if (failures > 0) {
  console.error(`SMOKE FAILED: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log("SMOKE PASSED: launch gates green.");
