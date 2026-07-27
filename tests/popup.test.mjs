import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync("popup.html", "utf8");
const css = readFileSync("popup.css", "utf8");
const tokens = readFileSync("tokens.css", "utf8");
const normalizedHtml = html.replace(/\s+/g, " ");

test("states the paused behavior without an ad-blocking claim", () => {
  assert.match(normalizedHtml, /Compatibility paused/i);
  assert.match(normalizedHtml, /leaves every request and video untouched/i);
  assert.match(normalizedHtml, /Data sent.*None/i);
  assert.match(normalizedHtml, /Permissions.*0/i);
  assert.doesNotMatch(normalizedHtml, /100%|blocks? every ad|working now/i);
});

test("loads no script or remote presentation asset", () => {
  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /<(?:img|link|source)\b[^>]+(?:src|href)=["']https?:/i);
  assert.match(html, /href=["']popup\.css["']/i);
  assert.doesNotMatch(css, /https?:|@font-face/i);
  assert.doesNotMatch(tokens, /https?:|@font-face/i);
});

test("keeps the compact surface responsive and keyboard-visible", () => {
  assert.match(css, /html[\s\S]*overflow-x:\s*clip/i);
  assert.match(css, /body[\s\S]*overflow-x:\s*clip/i);
  assert.match(css, /:focus-visible/i);
  assert.match(css, /prefers-reduced-motion:\s*reduce/i);
  assert.match(html, /name=["']viewport["']/i);
});

test("routes every presentation value through local tokens", () => {
  assert.match(tokens, /--color-paper:\s*oklch\(/i);
  assert.match(tokens, /--font-display:/i);
  assert.match(tokens, /--space-md:/i);
  assert.match(css, /@import\s+url\(["']\.\/tokens\.css["']\)/i);
  assert.doesNotMatch(css, /(?:#(?:[0-9a-f]{3}){1,2}|rgba?\(|oklch\()/i);
});
