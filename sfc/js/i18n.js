"use strict";

(function initI18n() {
	const STORAGE_KEY = "APP_LANGUAGE";
	const DEFAULT_LANGUAGE = "en";
	const SUPPORTED_LANGUAGES = ["en", "zh"];
	const dictionaries = window.__I18N_DICTIONARIES || {};

	function normalizeLanguage(lang) {
		const next = String(lang || "").toLowerCase();
		return SUPPORTED_LANGUAGES.includes(next) ? next : DEFAULT_LANGUAGE;
	}

	function detectBrowserLanguage() {
		const candidates = []
			.concat(Array.isArray(navigator.languages) ? navigator.languages : [])
			.concat([navigator.language, navigator.userLanguage, navigator.browserLanguage]);

		for (const candidate of candidates) {
			const value = String(candidate || "").toLowerCase().trim();
			if (!value) continue;
			if (value === "zh" || value.startsWith("zh-")) return "zh";
			if (value === "en" || value.startsWith("en-")) return "en";
		}

		return DEFAULT_LANGUAGE;
	}

	function getInitialLanguage() {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) return normalizeLanguage(saved);
		return detectBrowserLanguage();
	}

	let currentLanguage = getInitialLanguage();

	function getDictionary(lang = currentLanguage) {
		return dictionaries[normalizeLanguage(lang)] || {};
	}

	function getPathValue(source, path) {
		if (!path) return source;
		return String(path)
			.split(".")
			.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);
	}

	function formatTemplate(value, params = {}) {
		return String(value).replace(/\{(\w+)\}/g, (match, key) => {
			return params[key] !== undefined ? String(params[key]) : match;
		});
	}

	function getI18nValue(path, options = {}) {
		const primary = getPathValue(getDictionary(options.lang || currentLanguage), path);
		if (primary !== undefined) return primary;
		const fallback = getPathValue(getDictionary("zh"), path);
		if (fallback !== undefined) return fallback;
		return options.fallback;
	}

	function t(path, params = {}, fallback) {
		const value = getI18nValue(path, { fallback });
		if (typeof value !== "string") {
			return value !== undefined ? value : (fallback !== undefined ? fallback : path);
		}
		return formatTemplate(value, params);
	}

	function applyI18n(root = document) {
		const scope = root && typeof root.querySelectorAll === "function" ? root : document;
		document.documentElement.lang = t("meta.lang", {}, currentLanguage);

		scope.querySelectorAll("[data-i18n]").forEach((node) => {
			const key = node.getAttribute("data-i18n");
			node.textContent = t(key, {}, node.textContent);
		});

		scope.querySelectorAll("[data-i18n-html]").forEach((node) => {
			const key = node.getAttribute("data-i18n-html");
			node.innerHTML = t(key, {}, node.innerHTML);
		});

		scope.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
			const key = node.getAttribute("data-i18n-placeholder");
			node.setAttribute("placeholder", t(key, {}, node.getAttribute("placeholder") || ""));
		});

		scope.querySelectorAll("[data-i18n-title]").forEach((node) => {
			const key = node.getAttribute("data-i18n-title");
			node.setAttribute("title", t(key, {}, node.getAttribute("title") || ""));
		});

		scope.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
			const key = node.getAttribute("data-i18n-aria-label");
			node.setAttribute("aria-label", t(key, {}, node.getAttribute("aria-label") || ""));
		});

		scope.querySelectorAll("[data-i18n-value]").forEach((node) => {
			const key = node.getAttribute("data-i18n-value");
			const translated = t(key, {}, node.value || "");
			node.value = translated;
			node.setAttribute("value", translated);
		});

		scope.querySelectorAll("[data-i18n-content]").forEach((node) => {
			const key = node.getAttribute("data-i18n-content");
			node.setAttribute("content", t(key, {}, node.getAttribute("content") || ""));
		});
	}

	function setLanguage(lang, options = {}) {
		currentLanguage = normalizeLanguage(lang);
		localStorage.setItem(STORAGE_KEY, currentLanguage);
		document.documentElement.lang = t("meta.lang", {}, currentLanguage);

		if (options.reload) {
			window.location.reload();
			return currentLanguage;
		}

		applyI18n(document);
		window.dispatchEvent(new CustomEvent("i18n:change", {
			detail: { language: currentLanguage }
		}));
		return currentLanguage;
	}

	window.getLanguage = function getLanguage() {
		return currentLanguage;
	};

	window.getI18nValue = getI18nValue;
	window.t = t;
	window.setLanguage = setLanguage;
	window.toggleLanguage = function toggleLanguage() {
		return setLanguage(currentLanguage === "en" ? "zh" : "en", { reload: true });
	};
	window.applyI18n = applyI18n;

	document.addEventListener("DOMContentLoaded", () => {
		applyI18n(document);
	});
})();
