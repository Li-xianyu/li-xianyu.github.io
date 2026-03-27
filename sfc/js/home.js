"use strict";

const MANUAL_AGREED_KEY = "manualAgreed";
const GUIDE_STATE_KEY = "HOME_ONBOARDING_INTRO_V1_STATE";
const INSTALL_ENTRY_HINT_KEY = "HOME_INSTALL_ENTRY_HINT_V1";

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

	const lines = [
		"规则你定，骰子由命",
		"棋盘已就位，就等你开始",
		"看看今天谁最倒霉",
		"棋盘已经摆好，怂的人是小狗",
		"听作者一句，先设置再开局",
		"骰子不会故意欺负你，运气不好就是运气不好"
	];

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
	const stateEl = document.getElementById('installSpotlightState');
	const descEl = document.getElementById('installSpotlightDesc');
	const actionBtn = document.getElementById('installSpotlightAction');
	const guideBtn = document.getElementById('installSpotlightGuide');

	if (!spotlight || !stateEl || !descEl || !actionBtn || !guideBtn || !window.PWAInstall){
		return;
	}

	function applyState(state){
		if (!state || state.isStandalone){
			spotlight.hidden = true;
			return;
		}

		spotlight.hidden = false;
		guideBtn.textContent = '浏览器建议';

		if (state.canInstall){
			stateEl.textContent = '推荐安装';
			descEl.textContent = '右上角固定悬浮菜单里会出现安装按钮，也可以直接点下面安装。推荐 Android / Windows / macOS 用 Chrome 或 Edge；iPhone / iPad 请用 Safari。';
			actionBtn.textContent = '立即安装';
			return;
		}

		if (state.isIosSafari){
			stateEl.textContent = 'Safari 安装';
			descEl.textContent = 'iPhone / iPad 推荐直接用 Safari。Safari 一般不弹系统安装窗，请用“分享 -> 添加到主屏幕”安装。';
			actionBtn.textContent = '查看安装步骤';
			return;
		}

		stateEl.textContent = '浏览器建议';
		descEl.textContent = '如果右上角固定悬浮菜单里没出现安装按钮，通常是当前浏览器不支持。推荐 Android / Windows / macOS 用 Chrome 或 Edge；iPhone / iPad 用 Safari。';
		actionBtn.textContent = '查看安装步骤';
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

	window.PWAInstall.onChange(applyState);
}

function hasReceivedInstallEntryHint(){
	return localStorage.getItem(INSTALL_ENTRY_HINT_KEY) === "1";
}

function markInstallEntryHintReceived(){
	localStorage.setItem(INSTALL_ENTRY_HINT_KEY, "1");
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
	title.textContent = "右上角菜单可以安装";

	const content = document.createElement("div");
	content.className = "punishment-content";
	content.innerHTML = `
		<div class="legal-disclaimer">
			<strong>安装入口提示</strong>
			<div>右上角固定悬浮菜单按钮里有安装图标，点一下即可安装到本地。推荐 Android / Windows / macOS 用 Chrome 或 Edge；iPhone / iPad 用 Safari。</div>
			<div style="margin-top:8px;">如果你在微信、QQ 这类内置浏览器里，建议先用系统浏览器打开，再安装。</div>
		</div>
	`;

	const buttonContainer = document.createElement("div");
	buttonContainer.className = "dialog-buttons";

	const openMenuBtn = document.createElement("button");
	openMenuBtn.className = "punishment-button";
	openMenuBtn.id = "confirmRestart";
	openMenuBtn.textContent = "打开菜单";

	const closeBtn = document.createElement("button");
	closeBtn.className = "punishment-button";
	closeBtn.id = "cancelRestart";
	closeBtn.textContent = "知道了";

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
	if (hasReceivedInstallEntryHint()) return false;
	if (!localStorage.getItem(MANUAL_AGREED_KEY)) return false;
	if (isHomeOnboardingPending()) return false;
	if (!window.PWAInstall || typeof window.PWAInstall.getState !== "function") return false;

	const state = window.PWAInstall.getState();
	return !!state && !!state.canInstall && !state.isStandalone;
}

function maybeShowInstallEntryHint(trigger){
	if (!canShowInstallEntryHint()) return;

	installEntryHintHandledThisSession = true;
	markInstallEntryHintReceived();
	track("pwa_install_entry_hint_shown", { trigger });
	document.body.appendChild(createInstallEntryHintDialog(trigger));
}

