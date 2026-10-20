// 契约测试：清单、bundle patch、脱敏与密钥扫描。
// 运行：npm test（node --test）
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const pkg = JSON.parse(read("package.json"));

test("manifest is publishable", () => {
  assert.equal(pkg.license, "MIT");
  assert.match(pkg.name, /^@sunwindy\/dsh-tool-/u);
  assert.ok(pkg.peerDependencies?.["@deepseek-ai/dsh-tools"], "peerDependencies must declare dsh-tools");
  assert.equal(pkg.dependencies, undefined, "must not bundle dsh-tools as a dependency");
  assert.equal(pkg.dsh?.bundle?.patch, "./cordis.patch.yml");
  assert.match(pkg.repository?.url ?? "", /github\.com\/sunwindy91\/dsh-tool-baixiaochun/u);
  assert.ok(pkg.files.includes("LICENSE"));
  assert.ok(pkg.files.includes("README.md"));
});

test("bundle patch registers the package", () => {
  const patch = read("cordis.patch.yml");
  assert.match(patch, /id: baixiaochun/u);
  assert.match(patch, /name: '@sunwindy\/dsh-tool-baixiaochun'/u);
});

test("shipped source contains no personal paths or secrets", () => {
  const source = read("lib/index.js");
  assert.doesNotMatch(source, /C:\\Users|23017/iu);
  assert.doesNotMatch(source, /sk-[A-Za-z0-9]{10,}/u);
});

test("tool surface stays stable", () => {
  const source = read("lib/index.js");
  assert.match(source, /name: "baixiaochun"/u);
  for (const cmd of ["fortune", "lingqi", "xiuwei", "show", "hide", "toggle", "pet-status"]) {
    assert.ok(source.includes(cmd), `missing cmd ${cmd}`);
  }
});
