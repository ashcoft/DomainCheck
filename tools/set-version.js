#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
if (!version) {
	console.error("Usage: node tools/set-version.js <version>");
	process.exit(1);
}

// Keeps package.json and package-lock.json in sync without creating a git tag.
// semantic-release creates the tag itself after committing the version bump.
execFileSync("npm", ["version", version, "--no-git-tag-version", "--allow-same-version"], {
	stdio: "inherit",
});

// The packaged extension reports its own version, so it must match the release.
// Replace only the value to preserve the manifest's existing formatting.
const manifestPath = "platform/chromium/manifest.json";
const manifest = readFileSync(manifestPath, "utf8");
const versionPattern = /("version"\s*:\s*")[^"]*(")/;
if (!versionPattern.test(manifest)) {
	console.error(`Could not find a version field in ${manifestPath}`);
	process.exit(1);
}
writeFileSync(manifestPath, manifest.replace(versionPattern, `$1${version}$2`));
