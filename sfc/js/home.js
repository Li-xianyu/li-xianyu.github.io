"use strict";

const MANUAL_AGREED_KEY = "manualAgreed";
const GUIDE_STATE_KEY = "HOME_ONBOARDING_INTRO_V1_STATE";
const LEGACY_INSTALL_ENTRY_HINT_KEY = "HOME_INSTALL_ENTRY_HINT_V1";
const INSTALL_PROMPT_DISMISSED_KEY = "HOME_INSTALL_PROMPT_DISMISSED_V1";

let installEntryHintTimer = 0;
let installEntryHintHandledThisSession = false;

function track(eventName, payload){
	if (typeof window.trackEvent === "function"){
		window.trackEvent(eventName, payload);
	}
}

function initHeroSubtitleTicker(){
	const subtitle = document.querySelector('.hero-subtitle');
	if (!subtitle) return;

	const lines = getI18nValue("home.hero.lines", {
		fallback: [t("home.hero.subtitle")]
	});

	let index = 0;
	let isSliding = false;
	const animationDuration = 500;
	const intervalDuration = 3200;

	const currentLine = document.createElement('span');
	currentLine.className = 'hero-subtitle-line is-current';
	currentLine.textContent = lines[index];

	const nextLine = document.createElement('span');
	nextLine.className = 'hero-subtitle-line is-next';

	subtitle.textContent = '';
	subtitle.append(currentLine, nextLine);

	if (lines.length < 2) return;

	const pickNextRandomIndex = () => {
		if (lines.length < 2) return index;
		let nextIndex = index;
		while (nextIndex === index) {
			nextIndex = Math.floor(Math.random() * lines.length);
		}
		return nextIndex;
	};

	const slideTo = (nextIndex) => {
		if (isSliding) return;
		isSliding = true;

		nextLine.textContent = lines[nextIndex];
		subtitle.classList.add('is-sliding');

		window.setTimeout(() => {
			subtitle.classList.add('is-resetting');
			currentLine.textContent = lines[nextIndex];
			nextLine.textContent = '';
			subtitle.classList.remove('is-sliding');
			index = nextIndex;

			window.requestAnimationFrame(() => {
				window.requestAnimationFrame(() => {
					subtitle.classList.remove('is-resetting');
					isSliding = false;
				});
			});
		}, animationDuration);
	};

	window.setInterval(() => {
		slideTo(pickNextRandomIndex());
	}, intervalDuration);
}

function initPwaInstallSpotlight(){
	const spotlight = document.getElementById('installSpotlight');
	const dismissBtn = document.getElementById('installSpotlightDismiss');
	const descEl = document.getElementById('installSpotlightDesc');
	const actionBtn = document.getElementById('installSpotlightAction');
	const guideBtn = document.getElementById('installSpotlightGuide');

	if (!spotlight || !dismissBtn || !descEl || !actionBtn || !guideBtn || !window.PWAInstall){
		return;
	}

	function applyState(state){
		if (!state || state.isStandalone || isInstallPromptDismissed()){
			spotlight.hidden = true;
			return;
		}

		spotlight.hidden = false;
		guideBtn.textContent = t("home.installSpotlight.guide");

		if (state.canInstall){
			descEl.textContent = t("home.installSpotlight.descCanInstall");
			actionBtn.textContent = t("home.installSpotlight.actionInstall");
			return;
		}

		if (state.hasInstallEntry && state.needsManualInstall){
			descEl.textContent = t("home.installSpotlight.descManualInstall");
			actionBtn.textContent = t("home.installSpotlight.actionHelp");
			return;
		}

		if (state.isIosSafari){
			descEl.textContent = t("home.installSpotlight.descIosSafari");
			actionBtn.textContent = t("home.installSpotlight.actionHelp");
			return;
		}

		descEl.textContent = t("home.installSpotlight.descUnsupported");
		actionBtn.textContent = t("home.installSpotlight.actionHelp");
	}

	actionBtn.addEventListener('click', async () => {
		track('pwa_hero_action_clicked');
		const result = await window.PWAInstall.promptInstall('hero_spotlight');
		if (!result.ok && typeof window.PWAInstall.showInstallHelp === 'function'){
			window.PWAInstall.showInstallHelp('hero_spotlight');
		}
	});

	guideBtn.addEventListener('click', () => {
		track('pwa_hero_help_clicked');
		if (typeof window.PWAInstall.showBrowserAdvice === 'function'){
			window.PWAInstall.showBrowserAdvice('hero_spotlight');
			return;
		}
		if (typeof window.PWAInstall.showInstallHelp === 'function'){
			window.PWAInstall.showInstallHelp('hero_spotlight');
		}
	});

	dismissBtn.addEventListener('click', () => {
		dismissInstallPrompts('hero_spotlight');
	});

	window.PWAInstall.onChange(applyState);
}

