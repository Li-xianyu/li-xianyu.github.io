"use strict";

(function () {
	const MANUAL_AGREED_KEY = "manualAgreed";
	const GUIDE_STATE_KEY = "HOME_ONBOARDING_INTRO_V1_STATE";
	let introRunning = false;

	function track(eventName, payload) {
		if (typeof window.trackEvent === "function") {
			window.trackEvent(eventName, payload);
		}
	}

	function getState() {
		return localStorage.getItem(GUIDE_STATE_KEY) || "";
	}

	function setState(state) {
		localStorage.setItem(GUIDE_STATE_KEY, state);
	}

	function emitFinished(state) {
		window.dispatchEvent(new CustomEvent("home:onboardingFinished", {
			detail: { state }
		}));
	}

	function canStart() {
		return !!localStorage.getItem(MANUAL_AGREED_KEY) && !getState() && !introRunning;
	}

	function buildSteps() {
		const steps = [
			{
				title: t("home.onboarding.introTitle"),
				intro: t("home.onboarding.introBody")
			}
		];

		const targets = [
			{
				selector: "#startGame",
				title: t("home.onboarding.startTitle"),
				intro: t("home.onboarding.startBody")
			},
			{
				selector: "#gameSettings",
				title: t("home.onboarding.settingsTitle"),
				intro: t("home.onboarding.settingsBody")
			},
			{
				selector: ".quick-dock-launcher",
				title: t("home.onboarding.dockTitle"),
				intro: t("home.onboarding.dockBody")
			},
			{
				selector: "#devLog",
				title: t("home.onboarding.devlogTitle"),
				intro: t("home.onboarding.devlogBody")
			}
		];

		targets.forEach((item) => {
			if (document.querySelector(item.selector)) {
				steps.push({
					element: item.selector,
					title: item.title,
					intro: item.intro
				});
			}
		});

		return steps;
	}

	function forceCleanupIntroArtifacts() {
		const orphanSelectors = [
			".introjs-overlay",
			".introjs-helperLayer",
			".introjs-tooltipReferenceLayer",
			".introjs-disableInteraction",
			".introjs-floatingElement"
		];

		orphanSelectors.forEach((selector) => {
			document.querySelectorAll(selector).forEach((node) => node.remove());
		});

		const flaggedNodes = document.querySelectorAll(
			".introjs-showElement, .introjs-relativePosition, .introjs-fixParent"
		);
		flaggedNodes.forEach((node) => {
			node.classList.remove("introjs-showElement", "introjs-relativePosition", "introjs-fixParent");
		});

		document.body.classList.remove("introjs-fixParent");
		document.documentElement.classList.remove("introjs-fixParent");
	}

	function startIntroGuide() {
		if (typeof window.introJs !== "function") {
			setState("unavailable");
			emitFinished("unavailable");
			return;
		}
		if (!canStart()) return;

		const steps = buildSteps();
		if (steps.length < 2) {
			setState("skipped");
			emitFinished("skipped");
			return;
		}

		const intro = window.introJs();
		introRunning = true;
		let finalized = false;
		let detachOverlayShake = null;

		const bindOverlayShake = () => {
			if (detachOverlayShake) return;

			const overlay = document.querySelector(".introjs-overlay");
			if (!overlay) return;

			const handleOverlayClick = () => {
				const tooltip = document.querySelector(".introjs-tooltip.home-intro-tooltip");
				if (!tooltip) return;

				if (typeof window.playDialogShake === "function") {
					window.playDialogShake(tooltip);
					return;
				}

				if (typeof tooltip.animate === "function") {
					tooltip.animate(
						[
							{ transform: "translateX(0)" },
							{ transform: "translateX(-5px)" },
							{ transform: "translateX(5px)" },
							{ transform: "translateX(-5px)" },
							{ transform: "translateX(5px)" },
							{ transform: "translateX(0)" }
						],
						{ duration: 500, easing: "ease" }
					);
				}
			};

			overlay.addEventListener("click", handleOverlayClick);
			detachOverlayShake = () => {
				overlay.removeEventListener("click", handleOverlayClick);
				detachOverlayShake = null;
			};
		};

		const finalize = (state, eventName) => {
			if (finalized) return;
			finalized = true;
			if (detachOverlayShake) detachOverlayShake();
			setState(state);
			emitFinished(state);
			track(eventName, { source: "introjs" });
			forceCleanupIntroArtifacts();
			introRunning = false;
		};

		intro.setOptions({
			tooltipClass: "home-intro-tooltip",
			highlightClass: "home-intro-highlight",
			nextLabel: t("home.onboarding.next"),
			prevLabel: t("home.onboarding.prev"),
			doneLabel: t("home.onboarding.done"),
			skipLabel: t("home.onboarding.skip"),
			showButtons: true,
			showProgress: true,
			exitOnOverlayClick: false,
			exitOnEsc: false,
			disableInteraction: true,
			scrollToElement: false,
			steps
		});

		intro.onafterchange(() => {
			bindOverlayShake();
		});

		intro.oncomplete(() => {
			finalize("completed", "home_onboarding_completed");
		});

		intro.onexit(() => {
			finalize("skipped", "home_onboarding_skipped");
		});

		track("home_onboarding_started", { source: "introjs" });

		try {
			intro.start();
			bindOverlayShake();
		} catch (err) {
			console.warn("[Onboarding] intro start failed", err);
			finalize("skipped", "home_onboarding_skipped");
		}
	}

	document.addEventListener("DOMContentLoaded", () => {
		forceCleanupIntroArtifacts();
		if (canStart()) {
			setTimeout(startIntroGuide, 220);
		}
	});

	window.addEventListener("home:manualAgreed", () => {
		if (canStart()) {
			setTimeout(startIntroGuide, 180);
		}
	});
})();
