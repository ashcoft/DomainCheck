/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * HTTP Indicator Module
 * Based on https://github.com/pd4d10/http-indicator
 * Indicator for HTTP/2, QUIC and HTTP/3 protocols
 */

const httpIndicatorIcons = {
	default: "../images/http-indicator/default.png",
	h1: "../images/http-indicator/h1.png",
	"http/1.0": "../images/http-indicator/h1.png",
	"http/1.1": "../images/http-indicator/h1.png",
	h2: "../images/http-indicator/h2.png",
	h3: "../images/http-indicator/h3.png",
	hq: "../images/http-indicator/hq.png",
	spdy: "../images/http-indicator/spdy.png",
};

/**
 * Parse the nextHopProtocol value and return the icon key and label
 */
export function parseProtocol(protocol) {
	if (typeof protocol !== "string" || protocol === "") {
		return { key: "default", label: "Unknown", icon: httpIndicatorIcons.default };
	}

	// h2 and hq introduced from: https://developers.google.com/web/updates/2017/12/chrome-loadtimes-deprecated
	// Chrome 68+ uses values like "http/2+quic/43"
	// IANA TLS extension type values: https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml

	if (protocol === "hq") {
		return { key: "hq", label: "HTTP/2 + QUIC", icon: httpIndicatorIcons.hq };
	}

	if (protocol === "http/1.0") {
		return { key: "h1", label: "HTTP/1.0", icon: httpIndicatorIcons.h1 };
	}

	if (protocol === "http/1.1") {
		return { key: "h1", label: "HTTP/1.1", icon: httpIndicatorIcons.h1 };
	}

	// HTTP/3
	if (protocol.startsWith("h3")) {
		return { key: "h3", label: "HTTP/3", icon: httpIndicatorIcons.h3 };
	}

	// "h2" is HTTP/2 over TLS, "h2c" is HTTP/2 over TCP
	if (protocol.startsWith("h2")) {
		return { key: "h2", label: "HTTP/2", icon: httpIndicatorIcons.h2 };
	}

	// QUIC
	if (protocol.includes("quic")) {
		return { key: "hq", label: "QUIC", icon: httpIndicatorIcons.hq };
	}

	// SPDY: spdy/1, spdy/2, spdy/3
	if (protocol.startsWith("spdy")) {
		return { key: "spdy", label: "SPDY", icon: httpIndicatorIcons.spdy };
	}

	return { key: "default", label: protocol, icon: httpIndicatorIcons.default };
}

/**
 * Get HTTP indicator info from Performance Navigation Timing API
 */
export function getCurrentProtocol() {
	try {
		const entries = performance.getEntriesByType("navigation");
		if (entries.length === 0) {
			return null;
		}
		const navEntry = entries[0];
		if (typeof navEntry !== "object" || navEntry === null) {
			return null;
		}
		return navEntry.nextHopProtocol || null;
	}
	catch {
		return null;
	}
}

export const httpIndicator = {
	parseProtocol,
	getCurrentProtocol,
	icons: httpIndicatorIcons,
};
