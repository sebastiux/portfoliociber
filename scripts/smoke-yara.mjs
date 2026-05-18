import { compile, validate } from "@litko/yara-x";

const rule = `
rule SmokeTest_RedLineStrings {
  meta:
    author = "portfolio"
    severity = "high"
  strings:
    $a = "RedLine Stealer" ascii nocase
    $b = "Logs.zip" ascii
    $c = { 4D 5A 90 00 }  // MZ header
  condition:
    any of them
}

rule SmokeTest_NeverMatches {
  strings:
    $x = "definitely_not_in_payload_xyzzy"
  condition:
    $x
}
`;

const validation = validate(rule);
if (validation.errors.length) {
  console.error("compile errors:", validation.errors);
  process.exit(1);
}

const scanner = compile(rule);
scanner.setTimeout(5000);

const payload = Buffer.concat([
  Buffer.from([0x4d, 0x5a, 0x90, 0x00]),
  Buffer.from("preamble bytes "),
  Buffer.from("RedLine Stealer build_2024 Logs.zip exfil"),
  Buffer.from(" trailing"),
]);

const t0 = process.hrtime.bigint();
const matches = await scanner.scanAsync(payload);
const t1 = process.hrtime.bigint();

console.log(`scan_duration_ms=${Number(t1 - t0) / 1e6}`);
console.log(`payload_size=${payload.length}`);
console.log(`matches=${matches.length}`);

for (const m of matches) {
  console.log(`  rule=${m.ruleIdentifier} ns=${m.namespace} tags=${JSON.stringify(m.tags)}`);
  for (const md of m.matches) {
    console.log(`    pattern=${md.identifier} offset=${md.offset} len=${md.length}`);
  }
}

const expectMatch = matches.find((m) => m.ruleIdentifier === "SmokeTest_RedLineStrings");
const expectNoMatch = matches.find((m) => m.ruleIdentifier === "SmokeTest_NeverMatches");
if (!expectMatch) {
  console.error("FAIL: SmokeTest_RedLineStrings did not match");
  process.exit(1);
}
if (expectNoMatch) {
  console.error("FAIL: SmokeTest_NeverMatches should not have matched");
  process.exit(1);
}

console.log("OK: yara-x native bindings work on this platform");