function isInstallPromptDismissed(){
	return localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === "1";
}

function dismissInstallPrompts(source){
	if (installEntryHintTimer){
		window.clearTimeout(installEntryHintTimer);
		installEntryHintTimer = 0;
	}

	installEntryHintHandledThisSession = true;
	localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "1");
	track("pwa_install_prompt_dismissed", {
		source: source || "unknown"
	});

	const spotlight = document.getElementById('installSpotlight');
	if (spotlight){
		spotlight.hidden = true;
	}
}

function isHomeOnboardingPending(){
	return !localStorage.getItem(GUIDE_STATE_KEY);
}

function openQuickDockForInstallHint(){
	const launcher = document.querySelector(".quick-dock-launcher");
	if (!launcher) return;

	const dock = document.querySelector(".quick-dock");
	if (!dock || !dock.classList.contains("open")){
		launcher.click();
	}

	window.setTimeout(() => {
		const installBtn = document.querySelector(".quick-action-install:not([hidden])");
		const target = installBtn || launcher;
		if (target && typeof target.focus === "function"){
			try{
				target.focus({ preventScroll: true });
			}catch(err){
				target.focus();
			}
		}
		if (target && typeof window.playDialogShake === "function"){
			window.playDialogShake(target);
		}
	}, 90);
}

function createInstallEntryHintDialog(trigger){
	const overlay = document.createElement("div");
	overlay.className = "punishment-overlay";

	const dialog = document.createElement("div");
	dialog.className = "punishment-dialog";

	const title = document.createElement("h3");
	title.className = "punishment-title";
	title.textContent = t("home.installHint.title");

	const content = document.createElement("div");
	content.className = "punishment-content";
	content.innerHTML = `
		<div class="legal-disclaimer">
			<strong>${t("home.installHint.heading")}</strong>
			<div>${t("home.installHint.body1")}</div>
			<div style="margin-top:8px;">${t("home.installHint.body2")}</div>
		</div>
	`;

	const buttonContainer = document.createElement("div");
	buttonContainer.className = "dialog-buttons";

	const openMenuBtn = document.createElement("button");
	openMenuBtn.className = "punishment-button";
	openMenuBtn.id = "confirmRestart";
	openMenuBtn.textContent = t("common.actions.openMenu");

	const closeBtn = document.createElement("button");
	closeBtn.className = "punishment-button";
	closeBtn.id = "cancelRestart";
	closeBtn.textContent = t("common.actions.knowIt");

	openMenuBtn.addEventListener("click", () => {
		track("pwa_install_entry_hint_open_menu", { trigger });
		overlay.remove();
		openQuickDockForInstallHint();
	});

	closeBtn.addEventListener("click", () => {
		track("pwa_install_entry_hint_dismissed", { trigger });
		overlay.remove();
	});

	buttonContainer.append(openMenuBtn, closeBtn);
	dialog.append(title, content, buttonContainer);
	overlay.appendChild(dialog);

	overlay.addEventListener("click", (event) => {
		if (event.target === overlay && typeof window.playDialogShake === "function"){
			window.playDialogShake(openMenuBtn);
		}
	});

	return overlay;
}

function canShowInstallEntryHint(){
	if (installEntryHintHandledThisSession) return false;
	if (isInstallPromptDismissed()) return false;
	if (!localStorage.getItem(MANUAL_AGREED_KEY)) return false;
	if (isHomeOnboardingPending()) return false;
	if (!window.PWAInstall || typeof window.PWAInstall.getState !== "function") return false;

	const state = window.PWAInstall.getState();
	return !!state && !!state.hasInstallEntry && !state.isStandalone;
}

