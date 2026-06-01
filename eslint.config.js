import globals from "globals";
import js from "@eslint/js";

export default [
	js.configs.recommended,
	{
		ignores: [
			"script/sentry.min.js",
			"script/background.js",
		],
	},
	{
		files: ["script/**/*.js"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.webextensions,
				chrome: "readonly",
				Sentry: "readonly",
				importScripts: "readonly",
			},
		},
		rules: {
			"no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"no-console": "off",
			"no-prototype-builtins": "off",
		},
	},
];
