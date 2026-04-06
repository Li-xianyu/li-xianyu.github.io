"use strict";

(function initPwaSupport() {
	if (window.location.protocol === "file:") {
		return;
	}

	let deferredPrompt = null;
	let installButton = null;
	const stateListeners = new Set();

	function track(eventName, payload) {
		if (typeof window.trackEvent === "function") {
			window.trackEvent(eventName, payload);
		}
	}

	function isStandalone() {
		return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
	}

	function isIos() {
		return /iphone|ipad|ipod/i.test(window.navigator.userAgent || "");
	}

	function isIosSafari() {
		const ua = window.navigator.userAgent || "";
		return isIos() && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
	}

	function getBrandNames() {
		const brands = window.navigator.userAgentData && Array.isArray(window.navigator.userAgentData.brands)
			? window.navigator.userAgentData.brands
			: [];
		return brands.map((item) => String(item && item.brand || "").toLowerCase());
	}

	function isChromiumInstallBrowser() {
		if (isIos()) {
			return false;
		}

		const ua = String(window.navigator.userAgent || "");
		const brands = getBrandNames();
		const byBrands = brands.some((name) => /chromium|chrome|edge|opera|vivaldi|brave/.test(name));
		const byUa = /(chrome|chromium|edg|opr|vivaldi|brave)/i.test(ua) && !/firefox/i.test(ua);
		return byBrands || byUa;
	}

	function getState() {
		return {
			canInstall: !!deferredPrompt,
			hasInstallEntry: (!!deferredPrompt || isChromiumInstallBrowser()) && !isStandalone(),
			needsManualInstall: !deferredPrompt && isChromiumInstallBrowser() && !isStandalone(),
			isChromiumInstallBrowser: isChromiumInstallBrowser(),
			isStandalone: isStandalone(),
			isIos: isIos(),
			isIosSafari: isIosSafari()
		};
	}

	function emitStateChange() {
		const state = getState();
		stateListeners.forEach((listener) => {
			try {
				listener(state);
			} catch (error) {
				console.warn("[PWA] state listener failed", error);
			}
		});

		window.dispatchEvent(new CustomEvent("pwa:statechange", { detail: state }));
	}

	function ensureInstallButton() {
		if (installButton) {
			return installButton;
		}

		const panel = document.querySelector(".quick-dock-panel");
		if (!panel) {
			return null;
		}

		installButton = document.createElement("button");
		installButton.type = "button";
		installButton.hidden = true;
		installButton.className = "quick-action-btn quick-action-install";
		installButton.setAttribute("aria-label", t("pwa.install.aria"));
		installButton.title = t("pwa.install.title");
		installButton.innerHTML = '<i class="bi bi-download" aria-hidden="true"></i>';
		installButton.addEventListener("click", async () => {
			const result = await promptInstall("quick_dock");
			if (!result.ok && result.outcome === "manual_help") {
				showInstallHelp("quick_dock");
			}
		});

		panel.appendChild(installButton);
		return installButton;
	}

	function syncInstallButton() {
		const button = ensureInstallButton();
		if (!button) {
			return;
		}

		const state = getState();
		button.hidden = !state.hasInstallEntry;
		button.classList.toggle("is-ready", state.canInstall && !state.isStandalone);
		if (typeof window.syncQuickDockLayout === "function") {
			window.syncQuickDockLayout(true);
		}
	}

	function getInstallHelpCopy() {
		if (isIosSafari()) {
			return getI18nValue("pwa.install.ios", { fallback: { title: "", lead: "", steps: [] } });
		}

		if (isChromiumInstallBrowser()) {
			return getI18nValue("pwa.install.chromium", { fallback: { title: "", lead: "", steps: [] } });
		}

		return getI18nValue("pwa.install.general", { fallback: { title: "", lead: "", steps: [] } });
	}

	function getBrowserAdviceCopy() {
		return getI18nValue("pwa.browserAdvice", { fallback: { title: "", lead: "", steps: [] } });
	}

	function showInstallHelp(source) {
		const copy = getInstallHelpCopy();
		const overlay = document.createElement("div");
		overlay.className = "punishment-overlay";

		const dialog = document.createElement("div");
		dialog.className = "punishment-dialog";

		const title = document.createElement("h3");
		title.className = "punishment-title";
		title.textContent = copy.title;

		const content = document.createElement("div");
		content.className = "punishment-content";
		content.innerHTML = `
			<div class="legal-disclaimer">
				<strong>${copy.title}</strong>
				<div>${copy.lead}</div>
				<ol class="install-help-list">
					${copy.steps.map((step) => `<li>${step}</li>`).join("")}
				</ol>
			</div>
		`;

		const actions = document.createElement("div");
		actions.className = "dialog-buttons";

		const confirmBtn = document.createElement("button");
		confirmBtn.type = "button";
		confirmBtn.className = "punishment-button";
		confirmBtn.id = "confirmRestart";
		confirmBtn.textContent = t("pwa.install.ok");
		confirmBtn.addEventListener("click", () => {
			overlay.remove();
		});

		actions.appendChild(confirmBtn);
		dialog.append(title, content, actions);
		overlay.appendChild(dialog);
		document.body.appendChild(overlay);

		overlay.addEventListener("click", (event) => {
			if (event.target === overlay && typeof window.playDialogShake === "function") {
				window.playDialogShake(confirmBtn);
			}
		});

		track("pwa_install_help_opened", {
			source: source || "unknown",
			platform: isIosSafari() ? "ios_safari" : "browser_menu"
		});
	}

	function showBrowserAdvice(source) {
		const copy = getBrowserAdviceCopy();
		const overlay = document.createElement("div");
		overlay.className = "punishment-overlay";

		const dialog = document.createElement("div");
		dialog.className = "punishment-dialog";

		const title = document.createElement("h3");
		title.className = "punishment-title";
		title.textContent = copy.title;

		const content = document.createElement("div");
		content.className = "punishment-content";
		content.innerHTML = `
			<div class="legal-disclaimer">
				<strong>${copy.title}</strong>
				<div>${copy.lead}</div>
				<ol class="install-help-list">
					${copy.steps.map((step) => `<li>${step}</li>`).join("")}
				</ol>
			</div>
		`;

		const actions = document.createElement("div");
		actions.className = "dialog-buttons";

		const confirmBtn = document.createElement("button");
		confirmBtn.type = "button";
		confirmBtn.className = "punishment-button";
		confirmBtn.id = "confirmRestart";
		confirmBtn.textContent = t("pwa.install.ok");
		confirmBtn.addEventListener("click", () => {
			overlay.remove();
		});

		actions.appendChild(confirmBtn);
		dialog.append(title, content, actions);
		overlay.appendChild(dialog);
		document.body.appendChild(overlay);

		overlay.addEventListener("click", (event) => {
			if (event.target === overlay && typeof window.playDialogShake === "function") {
				window.playDialogShake(confirmBtn);
			}
		});

		track("pwa_browser_advice_opened", {
			source: source || "unknown",
			platform: isIosSafari() ? "ios_safari" : "browser_menu"
		});
	}

	async function promptInstall(source) {
		if (isStandalone()) {
			return { ok: true, outcome: "already_installed" };
		}

		if (!deferredPrompt) {
			if (isChromiumInstallBrowser() || isIosSafari()) {
				return { ok: false, outcome: "manual_help" };
			}
			return { ok: false, outcome: "unsupported" };
		}

		track("pwa_install_prompt_opened", {
			source: source || "unknown"
		});

		deferredPrompt.prompt();

		try {
			const choice = await deferredPrompt.userChoice;
			const outcome = choice && choice.outcome ? choice.outcome : "unknown";
			track("pwa_install_prompt_result", {
				source: source || "unknown",
				outcome
			});
			return {
				ok: outcome === "accepted",
				outcome
			};
		} catch (error) {
			console.warn("[PWA] install prompt failed", error);
			return {
				ok: false,
				outcome: "failed"
			};
		} finally {
			deferredPrompt = null;
			syncInstallButton();
			emitStateChange();
		}
	}

	function onChange(listener) {
		if (typeof listener !== "function") {
			return function noop() {};
		}

		stateListeners.add(listener);
		listener(getState());

		return function unsubscribe() {
			stateListeners.delete(listener);
		};
	}

	async function registerServiceWorker() {
		if (!("serviceWorker" in navigator)) {
			return;
		}

		const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
		if (window.location.protocol !== "https:" && !isLocalhost) {
			return;
		}

		try {
			const registration = await navigator.serviceWorker.register("./sw.js", {
				updateViaCache: "none"
			});

			if (typeof registration.update === "function") {
				registration.update().catch((error) => {
					console.warn("[PWA] service worker update check failed", error);
				});
			}

		} catch (error) {
			console.warn("[PWA] service worker registration failed", error);
		}
	}

	window.PWAInstall = {
		getState,
		onChange,
		promptInstall,
		showInstallHelp,
		showBrowserAdvice,
		isStandalone
	};

	document.addEventListener("DOMContentLoaded", () => {
		syncInstallButton();
		emitStateChange();
	});

	window.addEventListener("load", registerServiceWorker, { once: true });

	window.addEventListener("beforeinstallprompt", (event) => {
		event.preventDefault();
		deferredPrompt = event;
		syncInstallButton();
		emitStateChange();
		track("pwa_install_available");
	});

	window.addEventListener("appinstalled", () => {
		deferredPrompt = null;
		syncInstallButton();
		emitStateChange();
		track("pwa_installed");
	});

	const standaloneQuery = window.matchMedia("(display-mode: standalone)");
	if (typeof standaloneQuery.addEventListener === "function") {
		standaloneQuery.addEventListener("change", () => {
			syncInstallButton();
			emitStateChange();
		});
	}
})();