function maybeShowInstallEntryHint(trigger){
	if (!canShowInstallEntryHint()) return;

	installEntryHintHandledThisSession = true;
	track("pwa_install_entry_hint_shown", { trigger });
	document.body.appendChild(createInstallEntryHintDialog(trigger));
}

function scheduleInstallEntryHint(trigger, delay = 240){
	if (installEntryHintHandledThisSession || isInstallPromptDismissed()) return;

	if (installEntryHintTimer){
		window.clearTimeout(installEntryHintTimer);
	}

	installEntryHintTimer = window.setTimeout(() => {
		installEntryHintTimer = 0;
		maybeShowInstallEntryHint(trigger);
	}, delay);
}

function initInstallEntryHintFlow(){
	if (!window.PWAInstall) return;
	localStorage.removeItem(LEGACY_INSTALL_ENTRY_HINT_KEY);

	window.PWAInstall.onChange((state) => {
		if (state && state.canInstall && !state.isStandalone){
			scheduleInstallEntryHint("pwa_state_change", 220);
		}
	});

	window.addEventListener("home:manualAgreed", () => {
		scheduleInstallEntryHint("manual_agreed", 260);
	});

	window.addEventListener("home:onboardingFinished", () => {
		scheduleInstallEntryHint("onboarding_finished", 280);
	});

	if (localStorage.getItem(MANUAL_AGREED_KEY)) {
		scheduleInstallEntryHint("home_ready", 420);
	}
}

function createManualDialog(){
	const overlay = document.createElement('div');
	overlay.className = 'punishment-overlay';

	const dialog = document.createElement('div');
	dialog.className = 'punishment-dialog';

	const title = document.createElement('h3');
	title.className = 'punishment-title';
	title.textContent = t("home.manualDialog.title");

	const content = document.createElement('div');
	content.className = 'punishment-content';
	content.innerHTML = `<div class="legal-disclaimer">${t("home.manualDialog.bodyHtml")}</div>`;


	const buttonContainer = document.createElement('div');
	buttonContainer.className = 'dialog-buttons';

	const confirmBtn = document.createElement('button');
	confirmBtn.className = 'punishment-button';
	confirmBtn.id = 'confirmRestart';
	confirmBtn.textContent = t("home.manualDialog.accept");

	const cancelBtn = document.createElement('button');
	cancelBtn.className = 'punishment-button';
	cancelBtn.id = 'cancelRestart';
	cancelBtn.textContent = t("home.manualDialog.reject");

	buttonContainer.append(confirmBtn, cancelBtn);
	dialog.append(title, content, buttonContainer);
	overlay.appendChild(dialog);

	const handleConfirm = () => {
		localStorage.setItem(MANUAL_AGREED_KEY,'true');
		track("manual_agreed");
		overlay.remove();
		window.dispatchEvent(new CustomEvent('home:manualAgreed'));
		confirmBtn.removeEventListener('click', handleConfirm);
		cancelBtn.removeEventListener('click', handleCancel);
	};

	const handleCancel = () => {
		track("manual_rejected");
		confirmBtn.removeEventListener('click', handleConfirm);
		cancelBtn.removeEventListener('click', handleCancel);

		clearPageContent();

		try{
			window.open('', '_self').close();
			if (window.history.length > 1) window.close();
			else window.location.href = 'about:blank';
		}catch(e){
			document.querySelectorAll('*').forEach(n => n.remove());
		}

		setTimeout(() => window.location.replace('about:blank'), 3000);
	};

	confirmBtn.addEventListener('click', handleConfirm);
	cancelBtn.addEventListener('click', handleCancel);

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay){
			playDialogShake(confirmBtn);
		}
	});

	return overlay;
}

