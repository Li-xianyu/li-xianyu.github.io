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
				title: "快速引导",
				intro: "这是一段首页上手引导，共 4 步。你会依次了解“开始游戏、设置、使用须知、开发日志”。建议先完整看一遍，再开始第一局。"
			}
		];

		const targets = [
			{
				selector: "#startGame",
				title: "开始游戏",
				intro: "从这里进入游戏主流程。点击后会先弹出“棋盘选择”，再选择“模式（DIY 或 SJ）”。重点建议：先到“游戏设置”完成基础配置再开局，体验会更稳定、更符合你的玩法。"
			},
			{
				selector: "#gameSettings",
				title: "游戏设置",
				intro: "这里是规则与内容中心。你可以调整任务权重、开关模块、维护自定义内容与棋盘。建议先完成一次基础设置，再回到首页开始游戏，这样每局抽到的内容会更符合你的玩法。"
			},
			{
				selector: ".quick-dock-launcher",
				title: "右上角快捷菜单",
				intro: "点击这里可以唤出右上角固定悬浮菜单。Chrome / Edge 这一系浏览器里，菜单会保留“安装”图标；如果没弹系统安装窗，就去浏览器菜单里选“安装”，不要选“快捷方式”。iPhone / iPad 则推荐用 Safari。"
			},
			{
				selector: "#devLog",
				title: "开发日志",
				intro: "这里记录版本更新与迭代内容。遇到“和之前不一样”的表现时，先看最近变更说明，通常能快速定位原因。你也可以通过这里判断是否有新功能值得开启。"
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
			nextLabel: "下一步",
			prevLabel: "上一步",
			doneLabel: "完成",
			skipLabel: "Skip",
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
