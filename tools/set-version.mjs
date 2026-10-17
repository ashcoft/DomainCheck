#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
if (!version) {
	console.error("Usage: node tools/set-version.js <version>");
	process.exit(1);
}

// The release version comes from semantic-release, which only ever produces
// plain semver, but reject anything else so it cannot end up in these files.
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
	console.error(`Refusing to write invalid version: ${version}`);
	process.exit(1);
}

// Only the first version field is bumped. Every other "version" entry in the
// lockfile belongs to a dependency and must stay untouched.
function replaceRootVersion(raw) {
	const pattern = /(^\s*"version":\s*")[^"]*(")/m;
	if (!pattern.test(raw)) {
		throw new Error("No version field found");
	}
	return raw.replace(pattern, `$1${version}$2`);
}

// The packaged extension reports its own version, so it must match the release.
for (const file of ["package.json", "package-lock.json", "platform/chromium/manifest.json"]) {
	writeFileSync(file, replaceRootVersion(readFileSync(file, "utf8")));
}