/* ========= Exit cleanup ========= */
function clearPageContent(){
	localStorage.clear();
	sessionStorage.clear();

	try{
		if (indexedDB && indexedDB.databases){
			indexedDB.databases().then(dbs => {
				dbs.forEach(db => indexedDB.deleteDatabase(db.name));
			});
		}
	}catch(e){}

	document.documentElement.style.overflow = 'hidden';
	while(document.body.firstChild){
		document.body.removeChild(document.body.firstChild);
	}

	const exitOverlay = document.createElement('div');
	exitOverlay.innerHTML = `
		<div class="exit-overlay">
			<div class="exit-message">
				<h3>${t("home.exit.title")}</h3>
				<p>${t("home.exit.desc")}</p>
			</div>
		</div>
	`;
	document.body.appendChild(exitOverlay);

	document.body.style.pointerEvents = 'none';
	window.onbeforeunload = null;
	window.stop();
}

/* ========= Boards / modes ========= */
function getMaxGrid(board){
	return Math.max(...board.flat(2).filter(n => n > 0));
}

function getCustomBoards(){
	try{
		const raw = JSON.parse(localStorage.getItem("CUSTOM_BOARDS") || "[]");
		return Array.isArray(raw) ? raw : [];
	}catch(err){
		console.error("[Home] Failed to read custom boards", err);
		return [];
	}
}

function getBuiltInBoardOptions(){
	return Boards.map((board, index) => ({
		type: "builtin",
		token: `builtin:${index + 1}`,
		name: getLocalizedBoardMeta(index).name || `Board ${index + 1}`,
		desc: getLocalizedBoardMeta(index).desc || "",
		steps: getMaxGrid(board),
		board
	}));
}

function getCustomBoardOptions(){
	return getCustomBoards().map(item => ({
		type: "custom",
		token: `custom:${item.id}`,
		name: item.name || t("createBoards.defaultBoardName"),
		desc: item.desc || "",
		steps: item.steps || getMaxGrid(item.board || []),
		board: item.board || []
	}));
}

function createBoardDialog(){
	const builtInBoards = getBuiltInBoardOptions();
	const customBoards = getCustomBoardOptions();

	const overlay = document.createElement('div');
	overlay.className = 'punishment-overlay';

	const dialog = document.createElement('div');
	dialog.className = 'board-dialog';

	const title = document.createElement('h3');
	title.className = 'punishment-title';
	title.textContent = t("home.boardDialog.title");

	const segmented = document.createElement('div');
	segmented.className = 'board-segmented';
	segmented.innerHTML = `
		<button class="board-seg-btn active" type="button" data-tab="builtin">${t("home.boardDialog.tabBuiltin")}</button>
		<button class="board-seg-btn" type="button" data-tab="custom">${t("home.boardDialog.tabCustom")}</button>
		<div class="board-seg-indicator"></div>
	`;

	const listContainer = document.createElement('div');
	listContainer.className = 'board-list';
	track("board_picker_opened");

	function renderBoardList(tab){
		const list = tab === "custom" ? customBoards : builtInBoards;
		listContainer.innerHTML = "";

		if (!list.length){
			const empty = document.createElement("div");
			empty.className = "board-empty";
			empty.textContent = tab === "custom"
				? t("home.boardDialog.emptyCustom")
				: t("home.boardDialog.emptyBuiltin");
			listContainer.appendChild(empty);
			return;
		}

		list.forEach(item => {
			const el = document.createElement("div");
			el.className = "board-item";
			el.innerHTML = `
				<div class="board-info">
					<div class="board-name">${item.name}</div>
					<div class="board-desc">${item.desc || (item.type === "custom" ? t("home.boardDialog.customDesc") : "")}</div>
				</div>
				<div class="board-size">${t("home.boardDialog.size", { steps: item.steps })}</div>
			`;

			el.addEventListener("click", () => {
				track("board_selected", {
					board_type: item.type,
					board_steps: item.steps
				});
				overlay.remove();
				document.body.appendChild(createModeDialog(item.token));
			});

			listContainer.appendChild(el);
		});
	}

	function moveIndicator(btn){
		const indicator = segmented.querySelector(".board-seg-indicator");
		const rootRect = segmented.getBoundingClientRect();
		const btnRect = btn.getBoundingClientRect();
		indicator.style.width = btnRect.width + "px";
		indicator.style.transform = `translateX(${btnRect.left - rootRect.left}px)`;
	}

	const segBtns = segmented.querySelectorAll(".board-seg-btn");
	segBtns.forEach(btn => {
		btn.addEventListener("click", () => {
			segBtns.forEach(x => x.classList.remove("active"));
			btn.classList.add("active");
			moveIndicator(btn);
			renderBoardList(btn.dataset.tab);
			track("board_tab_switched", { tab: btn.dataset.tab });
		});
	});

	requestAnimationFrame(() => {
		const active = segmented.querySelector(".board-seg-btn.active");
		if (active) moveIndicator(active);
		renderBoardList("builtin");
	});

	window.addEventListener("resize", () => {
		const active = segmented.querySelector(".board-seg-btn.active");
		if (active) moveIndicator(active);
	});

	const cancelBtn = document.createElement('button');
	cancelBtn.className = 'punishment-button';
	cancelBtn.textContent = t("home.boardDialog.cancel");
	cancelBtn.addEventListener('click', () => overlay.remove());

	const footer = document.createElement('div');
	footer.className = 'dialog-buttons';
	footer.appendChild(cancelBtn);

	dialog.append(title, segmented, listContainer, footer);
	overlay.appendChild(dialog);

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay){
			playDialogShake(cancelBtn);
		}
	});

	return overlay;
}

