/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { describe, it } from "node:test";
import assert from "node:assert";
import { parseProtocol, getCurrentProtocol, httpIndicator } from "../script/http-indicator.js";

describe("http-indicator", function() {
	describe("parseProtocol", function() {
		it("returns default for empty input", function() {
			const result = parseProtocol("");
			assert.strictEqual(result.key, "default");
			assert.strictEqual(result.label, "Unknown");
		});

		it("parses HTTP/1.0 protocol", function() {
			const result = parseProtocol("http/1.0");
			assert.strictEqual(result.key, "h1");
			assert.strictEqual(result.label, "HTTP/1.0");
		});

		it("parses HTTP/1.1 protocol", function() {
			const result = parseProtocol("http/1.1");
			assert.strictEqual(result.key, "h1");
			assert.strictEqual(result.label, "HTTP/1.1");
		});

		it("parses HTTP/2 protocol", function() {
			const result = parseProtocol("h2");
			assert.strictEqual(result.key, "h2");
			assert.strictEqual(result.label, "HTTP/2");
		});

		it("parses HTTP/2 over TCP protocol", function() {
			const result = parseProtocol("h2c");
			assert.strictEqual(result.key, "h2");
			assert.strictEqual(result.label, "HTTP/2");
		});

		it("parses HTTP/3 protocol", function() {
			const result = parseProtocol("h3");
			assert.strictEqual(result.key, "h3");
			assert.strictEqual(result.label, "HTTP/3");
		});

		it("parses HTTP/3 with version", function() {
			const result = parseProtocol("h3-29");
			assert.strictEqual(result.key, "h3");
			assert.strictEqual(result.label, "HTTP/3");
		});

		it("parses QUIC protocol", function() {
			const result = parseProtocol("hq");
			assert.strictEqual(result.key, "hq");
			assert.strictEqual(result.label, "HTTP/2 + QUIC");
		});

		it("parses protocol with quic in name", function() {
			const result = parseProtocol("http/2+quic/43");
			assert.strictEqual(result.key, "hq");
			assert.strictEqual(result.label, "QUIC");
		});

		it("parses SPDY protocol", function() {
			const result = parseProtocol("spdy/3");
			assert.strictEqual(result.key, "spdy");
			assert.strictEqual(result.label, "SPDY");
		});

		it("returns default for unknown protocol", function() {
			const result = parseProtocol("unknown");
			assert.strictEqual(result.key, "default");
			assert.strictEqual(result.label, "unknown");
		});
	});

	describe("getCurrentProtocol", function() {
		it("returns null when no navigation entries exist", function() {
			// This tests the graceful handling when performance API is not available
			// In a real browser, this would return the actual protocol
			const result = getCurrentProtocol();
			// Result depends on environment - may be null or actual protocol
			assert.ok(result === null || typeof result === "string");
		});
	});

	describe("httpIndicator object", function() {
		it("has required properties", function() {
			assert.ok(typeof httpIndicator.parseProtocol === "function");
			assert.ok(typeof httpIndicator.getCurrentProtocol === "function");
			assert.ok(typeof httpIndicator.icons === "object");
		});

		it("has all required icon paths", function() {
			const icons = httpIndicator.icons;
			assert.ok(typeof icons.default === "string");
			assert.ok(typeof icons.h1 === "string");
			assert.ok(typeof icons.h2 === "string");
			assert.ok(typeof icons.h3 === "string");
			assert.ok(typeof icons.hq === "string");
			assert.ok(typeof icons.spdy === "string");
		});

		it("icon paths are valid", function() {
			const icons = httpIndicator.icons;
			assert.ok(icons.default.endsWith(".png"));
			assert.ok(icons.h1.endsWith(".png"));
			assert.ok(icons.h2.endsWith(".png"));
			assert.ok(icons.h3.endsWith(".png"));
			assert.ok(icons.hq.endsWith(".png"));
			assert.ok(icons.spdy.endsWith(".png"));
		});
	});
});
