/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import test from "node:test";
import assert from "node:assert/strict";

import { buildLookupUrl } from "../script/lookup.js";

const baseUrl = "https://domainflag.bella.network/";

test("buildLookupUrl keeps a plain IPv4 address intact", function() {
	assert.equal(
		buildLookupUrl(baseUrl, "ip", "8.8.8.8"),
		"https://domainflag.bella.network/ip/8.8.8.8",
	);
});

test("buildLookupUrl percent-encodes IPv6 colons", function() {
	assert.equal(
		buildLookupUrl(baseUrl, "ip", "2001:db8::1"),
		"https://domainflag.bella.network/ip/2001%3Adb8%3A%3A1",
	);
});

test("buildLookupUrl cannot escape the path segment", function() {
	const url = buildLookupUrl(baseUrl, "ip", "1.2.3.4/../../evil");

	assert.equal(new URL(url).pathname, "/ip/1.2.3.4%2F..%2F..%2Fevil");
	assert.equal(new URL(url).origin, "https://domainflag.bella.network");
});

test("buildLookupUrl cannot inject a query or fragment", function() {
	const queryUrl = new URL(buildLookupUrl(baseUrl, "ip", "8.8.8.8?redirect=https://evil.example"));
	const fragmentUrl = new URL(buildLookupUrl(baseUrl, "ip", "8.8.8.8#fragment"));

	assert.equal(queryUrl.search, "");
	assert.equal(queryUrl.hash, "");
	assert.equal(fragmentUrl.hash, "");
	assert.equal(fragmentUrl.pathname, "/ip/8.8.8.8%23fragment");
});

test("buildLookupUrl cannot switch to another scheme or host", function() {
	for (const value of ["javascript:alert(1)", "//evil.example/ip/1.2.3.4", "https://evil.example/"]) {
		const url = new URL(buildLookupUrl(baseUrl, "ip", value));

		assert.equal(url.protocol, "https:");
		assert.equal(url.host, "domainflag.bella.network");
	}
});

test("buildLookupUrl escapes characters that would break out of an HTML attribute", function() {
	const url = buildLookupUrl(baseUrl, "ip", '"onmouseover="alert(1)');

	assert.ok(!url.includes('"'));
	assert.ok(!url.includes("<"));
	assert.ok(!url.includes(">"));
});

test("buildLookupUrl handles the ASN path", function() {
	assert.equal(
		buildLookupUrl(baseUrl, "asn", "13335"),
		"https://domainflag.bella.network/asn/13335",
	);
});

test("buildLookupUrl always stays on the lookup host", function() {
	const url = new URL(buildLookupUrl(baseUrl, "ip", "8.8.8.8"));

	assert.equal(url.origin, "https://domainflag.bella.network");
});