function createModeDialog(boardToken){
	const boardType = String(boardToken || "").startsWith("custom:") ? "custom" : "builtin";
	const overlay = document.createElement('div');
	overlay.className = 'punishment-overlay';

	const dialog = document.createElement('div');
	dialog.className = 'board-dialog';

	const title = document.createElement('h3');
	title.className = 'punishment-title';
	title.textContent = t("home.modeDialog.title");

	const listContainer = document.createElement('div');
	listContainer.className = 'board-list';

	const modes = [
		{ key:'solo', name:t("home.modeDialog.soloName"), desc:t("home.modeDialog.soloDesc") },
		{ key:'dual', name:t("home.modeDialog.dualName"), desc:t("home.modeDialog.dualDesc") }
	];

	modes.forEach(m => {
		const item = document.createElement('div');
		item.className = 'board-item';
		item.innerHTML = `
			<div class="board-info">
				<div class="board-name">${m.name}</div>
				<div class="board-desc">${m.desc}</div>
			</div>
			<div class="board-size">${m.key}</div>
		`;

		item.addEventListener('click', () => {
			track("mode_selected", {
				mode: m.key,
				board_type: boardType
			});
			window.location.href = `game.html?id=${encodeURIComponent(boardToken)}&mode=${encodeURIComponent(m.key)}`;
		});

		listContainer.appendChild(item);
	});

	const backBtn = document.createElement('button');
	backBtn.className = 'punishment-button';
	backBtn.textContent = t("home.modeDialog.back");
	backBtn.addEventListener('click', () => {
		overlay.remove();
		document.body.appendChild(createBoardDialog());
	});

	const footer = document.createElement('div');
	footer.className = 'dialog-buttons';
	footer.appendChild(backBtn);

	dialog.append(title, listContainer, footer);
	overlay.appendChild(dialog);

	return overlay;
}

/* ========= Bootstrap ========= */
document.addEventListener('DOMContentLoaded', () => {
	initHeroSubtitleTicker();
	initPwaInstallSpotlight();
	initInstallEntryHintFlow();

	if (!localStorage.getItem(MANUAL_AGREED_KEY)){
		document.body.appendChild(createManualDialog());
		track("manual_shown_auto");
	}else{
		console.log('Usage notes already accepted');
	}

	document.getElementById('gameManual').addEventListener('click', () => {
		track("manual_opened");
		document.body.appendChild(createManualDialog());
	});

	document.getElementById('startGame').addEventListener('click', () => {
		track("start_game_clicked");
		document.body.appendChild(createBoardDialog());
	});

	document.getElementById('gameSettings').addEventListener('click', () => {
		track("settings_opened");
		window.location.href = 'setting.html';
	});

	document.getElementById('devLog').addEventListener('click', () => {
		track("devlog_opened");
		window.location.href = 'devlog.html';
	});

	const xProfileLink = document.getElementById('xProfileLink');
	if (xProfileLink){
		xProfileLink.addEventListener('click', () => {
			track("x_profile_opened");
		});
	}
});
