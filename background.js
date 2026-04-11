/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
"use strict";

// in firefox, the background script is not allowed to use importScripts
// if getObjectFromLocalStorage is not defined, we are in firefox
if (typeof getObjectFromLocalStorage === "undefined") {
	importScripts('script/sentry.min.js', 'script/storage.js', 'script/country.js', 'script/parameters.js', 'script/domainflag.js');
}

const ipCacheStorageKey = "BackgroundIPCache";
const runtimeAlarms = {
	reachableCheck: { periodInMinutes: 5.0 },
	companySync: {
		periodInMinutes: 15.0,
		delayInMinutes: 0.5
	}
};

let ipCache = null;
let runtimeInitialization = null;

async function loadIPCache() {
	if (ipCache !== null) {
		return ipCache;
	}

	let storedCache = await getObjectFromSessionStorage(ipCacheStorageKey);
	if (typeof storedCache === "object" && storedCache !== null) {
		ipCache = storedCache;
	} else {
		ipCache = {};
	}

	return ipCache;
}

async function getCachedIP(domain) {
	if (typeof domain !== "string" || domain === "") {
		return undefined;
	}

	let cache = await loadIPCache();
	return cache[domain];
}

async function cacheIP(domain, ip) {
	if (typeof domain !== "string" || domain === "" || typeof ip !== "string" || ip === "") {
		return;
	}

	let cache = await loadIPCache();
	cache[domain] = ip;
	await saveObjectInSessionStorage({ [ipCacheStorageKey]: cache });
}

async function ensureAlarm(name, config) {
	await new Promise((resolve) => {
		chrome.alarms.get(name, function (alarm) {
			if (chrome.runtime.lastError) {
				df.processLastError();
				resolve();
				return;
			}

			if (typeof alarm === "undefined") {
				chrome.alarms.create(name, config);
			}
			resolve();
		});
	});
	df.processLastError();
}

async function ensureRuntimeAlarms() {
	for (const [name, config] of Object.entries(runtimeAlarms)) {
		await ensureAlarm(name, config);
	}
}

async function initializeRuntimeState() {
	await Promise.all([
		df.checkUUID(),
		df.getAPIDomain(),
		loadIPCache()
	]);
}

async function ensureServiceWorkerReady() {
	if (runtimeInitialization !== null) {
		return runtimeInitialization;
	}

	runtimeInitialization = (async function() {
		await ensureRuntimeAlarms();
		await initializeRuntimeState();
	})();

	try {
		await runtimeInitialization;
	}
	finally {
		runtimeInitialization = null;
	}
}

// set up listener on application installation, update and startup
chrome.alarms.onAlarm.addListener(df.schedule);
chrome.runtime.onInstalled.addListener(async function(details) {
	df.handleOnInstalled(details);
	await ensureServiceWorkerReady();
	await restoreAllTabs();
});
chrome.runtime.onUpdateAvailable.addListener(df.handleUpdate);
chrome.runtime.onStartup.addListener(async function() {
	await ensureServiceWorkerReady();
	await restoreAllTabs();
});

void ensureServiceWorkerReady();

// Fire if page is loading
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
	// request is being made
	if (changeInfo.status == 'loading' && typeof tab === "object" && tab !== null && typeof tab.url === "string" && tab.url !== "") {
		let data = { tab: tabId, url: tab.url };
		// get domain from url
		let domain = df.parseUrl(tab.url);
		// check if domain is in cache
		let cachedIP = await getCachedIP(domain);
		if (typeof cachedIP !== "undefined") {
			data.ip = cachedIP;
		}
		df.countryLookup(data);
	}
});

// Restore icons for existing tabs when the extension is installed, updated or the browser starts.
function restoreTabs(windows) {
	for (let windowID = 0; windowID < windows.length; windowID++) {
		for (let tab = 0; tab < windows[windowID].tabs.length; tab++) {
			let currentTab = windows[windowID].tabs[tab];
			if (typeof currentTab.url === "string" && currentTab.url !== "") {
				df.countryLookup({ tab: currentTab.id, url: currentTab.url });
			}
		}
	}
	df.processLastError();
}

async function restoreAllTabs() {
	await new Promise((resolve) => {
		chrome.windows.getAll({ populate: true }, function (windows) {
			if (chrome.runtime.lastError) {
				df.processLastError();
				resolve();
				return;
			}

			restoreTabs(windows);
			resolve();
		});
	});
}

chrome.runtime.onMessage.addListener(function (message, sender, senderResponse) {
	switch (message.type) {
		case "popup": {
			// parse url to a domain
			let domain = df.parseUrl(message.url);
			getCachedIP(domain).then(function (value) {
				senderResponse(value);
			}).catch(function () {
				senderResponse(undefined);
			});
			return true;
		}
		default:
			Sentry.withScope(function (scope) {
				scope.setExtra("request", message);
				scope.setExtra("sender", sender);
				Sentry.captureMessage("unknown runtime message");
			});
	}
	df.processLastError();
});

// Fire if page has loaded
chrome.webRequest.onResponseStarted.addListener(function (ret) {
	// only fire if tabId is set
	if (ret.tabId == -1) {
		return;
	}

	// only fire if IP is included in response
	if (typeof ret.ip == "undefined" || ret.ip == "") {
		return;
	}

	// parse url to a domain and add it to ipCache
	let domain = df.parseUrl(ret.url);
	void cacheIP(domain, ret.ip);

	// start lookup
	df.countryLookup({ tab: ret.tabId, url: ret.url, ip: ret.ip });

	// process errors
	df.processLastError();
}, {
	urls: ["<all_urls>"],
	types: ["main_frame"]
});
