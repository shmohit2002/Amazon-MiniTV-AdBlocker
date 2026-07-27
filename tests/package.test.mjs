import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { after, test } from "node:test";

import {
  ALLOWED_FILES,
  buildPackage,
} from "../scripts/package.mjs";

const testRoot = resolve(".artifacts/package-test");

after(() => {
  rmSync(testRoot, { recursive: true, force: true });
});

test("release allowlist contains only runtime files", () => {
  assert.deepEqual(ALLOWED_FILES, [
    "files/i2.png",
    "files/ii3.png",
    "manifest.json",
    "popup.css",
    "popup.html",
    "tokens.css",
  ]);

  for (const path of ALLOWED_FILES) {
    assert.equal(path.split("/").some((segment) => segment.startsWith(".")), false);
  }
});

test("two builds produce the same bytes and runtime entries", () => {
  const first = buildPackage(resolve(testRoot, "first.zip"));
  const second = buildPackage(resolve(testRoot, "second.zip"));
  const firstBytes = readFileSync(first.outputPath);
  const secondBytes = readFileSync(second.outputPath);

  assert.deepEqual(firstBytes, secondBytes);
  assert.equal(first.sha256, second.sha256);

  for (const path of ALLOWED_FILES) {
    assert.equal(firstBytes.includes(Buffer.from(path)), true, `missing ${path}`);
  }

  for (const forbidden of [
    "background.js",
    "tests/",
    ".STATE.md",
    ".IMPROVEMENTS.md",
    ".RESEARCH.md",
    ".git/",
  ]) {
    assert.equal(
      firstBytes.includes(Buffer.from(forbidden)),
      false,
      `packaged forbidden path: ${forbidden}`,
    );
  }
});
