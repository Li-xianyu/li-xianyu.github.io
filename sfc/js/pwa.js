"use strict";

(function initPwaSupport() {
	if (window.location.protocol === "file:") {
		return;
	}

	let deferredPrompt = null;
	let installButton = null;

	function track(eventName, payload) {
		if (typeof window.trackEvent === "function") {
			window.trackEvent(eventName, payload);
		}
	}

	function isStandalone() {
		return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
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
			if (!deferredPrompt) {
				return;
			}

			deferredPrompt.prompt();

			try {
				const choice = await deferredPrompt.userChoice;
				track("pwa_install_prompt_result", {
					outcome: choice && choice.outcome ? choice.outcome : "unknown"
				});
			} catch (error) {
				console.warn("[PWA] install prompt failed", error);
			} finally {
				deferredPrompt = null;
				syncInstallButton();
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

		const canInstall = !!deferredPrompt && !isStandalone();
		button.hidden = !canInstall;
		button.classList.toggle("is-ready", canInstall);
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

	document.addEventListener("DOMContentLoaded", syncInstallButton);
	window.addEventListener("load", registerServiceWorker, { once: true });

	window.addEventListener("beforeinstallprompt", (event) => {
		event.preventDefault();
		deferredPrompt = event;
		syncInstallButton();
		track("pwa_install_available");
	});

	window.addEventListener("appinstalled", () => {
		deferredPrompt = null;
		syncInstallButton();
		track("pwa_installed");
	});
})();
