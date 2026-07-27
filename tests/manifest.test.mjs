import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));

test("ships a permission-free compatibility checkpoint", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.version, "0.2.0");
  assert.match(manifest.name, /paused/i);
  assert.match(manifest.description, /compatibility/i);

  for (const capability of [
    "permissions",
    "optional_permissions",
    "host_permissions",
    "optional_host_permissions",
    "background",
    "content_scripts",
    "declarative_net_request",
    "web_accessible_resources",
  ]) {
    assert.equal(
      Object.hasOwn(manifest, capability),
      false,
      `${capability} must stay absent while compatibility is unverified`,
    );
  }
});

test("opens only the local compatibility popup", () => {
  assert.deepEqual(manifest.action, {
    default_popup: "popup.html",
    default_title: "Compatibility paused",
  });
  assert.equal(existsSync(manifest.action.default_popup), true);
});

test("references packaged icons with extension-relative paths", () => {
  assert.deepEqual(manifest.icons, {
    32: "files/i2.png",
    48: "files/ii3.png",
  });

  for (const path of Object.values(manifest.icons)) {
    assert.equal(existsSync(path), true, `missing icon: ${path}`);
    assert.equal(path.startsWith("/"), false, `${path} must be relative`);
  }
});
