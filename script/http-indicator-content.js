/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * HTTP Indicator Content Script
 * Based on https://github.com/pd4d10/http-indicator
 * Sends the HTTP protocol information to the background script
 */

(function() {
	// Only run once per page
	if (window.__httpIndicatorRun) {
		return;
	}
	window.__httpIndicatorRun = true;

	function sendProtocolInfo() {
		try {
			const entries = performance.getEntriesByType("navigation");
			if (entries.length === 0) {
				return;
			}
			const navEntry = entries[0];
			if (typeof navEntry !== "object" || navEntry === null) {
				return;
			}
			const protocol = navEntry.nextHopProtocol;
			if (typeof protocol === "string" && protocol !== "") {
				chrome.runtime.sendMessage(protocol);
			}
		}
		catch {
			// Silently ignore errors
		}
	}

	// Send protocol info when the page loads
	if (document.readyState === "complete") {
		sendProtocolInfo();
	}
	else {
		window.addEventListener("load", sendProtocolInfo);
	}
})();
