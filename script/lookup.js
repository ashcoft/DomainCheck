/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Builds a link to the lookup website.
 *
 * The value is interpolated into the URL path, and it originates from the
 * lookup API and is read back out of the DOM, so it cannot be trusted. It is
 * encoded and placed as a single path segment instead of being concatenated
 * into the URL: a raw value could otherwise inject its own query, fragment or
 * even scheme, turning the link into a script URL. The result always stays on
 * the fixed lookup host.
 */
export function buildLookupUrl(baseUrl, path, value) {
	const url = new URL(baseUrl);
	url.pathname = `/${path}/${encodeURIComponent(String(value))}`;
	return url.href;
}