function scheduleInstallEntryHint(trigger, delay = 240){
	if (installEntryHintHandledThisSession || hasReceivedInstallEntryHint()) return;

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
	title.textContent = '免责声明与使用条款';

	const content = document.createElement('div');
	content.className = 'punishment-content';
	content.innerHTML = `
		<div class="legal-disclaimer">

			1. 本程序为虚拟娱乐产品，所包含的情节、任务与互动设计均为虚构创作内容，不构成对任何现实行为的倡导或价值导向。<br><br>

			2. 隐私与数据说明：设置与棋盘等内容默认仅存储于本地浏览器；站点会采集匿名使用行为（如页面访问、功能点击）用于优化体验，不包含可直接识别个人身份的信息。清除浏览器缓存后，本地数据可被删除。<br><br>

			继续使用本程序即表示您已阅读、理解并同意以上全部条款。
		</div>
	`;


	const buttonContainer = document.createElement('div');
	buttonContainer.className = 'dialog-buttons';

	const confirmBtn = document.createElement('button');
	confirmBtn.className = 'punishment-button';
	confirmBtn.id = 'confirmRestart';
	confirmBtn.textContent = '同意并继续';

	const cancelBtn = document.createElement('button');
	cancelBtn.className = 'punishment-button';
	cancelBtn.id = 'cancelRestart';
	cancelBtn.textContent = '拒绝并退出';

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

	// 点遮罩不关，只抖一下提示
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay){
			playDialogShake(confirmBtn);
		}
	});

	return overlay;
}

/* ========= 清屏退出 ========= */
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
				<h3>已终止访问</h3>
				<p>已经清除页面...</p>
			</div>
		</div>
	`;
	document.body.appendChild(exitOverlay);

	document.body.style.pointerEvents = 'none';
	window.onbeforeunload = null;
	window.stop();
}

/* ========= 棋盘 / 模式 ========= */
function getMaxGrid(board){
	return Math.max(...board.flat(2).filter(n => n > 0));
}

function getCustomBoards(){
	try{
		const raw = JSON.parse(localStorage.getItem("CUSTOM_BOARDS") || "[]");
		return Array.isArray(raw) ? raw : [];
	}catch(err){
		console.error("[Home] 读取自定义棋盘失败", err);
		return [];
	}
}

function getBuiltInBoardOptions(){
	return Boards.map((board, index) => ({
		type: "builtin",
		token: `builtin:${index + 1}`,
		name: (boardNames[index] && boardNames[index].name) || `官方棋盘 ${index + 1}`,
		desc: (boardNames[index] && boardNames[index].desc) || "",
		steps: getMaxGrid(board),
		board
	}));
}

function getCustomBoardOptions(){
	return getCustomBoards().map(item => ({
		type: "custom",
		token: `custom:${item.id}`,
		name: item.name || "未命名棋盘",
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
	title.textContent = '选择棋盘';

	const segmented = document.createElement('div');
	segmented.className = 'board-segmented';
	segmented.innerHTML = `
		<button class="board-seg-btn active" type="button" data-tab="builtin">官方棋盘</button>
		<button class="board-seg-btn" type="button" data-tab="custom">玩家工坊</button>
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
				? "还没有自定义棋盘，先去设置页顶部的“创建棋盘”做一个。"
				: "暂无官方棋盘";
			listContainer.appendChild(empty);
			return;
		}

		list.forEach(item => {
			const el = document.createElement("div");
			el.className = "board-item";
			el.innerHTML = `
				<div class="board-info">
					<div class="board-name">${item.name}</div>
					<div class="board-desc">${item.desc || (item.type === "custom" ? "本地自定义棋盘" : "")}</div>
				</div>
				<div class="board-size">${item.steps}格</div>
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
	cancelBtn.textContent = '取消选择';
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
	title.textContent = '选择模式';

	const listContainer = document.createElement('div');
	listContainer.className = 'board-list';

	const modes = [
		{ key:'solo', name:'DIY模式', desc:'自己投骰自己执行' },
		{ key:'dual', name:'SJ模式', desc:'双人都投骰子，每一个格子中都有两人的任务' }
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
	backBtn.textContent = '返回重选棋盘';
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

/* ========= 启动 ========= */
document.addEventListener('DOMContentLoaded', () => {
	initHeroSubtitleTicker();
	initPwaInstallSpotlight();
	initInstallEntryHintFlow();

	// 首次自动弹免责声明
	if (!localStorage.getItem(MANUAL_AGREED_KEY)){
		document.body.appendChild(createManualDialog());
		track("manual_shown_auto");
	}else{
		console.log('用户已同意须知');
	}

	// 手动打开免责声明
	document.getElementById('gameManual').addEventListener('click', () => {
		track("manual_opened");
		document.body.appendChild(createManualDialog());
	});

	// 开始游戏：先棋盘后模式
	document.getElementById('startGame').addEventListener('click', () => {
		track("start_game_clicked");
		document.body.appendChild(createBoardDialog());
	});

	// 设置页
	document.getElementById('gameSettings').addEventListener('click', () => {
		track("settings_opened");
		window.location.href = 'setting.html';
	});

	// 开发日志
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
