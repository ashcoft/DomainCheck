// Wrapped in an IIFE so the helper declares nothing in the global scope that
// scripts share.
(() => {
	const { readFileSync, writeFileSync } = require("node:fs");

	const version = process.argv[2];
	if (!version) {
		console.error("Usage: node tools/set-version.cjs <version>");
		process.exit(1);
	}

	// semantic-release only produces plain release versions on this branch, and
	// the Chromium manifest rejects anything but dotted integers, so require
	// exactly that rather than accepting a prerelease suffix.
	if (!/^\d+\.\d+\.\d+$/.test(version)) {
		console.error(`Refusing to write invalid version: ${version}`);
		process.exit(1);
	}

	// package.json is parsed and re-serialised; its layout round-trips exactly.
	const pkg = JSON.parse(readFileSync("package.json", "utf8"));
	pkg.version = version;
	writeFileSync("package.json", `${JSON.stringify(pkg, null, "\t")}\n`);

	// The lockfile holds two project versions: the top-level one and the root
	// entry under "packages". Only those two are updated; every other version
	// belongs to a dependency and must stay untouched.
	const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
	lock.version = version;
	lock.packages[""].version = version;
	writeFileSync("package-lock.json", `${JSON.stringify(lock, null, "\t")}\n`);

	// The manifest keeps hand-written blank lines between sections, so replace
	// only the version value instead of re-serialising the whole file.
	const manifestPath = "platform/chromium/manifest.json";
	const manifest = readFileSync(manifestPath, "utf8");
	const versionField = /("version"\s*:\s*")[^"]*(")/;
	if (!versionField.test(manifest)) {
		throw new Error(`No version field found in ${manifestPath}`);
	}
	writeFileSync(manifestPath, manifest.replace(versionField, `$1${version}$2`));
})();
