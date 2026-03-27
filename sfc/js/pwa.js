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

	function getState() {
		return {
			canInstall: !!deferredPrompt,
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
		installButton.setAttribute("aria-label", "安装应用");
		installButton.title = "安装应用";
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
		const canInstall = state.canInstall && !state.isStandalone;
		button.hidden = !canInstall;
		button.classList.toggle("is-ready", canInstall);
	}

	function getInstallHelpCopy() {
		if (isIosSafari()) {
			return {
				title: "Safari 安装步骤",
				lead: "iPhone / iPad 推荐直接用 Safari。右上角固定悬浮菜单主要服务于支持直接安装的浏览器；iOS 请走 Safari 分享菜单。",
				steps: [
					"如果你现在不在 Safari，请先切到 Safari 打开当前页面",
					"点浏览器底部或顶部的“分享”按钮",
					"在菜单里选择“添加到主屏幕”",
					"确认后就能像本地 App 一样从桌面打开"
				]
			};
		}

		return {
			title: "安装步骤",
			lead: "如果右上角固定悬浮菜单里已经出现安装图标，优先点那个最省事。没看到的话，再按下面步骤从浏览器菜单安装。",
			steps: [
				"推荐先用 Chrome 或 Edge 打开当前页面",
				"打开浏览器菜单",
				"找到“安装应用 / Install app / 添加到桌面”之类的选项",
				"确认后就能从桌面或开始菜单直接打开"
			]
		};
	}

	function getBrowserAdviceCopy() {
		return {
			title: "浏览器建议",
			lead: "想稳定看到安装入口，优先用支持 PWA 的系统浏览器。",
			steps: [
				"Android / Windows / macOS：优先用 Chrome 或 Edge",
				"iPhone / iPad：优先用 Safari",
				"微信、QQ、微博等内置浏览器：先用“在浏览器打开”跳到系统浏览器",
				"如果装机入口没出现，先刷新一次页面，再看右上角固定悬浮菜单里有没有安装图标"
			]
		};
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
		confirmBtn.textContent = "知道了";
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
		confirmBtn.textContent = "知道了";
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
			return { ok: false, outcome: "manual_help" };
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
			await navigator.serviceWorker.register("./sw.js");
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
