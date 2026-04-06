"use strict";

function track(eventName, payload){
	if (typeof window.trackEvent === "function"){
		window.trackEvent(eventName, payload);
	}
}

let mapData;
let current_punishment_passive;
let current_task_master;
let passive_location;
let master_location;
let current_board;
let endNumber;
let isBoardIntroAnimating = false;
let boardIntroSequenceId = 0;
let currentBoardDebugMeta = null;

window.MOVE_ANIM_DURATION = window.MOVE_ANIM_DURATION || 500;
const size = 10;
const BOARD_INTRO_TOTAL_MS = 1180;
const BOARD_INTRO_START_DELAY_MS = 64;
const BOARD_INTRO_HEAD_HOLD_MS = 96;
const BOARD_INTRO_STEP_MIN_MS = 14;
const BOARD_INTRO_STEP_MAX_MS = 28;
const BOARD_SHELL_REVEAL_MS = 940;
const BOARD_SHELL_FADE_MS = 130;
const BOARD_ROW_REVEAL_STEP_MS = 32;
const BOARD_ROW_REVEAL_SETTLE_MS = 54;
const BOARD_UI_FADE_IN_MS = 260;

const storedSettings = JSON.parse(
	localStorage.getItem(ACTION_COUNT_RANGE_STORAGE_KEY) ||
	localStorage.getItem(LEGACY_ACTION_COUNT_RANGE_STORAGE_KEY) ||
	'null'
);
const normalizedActionCountRange = typeof window.coerceActionCountRange === 'function'
	? window.coerceActionCountRange(storedSettings || ACTION_COUNT_RANGE, ACTION_COUNT_RANGE)
	: (storedSettings || ACTION_COUNT_RANGE);
ACTION_COUNT_RANGE.min = normalizedActionCountRange.min;
ACTION_COUNT_RANGE.max = normalizedActionCountRange.max;

const storedGameData = JSON.parse(localStorage.getItem('GameData'));
GameData = normalizeGameData(storedGameData);

const storedActiveData = JSON.parse(localStorage.getItem('ActiveData'));
ActiveData = normalizeActiveData(storedActiveData);
const storedGameUiSettings = JSON.parse(localStorage.getItem(GAME_UI_SETTINGS_STORAGE_KEY) || 'null');
const gameUiSettings = normalizeGameUiSettings(storedGameUiSettings);

const board = document.getElementById('board');
const rolldice = document.getElementById('rolldice');
const rollmaster = document.getElementById('rollmaster');
const boardIntroWash = document.getElementById('boardIntroWash');
const controls = document.getElementById('controls');
const taskPanel = document.getElementById('taskPanel');

const GAME_MODE = (String(window.GAME_MODE || new URLSearchParams(location.search).get('mode') || 'dual')).toLowerCase();
const IS_DUAL = !(GAME_MODE === 'solo' || GAME_MODE === 'single' || GAME_MODE === 'one');

const roundInfo = document.getElementById('roundInfo');
const zVetoBadge = document.getElementById('zVetoBadge');
const bTaskStatsBtn = document.getElementById('bTaskStatsBtn');
const bTaskLiveCount = document.getElementById('bTaskLiveCount');
const SETTINGS_PARENT_MESSAGE_TYPE = 'sfc:settings-saved';
const SETTINGS_SCROLL_MESSAGE_TYPE = 'sfc:settings-scroll-progress';
const GAME_SESSION_STORAGE_KEY = 'SFC_GAME_SESSIONS_V1';
const GAME_SESSION_VERSION = 1;

let settingsEmbedOverlay = null;

const ACTIVE_TEXT = {
	countPlus5: getCanonicalCategoryItemLabel("active", "count_plus_5"),
	countPlus10: getCanonicalCategoryItemLabel("active", "count_plus_10"),
	countMinus5: getCanonicalCategoryItemLabel("active", "count_minus_5"),
	countMinus10: getCanonicalCategoryItemLabel("active", "count_minus_10"),
	doubleCount: getCanonicalCategoryItemLabel("active", "double_count"),
	halfUp: getCanonicalCategoryItemLabel("active", "half_up"),
	choosePosture: getCanonicalCategoryItemLabel("active", "choose_posture"),
	splitWithRest: getCanonicalCategoryItemLabel("active", "split_with_rest"),
	forceRest5m: getCanonicalCategoryItemLabel("active", "force_rest_5m"),
	restInvalid: getCanonicalCategoryItemLabel("active", "rest_invalid")
};

const MOVE_TEXT = {
	toEnd: getCanonicalCategoryItemLabel("aod", "to_end"),
	toStart: getCanonicalCategoryItemLabel("aod", "to_start"),
	forwardRange: getCanonicalCategoryItemLabel("aod", "forward_1_3"),
	backwardRange: getCanonicalCategoryItemLabel("aod", "backward_1_3")
};

const DURATION_LOGIC = getI18nValue("logic.duration", {
	lang: "zh",
	fallback: {
		regex: "(\\d+(?:\\.\\d+)?)\\s*(minutes?|mins?|min|m|seconds?|secs?|sec|s)",
		halfToken: "",
		tenToken: "",
		digits: {},
		minuteTokens: ["m"]
	}
}) || {};

let roundNo = 1;
let roundMasterDone = false;
let roundPassiveDone = false;
let actualActionTotal = 0;
let actualActionTriggerCount = 0;
let lastRecordedActionRound = 0;
let lastRecordedActionCount = 0;
let lastRecordedActionAdjusted = false;
const zEffectState = {
	countRule: null,
	forcedPosture: "",
	splitExecution: false,
	restInvalidToken: 0
};
let roundPassiveSnapshot = null;

function cloneGameSessionValue(value) {
	if (typeof cloneStructuredData === 'function') {
		return cloneStructuredData(value);
	}
	return JSON.parse(JSON.stringify(value));
}

function showFatalGameMessage(message) {
	const text = String(message || 'Game failed to initialize.');
	if (!document.body) return;

	let box = document.getElementById('gameFatalMessage');
	if (!box) {
		box = document.createElement('div');
		box.id = 'gameFatalMessage';
		box.style.position = 'fixed';
		box.style.left = '50%';
		box.style.top = '50%';
		box.style.transform = 'translate(-50%, -50%)';
		box.style.zIndex = '10001';
		box.style.width = 'min(88vw, 420px)';
		box.style.padding = '16px 18px';
		box.style.borderRadius = '14px';
		box.style.background = 'rgba(255,255,255,0.96)';
		box.style.color = '#222';
		box.style.boxShadow = '0 20px 60px rgba(0,0,0,0.18)';
		box.style.fontSize = '14px';
		box.style.lineHeight = '1.6';
		box.style.whiteSpace = 'pre-wrap';
		document.body.appendChild(box);
	}
	box.textContent = text;
}

function getGameSessionModeKey() {
	return IS_DUAL ? 'dual' : 'solo';
}

function getGameSessionId(boardToken = current_board, mode = getGameSessionModeKey()) {
	return `${String(boardToken || '').trim()}::${String(mode || '').trim()}`;
}

function readGameSessionStore() {
	try {
		const parsed = JSON.parse(localStorage.getItem(GAME_SESSION_STORAGE_KEY) || 'null');
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch (error) {
		console.warn('[Game] Failed to read saved game sessions.', error);
		return {};
	}
}

function writeGameSessionStore(store) {
	try {
		const entries = store && typeof store === 'object' ? Object.entries(store) : [];
		if (!entries.length) {
			localStorage.removeItem(GAME_SESSION_STORAGE_KEY);
			return;
		}
		localStorage.setItem(GAME_SESSION_STORAGE_KEY, JSON.stringify(store));
	} catch (error) {
		console.warn('[Game] Failed to write saved game sessions.', error);
	}
}

function readGameSessionSnapshot(boardToken = current_board, mode = getGameSessionModeKey()) {
	const store = readGameSessionStore();
	if (!store || typeof store !== 'object') return null;
	return store[getGameSessionId(boardToken, mode)] || null;
}

function clearGameSessionSnapshot(boardToken = current_board, mode = getGameSessionModeKey()) {
	try {
		const store = readGameSessionStore();
		if (!store || typeof store !== 'object') {
			localStorage.removeItem(GAME_SESSION_STORAGE_KEY);
			return;
		}
		delete store[getGameSessionId(boardToken, mode)];
		writeGameSessionStore(store);
	} catch (error) {
		console.warn('[Game] Failed to clear saved game session.', error);
	}
}

function isGameFinished() {
	if (!Number.isFinite(endNumber) || endNumber <= 1) return false;
	return passive_location === endNumber || master_location === endNumber;
}

function hasGameProgress() {
	if (passive_location > 1 || master_location > 1) return true;
	if (roundNo > 1) return true;
	if (roundMasterDone || roundPassiveDone) return true;
	if (actualActionTotal > 0 || actualActionTriggerCount > 0) return true;
	if (zEffectState.restInvalidToken > 0) return true;
	const masterText = document.getElementById('taskMaster')?.textContent || '';
	const passiveText = document.getElementById('taskPassive')?.textContent || '';
	return !!(masterText && masterText !== t("common.status.dash")) || !!(passiveText && passiveText !== t("common.status.dash"));
}

function isValidBoardMatrix(value) {
	if (!Array.isArray(value) || value.length <= 0) return false;
	return value.every((row) =>
		Array.isArray(row) &&
		row.length === value.length &&
		row.every((cell) => Number.isFinite(cell))
	);
}

function buildGameSessionSnapshot() {
	if (!current_board || !isValidBoardMatrix(mapData) || !current_punishment_passive || !current_task_master) {
		return null;
	}
	if (isGameFinished() || !hasGameProgress()) {
		return null;
	}

	return {
		version: GAME_SESSION_VERSION,
		savedAt: Date.now(),
		mode: getGameSessionModeKey(),
		boardToken: current_board,
		boardMeta: currentBoardDebugMeta ? cloneGameSessionValue(currentBoardDebugMeta) : null,
		mapData: cloneGameSessionValue(mapData),
		passiveMap: cloneGameSessionValue(current_punishment_passive),
		masterMap: cloneGameSessionValue(current_task_master),
		passiveLocation: Number(passive_location || 1),
		masterLocation: Number(master_location || 1),
		endNumber: Number(endNumber || 0),
		roundNo: Number(roundNo || 1),
		roundMasterDone: !!roundMasterDone,
		roundPassiveDone: !!roundPassiveDone,
		actualActionTotal: Number(actualActionTotal || 0),
		actualActionTriggerCount: Number(actualActionTriggerCount || 0),
		lastRecordedActionRound: Number(lastRecordedActionRound || 0),
		lastRecordedActionCount: Number(lastRecordedActionCount || 0),
		lastRecordedActionAdjusted: !!lastRecordedActionAdjusted,
		zEffectState: cloneGameSessionValue(zEffectState),
		roundPassiveSnapshot: roundPassiveSnapshot ? cloneGameSessionValue(roundPassiveSnapshot) : null,
		taskMasterText: document.getElementById('taskMaster')?.textContent || t("common.status.dash"),
		taskPassiveText: document.getElementById('taskPassive')?.textContent || t("common.status.dash")
	};
}

function persistGameSessionSnapshot() {
	const snapshot = buildGameSessionSnapshot();
	if (!snapshot) {
		clearGameSessionSnapshot();
		return;
	}

	try {
		const store = readGameSessionStore();
		store[getGameSessionId(snapshot.boardToken, snapshot.mode)] = snapshot;
		writeGameSessionStore(store);
	} catch (error) {
		console.warn('[Game] Failed to save game session.', error);
	}
}

function normalizeStoredGameSession(rawSnapshot, expectedBoardToken, expectedMode = getGameSessionModeKey()) {
	if (!rawSnapshot || typeof rawSnapshot !== 'object') return null;
	if (Number(rawSnapshot.version) !== GAME_SESSION_VERSION) return null;
	if (String(rawSnapshot.mode || '') !== String(expectedMode || '')) return null;
	if (String(rawSnapshot.boardToken || '') !== String(expectedBoardToken || '')) return null;
	if (!isValidBoardMatrix(rawSnapshot.mapData)) return null;
	if (!rawSnapshot.passiveMap || typeof rawSnapshot.passiveMap !== 'object') return null;
	if (!rawSnapshot.masterMap || typeof rawSnapshot.masterMap !== 'object') return null;

	const maxCell = Math.max(...rawSnapshot.mapData.flat().filter((value) => Number.isFinite(value)));
	if (!Number.isFinite(maxCell) || maxCell <= 1) return null;

	const passiveLocation = Math.max(1, Math.min(maxCell, Number(rawSnapshot.passiveLocation || 1)));
	const masterLocation = Math.max(1, Math.min(maxCell, Number(rawSnapshot.masterLocation || 1)));
	if (passiveLocation === maxCell || masterLocation === maxCell) return null;

	return {
		version: GAME_SESSION_VERSION,
		savedAt: Number(rawSnapshot.savedAt || 0),
		mode: String(rawSnapshot.mode || ''),
		boardToken: String(rawSnapshot.boardToken || expectedBoardToken || ''),
		boardMeta: rawSnapshot.boardMeta && typeof rawSnapshot.boardMeta === 'object'
			? cloneGameSessionValue(rawSnapshot.boardMeta)
			: null,
		mapData: cloneGameSessionValue(rawSnapshot.mapData),
		passiveMap: cloneGameSessionValue(rawSnapshot.passiveMap),
		masterMap: cloneGameSessionValue(rawSnapshot.masterMap),
		passiveLocation,
		masterLocation,
		endNumber: maxCell,
		roundNo: Math.max(1, Number(rawSnapshot.roundNo || 1)),
		roundMasterDone: !!rawSnapshot.roundMasterDone,
		roundPassiveDone: !!rawSnapshot.roundPassiveDone,
		actualActionTotal: Math.max(0, Number(rawSnapshot.actualActionTotal || 0)),
		actualActionTriggerCount: Math.max(0, Number(rawSnapshot.actualActionTriggerCount || 0)),
		lastRecordedActionRound: Math.max(0, Number(rawSnapshot.lastRecordedActionRound || 0)),
		lastRecordedActionCount: Math.max(0, Number(rawSnapshot.lastRecordedActionCount || 0)),
		lastRecordedActionAdjusted: !!rawSnapshot.lastRecordedActionAdjusted,
		zEffectState: {
			countRule: rawSnapshot.zEffectState?.countRule || null,
			forcedPosture: String(rawSnapshot.zEffectState?.forcedPosture || ''),
			splitExecution: !!rawSnapshot.zEffectState?.splitExecution,
			restInvalidToken: Math.max(0, Number(rawSnapshot.zEffectState?.restInvalidToken || 0))
		},
		roundPassiveSnapshot: rawSnapshot.roundPassiveSnapshot && typeof rawSnapshot.roundPassiveSnapshot === 'object'
			? cloneGameSessionValue(rawSnapshot.roundPassiveSnapshot)
			: null,
		taskMasterText: String(rawSnapshot.taskMasterText || t("common.status.dash")),
		taskPassiveText: String(rawSnapshot.taskPassiveText || t("common.status.dash"))
	};
}

function applyGameUiSettings() {
	if (bTaskStatsBtn) {
		bTaskStatsBtn.hidden = !gameUiSettings.showBTaskPrediction;
		bTaskStatsBtn.style.display = gameUiSettings.showBTaskPrediction ? "" : "none";
	}
	if (bTaskLiveCount) {
		bTaskLiveCount.hidden = !gameUiSettings.showBTaskLiveCount;
		bTaskLiveCount.style.display = gameUiSettings.showBTaskLiveCount ? "" : "none";
	}
}

function getBoardIntroUiTargets() {
	return [roundInfo, controls, taskPanel].filter(Boolean);
}

function setBoardIntroUiHidden(hidden) {
	getBoardIntroUiTargets().forEach((element) => {
		element.classList.toggle('is-intro-hidden', !!hidden);
	});
}

function resetBoardIntroPresentation() {
	if (board) board.classList.remove('is-intro-running');
	if (boardIntroWash) {
		boardIntroWash.classList.remove('is-active', 'is-exiting');
		boardIntroWash.classList.add('is-hidden');
		boardIntroWash.style.removeProperty('--board-intro-top');
		boardIntroWash.style.removeProperty('--board-intro-right');
		boardIntroWash.style.removeProperty('--board-intro-bottom');
		boardIntroWash.style.removeProperty('--board-intro-left');
		boardIntroWash.style.removeProperty('--board-intro-radius');
		boardIntroWash.style.removeProperty('clip-path');
		boardIntroWash.style.removeProperty('box-shadow');
		boardIntroWash.style.removeProperty('opacity');
	}
	setBoardIntroUiHidden(false);
}

function prepareBoardIntroPresentation() {
	if (!shouldAnimateBoardIntro()) {
		resetBoardIntroPresentation();
		return;
	}

	if (boardIntroWash) {
		boardIntroWash.classList.remove('is-hidden', 'is-active', 'is-exiting');
	}
	setBoardIntroUiHidden(true);
}

function updateVetoBadge() {
	if (!zVetoBadge) return;
	zVetoBadge.hidden = zEffectState.restInvalidToken <= 0;
}

if (board) board.style.display = '';
if (rolldice) rolldice.style.display = '';
if (rollmaster) rollmaster.style.display = IS_DUAL ? '' : 'none';
applyGameUiSettings();
prepareBoardIntroPresentation();
initEmbeddedSettingsModal();

function syncQuickDockClosedState() {
	const dock = document.querySelector('.quick-dock');
	const launcher = document.querySelector('.quick-dock-launcher');
	const panel = document.querySelector('.quick-dock-panel');
	if (!dock || !launcher || !panel) return;

	dock.classList.remove('open');
	launcher.setAttribute('aria-expanded', 'false');
	panel.setAttribute('aria-hidden', 'true');
}

function closeEmbeddedSettings(options = {}) {
	if (!settingsEmbedOverlay) return;

	const shouldRestoreFocus = options.restoreFocus !== false;
	const launcher = document.querySelector('.quick-action-setting') || document.querySelector('.quick-dock-launcher');

	settingsEmbedOverlay.remove();
	settingsEmbedOverlay = null;
	document.body.classList.remove('settings-embed-open');

	if (shouldRestoreFocus && launcher && typeof launcher.focus === 'function') {
		try {
			launcher.focus({ preventScroll: true });
		} catch (error) {
			launcher.focus();
		}
	}
}

function updateEmbeddedSettingsTitleProgress(progress) {
	if (!settingsEmbedOverlay) return;

	const value = Math.max(0, Math.min(1, Number(progress) || 0));
	settingsEmbedOverlay.style.setProperty('--settings-shell-progress', value.toFixed(3));
	settingsEmbedOverlay.classList.toggle('is-shell-title-visible', value > 0.08);
}

function createEmbeddedSettingsDialog() {
	const overlay = document.createElement('div');
	overlay.className = 'punishment-overlay settings-embed-overlay';
	overlay.style.setProperty('--settings-shell-progress', '0');

	const dialog = document.createElement('div');
	dialog.className = 'board-dialog settings-embed-dialog';

	const head = document.createElement('div');
	head.className = 'settings-embed-head';

	const title = document.createElement('h3');
	title.className = 'settings-embed-title';
	title.textContent = t('settings.title');

	const closeBtn = document.createElement('button');
	closeBtn.type = 'button';
	closeBtn.className = 'settings-embed-close';
	closeBtn.setAttribute('aria-label', t('common.actions.close'));
	closeBtn.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';
	closeBtn.addEventListener('click', () => closeEmbeddedSettings());

	const shell = document.createElement('div');
	shell.className = 'settings-embed-shell';

	const frame = document.createElement('iframe');
	frame.className = 'settings-embed-frame';
	frame.src = 'setting.html?embed=1';
	frame.setAttribute('title', t('settings.title'));
	frame.addEventListener('load', () => {
		overlay.classList.add('is-frame-ready');
	});

	head.append(title, closeBtn);
	shell.appendChild(frame);
	dialog.append(head, shell);
	overlay.appendChild(dialog);

	overlay.addEventListener('click', (event) => {
		if (event.target !== overlay) return;
		if (typeof window.playDialogShake === 'function') {
			window.playDialogShake(closeBtn);
			return;
		}
		closeEmbeddedSettings();
	});

	overlay.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		closeEmbeddedSettings();
	});

	overlay._frame = frame;
	overlay._closeBtn = closeBtn;
	return overlay;
}

function openEmbeddedSettings() {
	if (settingsEmbedOverlay) return;

	syncQuickDockClosedState();
	settingsEmbedOverlay = createEmbeddedSettingsDialog();
	document.body.classList.add('settings-embed-open');
	document.body.appendChild(settingsEmbedOverlay);

	requestAnimationFrame(() => {
		settingsEmbedOverlay?._closeBtn?.focus();
	});

	updateEmbeddedSettingsTitleProgress(0);

	track('game_settings_modal_opened');
}

function initEmbeddedSettingsModal() {
	window.openEmbeddedSettings = openEmbeddedSettings;

	window.addEventListener('message', (event) => {
		if (!settingsEmbedOverlay) return;

		const frame = settingsEmbedOverlay._frame;
		if (!frame || event.source !== frame.contentWindow) return;

		const data = event.data || {};
		if (data.type === SETTINGS_SCROLL_MESSAGE_TYPE) {
			updateEmbeddedSettingsTitleProgress(data.progress);
			return;
		}

		if (data.type !== SETTINGS_PARENT_MESSAGE_TYPE) return;

		closeEmbeddedSettings({ restoreFocus: false });
		window.location.reload();
	});
}

function getRandomSelected(items) {
	const active = items.filter(i => i.selected);
	if (!active.length) return null;
	return active[Math.floor(Math.random() * active.length)];
}

function generateMasterTask() {
	const item = getRandomSelected(ActiveData.items || []);
	return item ? { text: item.name, type: 'master' } : { text: t("game.noInstruction"), type: 'master' };
}

function getRandomSelectedName(scopeKey, items) {
	const active = (items || []).filter(item => item && item.selected);
	if (!active.length) return "";
	return getLocalizedItemName(scopeKey, active[Math.floor(Math.random() * active.length)]) || "";
}

function parseTrailingNumber(text) {
	const source = String(text || "");
	const match = source.match(/(\d+)(?!.*\d)/);
	if (!match) return null;
	return {
		value: Number.parseInt(match[1], 10),
		start: match.index,
		end: match.index + match[1].length
	};
}

function applyCountRule(value, rule) {
	if (!rule || !Number.isFinite(value)) return value;
	if (rule.type === "add") return Math.max(0, value + rule.value);
	if (rule.type === "multiply") return Math.max(0, value * rule.value);
	if (rule.type === "half") return Math.max(0, Math.ceil(value / 2));
	return value;
}

function applyForcedPosture(text, forcedPosture) {
	if (!forcedPosture) return text;
	const source = String(text || "");
	const postureNames = (GameData.posture?.items || [])
		.flatMap((item) => [
			String(item?.name || "").trim(),
			getLocalizedItemName("posture", item)
		])
		.filter(Boolean)
		.filter((name, index, list) => list.indexOf(name) === index)
		.sort((a, b) => b.length - a.length);

	let remainder = source;
	const matched = postureNames.find(name => source.startsWith(name));
	if (matched) {
		remainder = source.slice(matched.length);
	}
	return `${forcedPosture}${remainder}`;
}

function transformActionByZEffects(rawText) {
	let nextText = String(rawText || "");
	const parsed = parseTrailingNumber(nextText);
	const originalCount = parsed ? parsed.value : null;
	let finalCount = originalCount;
	let countExpr = "";

	if (finalCount !== null && zEffectState.countRule) {
		finalCount = applyCountRule(finalCount, zEffectState.countRule);
		if (zEffectState.countRule.type === "add") {
			const delta = zEffectState.countRule.value;
			countExpr = delta >= 0 ? `（${originalCount} + ${delta}）` : `（${originalCount} - ${Math.abs(delta)}）`;
		} else if (zEffectState.countRule.type === "multiply") {
			countExpr = `（${originalCount} x${zEffectState.countRule.value}）`;
		} else if (zEffectState.countRule.type === "half") {
			countExpr = `（${originalCount} /2）`;
		}
		nextText = `${nextText.slice(0, parsed.start)}${finalCount}${countExpr}${nextText.slice(parsed.end)}`;
	}

	if (zEffectState.forcedPosture) {
		nextText = applyForcedPosture(nextText, zEffectState.forcedPosture);
	}

	const splitEnabled = !!zEffectState.splitExecution;
	const splitInfo = splitEnabled && finalCount !== null
		? {
			first: Math.ceil(finalCount / 2),
			second: Math.floor(finalCount / 2)
		}
		: null;

	zEffectState.countRule = null;
	zEffectState.forcedPosture = "";
	zEffectState.splitExecution = false;

	return { text: nextText, splitInfo, finalCount };
}

function tryApplyMasterEffectsToCurrentRound() {
	if (!roundPassiveSnapshot) return;
	if (!roundPassiveDone) return;
	if (roundPassiveSnapshot.round !== roundNo) return;
	if (roundPassiveSnapshot.type !== "action") return;

	const transformed = transformActionByZEffects(roundPassiveSnapshot.baseText);
	const splitText = transformed.splitInfo
		? t("game.splitExecution", {
			first: transformed.splitInfo.first,
			second: transformed.splitInfo.second
		})
		: "";
	const finalDisplay = `${transformed.text}${splitText}`;

	if (lastRecordedActionRound === roundNo && !lastRecordedActionAdjusted) {
		const nextCount = extractActionCountForRecord(transformed.text, transformed.finalCount);
		if (nextCount > 0) {
			actualActionTotal += (nextCount - lastRecordedActionCount);
			lastRecordedActionCount = nextCount;
			lastRecordedActionAdjusted = true;
			updateBTaskLiveCount();
		}
	}

	roundPassiveSnapshot.displayText = finalDisplay;
	if (roundPassiveSnapshot.targetNumber && current_punishment_passive[roundPassiveSnapshot.targetNumber]) {
		current_punishment_passive[roundPassiveSnapshot.targetNumber].text = finalDisplay;
	}
	setTaskText("passive", t("game.taskPrefixApplied", { text: localizeBuiltinText(finalDisplay) }));
	showTip(t("game.taskApplied"));
	persistGameSessionSnapshot();
}

async function applyMasterInstruction(taskText) {
	const text = String(taskText || "").trim();
	if (!text) return;

	if (text === ACTIVE_TEXT.countPlus5) zEffectState.countRule = { type: "add", value: 5 };
	else if (text === ACTIVE_TEXT.countPlus10) zEffectState.countRule = { type: "add", value: 10 };
	else if (text === ACTIVE_TEXT.countMinus5) zEffectState.countRule = { type: "add", value: -5 };
	else if (text === ACTIVE_TEXT.countMinus10) zEffectState.countRule = { type: "add", value: -10 };
	else if (text === ACTIVE_TEXT.doubleCount) zEffectState.countRule = { type: "multiply", value: 2 };
	else if (text === ACTIVE_TEXT.halfUp) zEffectState.countRule = { type: "half", value: 0 };
	else if (text === ACTIVE_TEXT.choosePosture) zEffectState.forcedPosture = getRandomSelectedName("posture", GameData.posture?.items || []);
	else if (text === ACTIVE_TEXT.splitWithRest) zEffectState.splitExecution = true;
	else if (text === ACTIVE_TEXT.restInvalid) {
		zEffectState.restInvalidToken = 1;
		updateVetoBadge();
		persistGameSessionSnapshot();
		await showInfoDialog(t("game.veto.title"), t("game.veto.granted"));
	}
	else if (text === ACTIVE_TEXT.forceRest5m) {
		const blocked = await shouldConsumeRestVeto(t("game.forceRest"));
		if (!blocked) {
			await showTimedCountdownDialog("rest", t("game.forceRest"));
		}
	}
}

function generatePunishment(options = {}) {
	let allowedTypes;
	if (typeof options === 'string') allowedTypes = [options];
	else if (Array.isArray(options)) allowedTypes = options;
	else allowedTypes = options.allowedTypes;

	const getRandomActiveName = (scopeKey, items) => {
		const activeItems = items.filter(item => item.selected);
		return activeItems.length > 0
			? getLocalizedItemName(scopeKey, activeItems[Math.floor(Math.random() * activeItems.length)])
			: null;
	};

	const hasActiveItems = (items) => Array.isArray(items) && items.some(item => item && item.selected);

	const getRandomActionCount = (min, max) => {
		const step = window.ACTION_COUNT_RANGE_LIMITS?.step || 5;
		const totalSteps = Math.max(0, Math.floor((max - min) / step));
		return min + Math.floor(Math.random() * (totalSteps + 1)) * step;
	};

	const modules = [
		{
			type: 'action',
			weight: GameData.prop.weight || 0,
			available: () => hasActiveItems(GameData.prop.items),
			handler: () => {
				const postureName = getRandomActiveName('posture', GameData.posture.items);
				const propName = getRandomActiveName('prop', GameData.prop.items);
				const count = getRandomActionCount(ACTION_COUNT_RANGE.min, ACTION_COUNT_RANGE.max);

				if (!propName) return { text: t("game.noTool"), type: 'error' };

				return {
					text: postureName
						? `${postureName}${propName} ${count}`
						: `${propName} ${count}`
				};
			}
		},
		{
			type: 'rest',
			weight: GameData.reward.weight || 0,
			available: () => hasActiveItems(GameData.reward.items),
			handler: () => ({ text: getRandomActiveName('reward', GameData.reward.items) || t("game.noRest") })
		},
		{
			type: 'move',
			weight: GameData.aod.weight || 0,
			available: () => hasActiveItems(GameData.aod.items),
			handler: () => ({ text: getRandomActiveName('aod', GameData.aod.items) || t("game.noMove") })
		},
		{
			type: 'sports',
			weight: GameData.sports.weight || 0,
			available: () => hasActiveItems(GameData.sports.items),
			handler: () => ({ text: getRandomActiveName('sports', GameData.sports.items) || t("game.noSports") })
		}
	];

	const filteredModules = (allowedTypes ? modules.filter(m => allowedTypes.includes(m.type)) : modules)
		.filter(m => m.weight > 0 && m.available());
	if (filteredModules.length === 0) return { text: t("game.noType"), type: 'error' };

	const totalWeight = filteredModules.reduce((sum, m) => sum + m.weight, 0);
	if (totalWeight <= 0) return { text: t("game.noType"), type: 'error' };
	let random = Math.random() * totalWeight;
	const selected = filteredModules.find(m => (random -= m.weight) <= 0);

	return { ...selected.handler(), type: selected.type };
}

function getNonZeroCount(board) {
	let count = 0;
	for (const row of board) {
		for (const cell of row) {
			if (cell !== 0) count++;
		}
	}
	return count;
}

function getBTaskTypeLabel(type) {
	const fallback = {
		action: t("game.bTaskType.action"),
		rest: t("game.bTaskType.rest"),
		move: t("game.bTaskType.move"),
		sports: t("game.bTaskType.sports"),
		unknown: t("game.bTaskType.unknown")
	};

	if (type === 'action') {
		const postureDesc = getLocalizedCategoryDescription("posture", String(GameData.posture?.description || '').trim());
		const propDesc = getLocalizedCategoryDescription("prop", String(GameData.prop?.description || '').trim());
		if (postureDesc && propDesc) {
			return `${fallback.action}（${postureDesc}+${propDesc}）`;
		}
		return fallback.action;
	}
	if (type === 'rest') {
		return getLocalizedCategoryDescription("reward", String(GameData.reward?.description || '').trim()) || fallback.rest;
	}
	if (type === 'move') {
		return getLocalizedCategoryDescription("aod", String(GameData.aod?.description || '').trim()) || fallback.move;
	}
	if (type === 'sports') {
		return getLocalizedCategoryDescription("sports", String(GameData.sports?.description || '').trim()) || fallback.sports;
	}
	return fallback.unknown;
}

function countBTaskModules(passiveMap) {
	const counts = {
		action: 0,
		rest: 0,
		move: 0,
		sports: 0,
		unknown: 0
	};
	const entries = Object.values(passiveMap || {});
	for (const item of entries) {
		const type = String(item?.type || '').trim();
		if (type in counts) {
			counts[type] += 1;
		} else {
			counts.unknown += 1;
		}
	}
	return counts;
}

function buildSelectionDebug(scopeKey, items) {
	const list = Array.isArray(items) ? items : [];
	const selectedItems = list
		.filter((item) => item && item.selected)
		.map((item) => ({
			id: String(item.id || ""),
			custom: !!item.custom,
			rawName: String(item.name || "").trim(),
			displayName: getLocalizedItemName(scopeKey, item)
		}));

	return {
		scope: scopeKey,
		totalCount: list.length,
		selectedCount: selectedItems.length,
		selectedItems
	};
}

function buildPunishmentModuleStates(allowedTypes = null) {
	const modules = [
		{
			type: "action",
			label: "action",
			scopeKey: "prop",
			weight: Number(GameData.prop?.weight || 0),
			items: GameData.prop?.items || []
		},
		{
			type: "rest",
			label: "rest",
			scopeKey: "reward",
			weight: Number(GameData.reward?.weight || 0),
			items: GameData.reward?.items || []
		},
		{
			type: "move",
			label: "move",
			scopeKey: "aod",
			weight: Number(GameData.aod?.weight || 0),
			items: GameData.aod?.items || []
		},
		{
			type: "sports",
			label: "sports",
			scopeKey: "sports",
			weight: Number(GameData.sports?.weight || 0),
			items: GameData.sports?.items || []
		}
	];

	const allowed = Array.isArray(allowedTypes) && allowedTypes.length
		? new Set(allowedTypes)
		: null;

	return modules.map((module) => {
		const selectedItems = (module.items || []).filter((item) => item && item.selected);
		const enabledByPool = selectedItems.length > 0;
		const enabledByAllowedTypes = !allowed || allowed.has(module.type);
		const participates = enabledByAllowedTypes && enabledByPool && module.weight > 0;

		return {
			type: module.type,
			label: module.label,
			scopeKey: module.scopeKey,
			weight: module.weight,
			totalCount: Array.isArray(module.items) ? module.items.length : 0,
			selectedCount: selectedItems.length,
			enabledByAllowedTypes,
			enabledByPool,
			participates,
			selectedItems: selectedItems.map((item) => ({
				id: String(item.id || ""),
				rawName: String(item.name || "").trim(),
				displayName: getLocalizedItemName(module.scopeKey, item)
			}))
		};
	});
}

function countTypes(rows) {
	const counts = {
		action: 0,
		rest: 0,
		move: 0,
		sports: 0,
		error: 0,
		unknown: 0
	};

	(rows || []).forEach((row) => {
		const type = String(row?.type || "unknown");
		if (Object.prototype.hasOwnProperty.call(counts, type)) {
			counts[type] += 1;
		} else {
			counts.unknown += 1;
		}
	});

	return counts;
}

function samplePunishmentDistribution(iterations = 4000, allowedTypes = ["action", "rest", "move", "sports"]) {
	const runs = Math.max(100, Number.parseInt(iterations, 10) || 4000);
	const types = Array.isArray(allowedTypes) && allowedTypes.length ? allowedTypes : ["action", "rest", "move", "sports"];
	const counts = {
		action: 0,
		rest: 0,
		move: 0,
		sports: 0,
		error: 0,
		unknown: 0
	};

	for (let i = 0; i < runs; i++) {
		const result = generatePunishment(types);
		const type = String(result?.type || "unknown");
		if (Object.prototype.hasOwnProperty.call(counts, type)) {
			counts[type] += 1;
		} else {
			counts.unknown += 1;
		}
	}

	const rows = Object.entries(counts)
		.filter(([, count]) => count > 0)
		.map(([type, count]) => ({
			type,
			count,
			ratio: `${((count / runs) * 100).toFixed(2)}%`
		}));

	return {
		iterations: runs,
		allowedTypes: [...types],
		counts,
		rows
	};
}

function buildGameDebugSnapshot() {
	if (!mapData || !current_punishment_passive || !current_task_master || !currentBoardDebugMeta) {
		return null;
	}

	const passiveCells = Object.keys(current_punishment_passive)
		.map((key) => {
			const cell = Number.parseInt(key, 10);
			const item = current_punishment_passive[key] || {};
			return {
				cell,
				type: String(item.type || ""),
				rawText: String(item.text || ""),
				displayText: localizeBuiltinText(String(item.text || ""))
			};
		})
		.sort((a, b) => a.cell - b.cell);

	const masterCells = Object.keys(current_task_master)
		.map((key) => {
			const cell = Number.parseInt(key, 10);
			const item = current_task_master[key] || {};
			return {
				cell,
				rawText: String(item.text || ""),
				displayText: localizeBuiltinText(String(item.text || ""))
			};
		})
		.sort((a, b) => a.cell - b.cell);

	const earlyZoneEnd = Math.min(18, Math.max(1, endNumber - 1));
	const earlyPassiveCells = passiveCells.filter((cell) => cell.cell >= 2 && cell.cell <= earlyZoneEnd);
	const earlyModuleStates = buildPunishmentModuleStates(["action", "move", "sports"]);
	const allModuleStates = buildPunishmentModuleStates(["action", "rest", "move", "sports"]);

	return {
		generatedAt: new Date().toISOString(),
		board: {
			...currentBoardDebugMeta,
			mode: IS_DUAL ? "dual" : "solo",
			size: mapData.length,
			filledCells: getNonZeroCount(mapData),
			steps: endNumber
		},
		uiSettings: { ...gameUiSettings },
		weights: {
			action: Number(GameData.prop?.weight || 0),
			rest: Number(GameData.reward?.weight || 0),
			move: Number(GameData.aod?.weight || 0),
			sports: Number(GameData.sports?.weight || 0),
			active: Number(ActiveData.weight || 0)
		},
		moduleStates: {
			all: allModuleStates,
			earlyReplacementPool: earlyModuleStates
		},
		selections: {
			posture: buildSelectionDebug("posture", GameData.posture?.items),
			prop: buildSelectionDebug("prop", GameData.prop?.items),
			reward: buildSelectionDebug("reward", GameData.reward?.items),
			aod: buildSelectionDebug("aod", GameData.aod?.items),
			sports: buildSelectionDebug("sports", GameData.sports?.items),
			active: buildSelectionDebug("active", ActiveData.items)
		},
		passiveSummary: countBTaskModules(current_punishment_passive),
		earlyPassiveSummary: {
			endCell: earlyZoneEnd,
			counts: countTypes(earlyPassiveCells)
		},
		passiveCells,
		masterCells,
		boardMatrix: mapData.map((row) => [...row])
	};
}

function publishGameDebugSnapshot() {
	const snapshot = buildGameDebugSnapshot();
	if (!snapshot) return;
	if (window.GameBoardDebug && typeof window.GameBoardDebug.setSnapshot === "function") {
		window.GameBoardDebug.setSnapshot(snapshot);
	}
}

window.__SFC_GET_GAME_DEBUG_SNAPSHOT = buildGameDebugSnapshot;
window.__SFC_SAMPLE_PUNISHMENT_DISTRIBUTION = samplePunishmentDistribution;

function formatCountRatio(count, total) {
	if (!Number.isFinite(total) || total <= 0) return `${count}/0（0.0%）`;
	const percent = ((count / total) * 100).toFixed(1);
	return `${count}/${total}（${percent}%）`;
}

function projectMoveTargetForSimulation(position, end, punishment, randomFn = Math.random) {
	if (!punishment || punishment.type !== 'move') return position;

	const instruction = resolveMoveInstruction(punishment.text);
	if (instruction.kind === 'toEnd') return end;
	if (instruction.kind === 'toStart') return 1;
	if (instruction.kind === 'forwardRange' || instruction.kind === 'backwardRange') {
		const offset = Math.floor(randomFn() * 3) + 1;
		const signed = instruction.kind === 'forwardRange' ? offset : -offset;
		return Math.max(1, Math.min(end, position + signed));
	}

	return position;
}

function getActionCountFromTaskText(taskText) {
	const parsed = parseTrailingNumber(taskText);
	const count = Number(parsed && parsed.value);
	return Number.isFinite(count) && count > 0 ? count : 0;
}

function extractMasterCountRuleForSimulation(taskText) {
	const text = String(taskText || "").trim();
	if (!text) return null;
	if (text.includes(ACTIVE_TEXT.countPlus5)) return { type: "add", value: 5 };
	if (text.includes(ACTIVE_TEXT.countPlus10)) return { type: "add", value: 10 };
	if (text.includes(ACTIVE_TEXT.countMinus5)) return { type: "add", value: -5 };
	if (text.includes(ACTIVE_TEXT.countMinus10)) return { type: "add", value: -10 };
	if (text.includes(ACTIVE_TEXT.doubleCount)) return { type: "multiply", value: 2 };
	if (text.includes(ACTIVE_TEXT.halfUp)) return { type: "half", value: 0 };
	return null;
}

function applyMasterRuleToActionCount(count, rule) {
	if (!Number.isFinite(count) || count <= 0 || !rule) return Math.max(0, count || 0);
	return applyCountRule(count, rule);
}

function simulateReachableBTaskCellsOnce(passiveMap, end, maxTurns, randomFn = Math.random, options = {}) {
	let passivePosition = 1;
	let masterPosition = 1;
	const visited = new Set();
	let totalActionHits = 0;
	const isDual = !!options.isDual;
	const masterMap = options.masterMap || {};

	for (let turn = 0; turn < maxTurns; turn++) {
		let roundActionCount = null;
		let roundActionTriggered = false;
		let roundMasterRule = null;

		const actorOrder = isDual
			? (randomFn() < 0.5 ? ["master", "passive"] : ["passive", "master"])
			: ["passive"];

		const finalizeRound = () => {
			if (!roundActionTriggered || !Number.isFinite(roundActionCount) || roundActionCount <= 0) return;
			totalActionHits += roundActionCount;
		};

		for (const actor of actorOrder) {
			if (actor === "master") {
				masterPosition = Math.min(end, masterPosition + Math.floor(randomFn() * 6) + 1);
				if (masterPosition >= end) {
					finalizeRound();
					return { visitedCount: visited.size, totalActionHits, finished: true };
				}

				const masterTask = masterMap[masterPosition];
				roundMasterRule = extractMasterCountRuleForSimulation(masterTask && masterTask.text);
				if (roundActionTriggered && roundMasterRule && roundActionCount !== null) {
					roundActionCount = applyMasterRuleToActionCount(roundActionCount, roundMasterRule);
				}
				continue;
			}

			passivePosition = Math.min(end, passivePosition + Math.floor(randomFn() * 6) + 1);
			if (passivePosition >= end) {
				finalizeRound();
				return { visitedCount: visited.size, totalActionHits, finished: true };
			}

			if (passivePosition > 1 && passivePosition < end) {
				visited.add(passivePosition);
			}

			const passiveTask = passiveMap[passivePosition];
			if (passiveTask && passiveTask.type === "action") {
				roundActionTriggered = true;
				roundActionCount = getActionCountFromTaskText(passiveTask.text);
				if (roundMasterRule) {
					roundActionCount = applyMasterRuleToActionCount(roundActionCount, roundMasterRule);
				}
			}

			if (passiveTask && passiveTask.type === "move") {
				passivePosition = projectMoveTargetForSimulation(passivePosition, end, passiveTask, randomFn);
				if (passivePosition >= end) {
					finalizeRound();
					return { visitedCount: visited.size, totalActionHits, finished: true };
				}
			}
		}

		finalizeRound();
	}

	return { visitedCount: visited.size, totalActionHits, finished: false };
}

function pickQuantile(sortedValues, quantile) {
	if (!sortedValues.length) return 0;
	const clampedQ = Math.max(0, Math.min(1, quantile));
	const index = Math.round((sortedValues.length - 1) * clampedQ);
	return sortedValues[index];
}

function estimateReachableBTaskCells(passiveMap, end, taskCellCount, options = {}) {
	if (!passiveMap || !Number.isFinite(end) || end <= 2 || taskCellCount <= 0) {
		return {
			reachableMean: 0,
			reachableLow: 0,
			reachableHigh: 0,
			hitsMean: 0,
			hitsLow: 0,
			hitsHigh: 0,
			runs: 0,
			ci95: 0,
			maxTurns: 0,
			truncatedRuns: 0
		};
	}

	const minRuns = 1200;
	const maxRuns = 7200;
	const batchSize = 300;
	const maxTurns = Math.max(90, end * 8);
	const stopCiThreshold = Math.max(0.25, taskCellCount * 0.01);

	let runs = 0;
	let reachableMean = 0;
	let hitsMean = 0;
	let hitsM2 = 0;
	let truncatedRuns = 0;
	const reachableSamples = [];
	const hitsSamples = [];

	while (runs < maxRuns) {
		const currentBatch = Math.min(batchSize, maxRuns - runs);
		for (let i = 0; i < currentBatch; i++) {
			const result = simulateReachableBTaskCellsOnce(passiveMap, end, maxTurns, Math.random, options);
			const reachableValue = result.visitedCount;
			const hitsValue = result.totalActionHits;
			runs += 1;
			reachableSamples.push(reachableValue);
			hitsSamples.push(hitsValue);
			if (!result.finished) truncatedRuns += 1;

			const deltaReachable = reachableValue - reachableMean;
			reachableMean += deltaReachable / runs;

			const deltaHits = hitsValue - hitsMean;
			hitsMean += deltaHits / runs;
			hitsM2 += deltaHits * (hitsValue - hitsMean);
		}

		if (runs >= minRuns) {
			const variance = runs > 1 ? (hitsM2 / (runs - 1)) : 0;
			const stdErr = Math.sqrt(variance / Math.max(runs, 1));
			const ci95 = 1.96 * stdErr;
			if (ci95 <= stopCiThreshold) {
				break;
			}
		}
	}

	const variance = runs > 1 ? (hitsM2 / (runs - 1)) : 0;
	const stdErr = Math.sqrt(variance / Math.max(runs, 1));
	const ci95 = 1.96 * stdErr;
	const sortedReachable = reachableSamples.slice().sort((a, b) => a - b);
	const sortedHits = hitsSamples.slice().sort((a, b) => a - b);

	return {
		reachableMean,
		reachableLow: pickQuantile(sortedReachable, 0.1),
		reachableHigh: pickQuantile(sortedReachable, 0.9),
		hitsMean,
		hitsLow: pickQuantile(sortedHits, 0.1),
		hitsHigh: pickQuantile(sortedHits, 0.9),
		runs,
		ci95,
		maxTurns,
		truncatedRuns
	};
}

function getCustomBoardsFromStorage(){
	try{
		const raw = JSON.parse(localStorage.getItem("CUSTOM_BOARDS") || "[]");
		return Array.isArray(raw) ? raw : [];
	}catch(err){
		console.error("[Game] Failed to read custom boards", err);
		return [];
	}
}

function resolveBoardPayload(boardToken){
	const token = String(boardToken || "builtin:1").trim();

	if (token.startsWith("custom:")){
		const customId = token.slice("custom:".length);
		const customBoards = getCustomBoardsFromStorage();
		const found = customBoards.find(item => String(item.id) === customId);

		if (found && Array.isArray(found.board)){
			return {
				type: "custom",
				token,
				name: found.name || t("createBoards.defaultBoardName"),
				board: found.board
			};
		}
	}

	let index = 1;

	if (token.startsWith("builtin:")){
		index = parseInt(token.slice("builtin:".length), 10);
	}else{
		index = parseInt(token, 10);
	}

	if (isNaN(index) || index < 1 || index > Boards.length){
		index = 1;
	}

	return {
		type: "builtin",
		token: `builtin:${index}`,
		name: getLocalizedBoardMeta(index - 1).name || `Board ${index}`,
		board: Boards[index - 1]
	};
}

function generateBoardFromData(boardData){
	const nonZeroCount = getNonZeroCount(boardData) - 2;
	const passiveMap = {};
	const masterMap = {};

	for (let i = 0; i < nonZeroCount; i++){
		const num = i + 2;
		passiveMap[num] = generatePunishment(['action', 'rest', 'move', 'sports']);
		masterMap[num] = generateMasterTask();
	}

	const earlyCap = Math.min(18, nonZeroCount + 1);
	for (let num = 2; num <= earlyCap; num++) {
		const p = passiveMap[num];
		if (!p || p.type !== "rest") continue;

		const replacement = generatePunishment(['action', 'move', 'sports']);
		if (replacement && replacement.type !== "error") {
			passiveMap[num] = replacement;
		}
	}

	return { passiveMap, masterMap };
}

function generateBoard(boardIndex) {
	const payload = resolveBoardPayload(`builtin:${boardIndex}`);
	return generateBoardFromData(payload.board);
}

function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextFrame() {
	return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function clampNumber(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function lerp(start, end, progress) {
	return start + ((end - start) * progress);
}

function easeInOutSine(value) {
	return -(Math.cos(Math.PI * value) - 1) / 2;
}

function easeInOutCubic(value) {
	if (value < 0.5) return 4 * value * value * value;
	return 1 - (Math.pow(-2 * value + 2, 3) / 2);
}

function easeOutCubic(value) {
	return 1 - Math.pow(1 - value, 3);
}

function getBoardIntroWashCurve(progress) {
	const t = clampNumber(progress, 0, 1);
	if (t < 0.2) {
		return 0.05 * easeInOutSine(t / 0.2);
	}
	if (t < 0.78) {
		return 0.05 + (0.88 * easeInOutCubic((t - 0.2) / 0.58));
	}
	return 0.93 + (0.07 * easeOutCubic((t - 0.78) / 0.22));
}

function parseCssRgba(colorText) {
	const fallback = { r: 0, g: 0, b: 0, a: 0.1 };
	const match = String(colorText || "").trim().match(/^rgba?\(([^)]+)\)$/i);
	if (!match) return fallback;

	const parts = match[1].split(",").map((part) => part.trim());
	if (parts.length < 3) return fallback;

	const r = Number.parseFloat(parts[0]);
	const g = Number.parseFloat(parts[1]);
	const b = Number.parseFloat(parts[2]);
	const a = parts[3] !== undefined ? Number.parseFloat(parts[3]) : 1;

	if (![r, g, b, a].every(Number.isFinite)) return fallback;
	return { r, g, b, a };
}

function formatRgbaColor(color) {
	return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${clampNumber(color.a, 0, 1).toFixed(3)})`;
}

function shouldAnimateBoardIntro() {
	return !!gameUiSettings.enableBoardIntroAnimation;
}

function buildBoardIntroOrder(lastNumber) {
	const order = [];
	let left = 2;
	let right = lastNumber - 1;

	while (left <= right) {
		order.push(left);
		if (right !== left) order.push(right);
		left += 1;
		right -= 1;
	}

	return order;
}

function revealBoardIntroCell(cell) {
	if (!cell) return;
	cell.classList.remove('board-intro-pending');
	cell.classList.add('board-intro-revealed');
	setTimeout(() => {
		cell.classList.remove('board-intro-revealed');
	}, 260);
}

function revealBoardIntroRow(cells) {
	if (!Array.isArray(cells)) return;

	cells.forEach((cell) => {
		if (!cell) return;
		cell.classList.remove('board-intro-row-pending');
		cell.classList.add('board-intro-row-revealed');
		setTimeout(() => {
			cell.classList.remove('board-intro-row-revealed');
		}, 240);
	});
}

function getBoardIntroWashTarget() {
	if (!boardIntroWash || !board) return null;

	const rect = board.getBoundingClientRect();
	const top = Math.max(0, rect.top);
	const left = Math.max(0, rect.left);
	const right = Math.max(0, window.innerWidth - rect.right);
	const bottom = Math.max(0, window.innerHeight - rect.bottom);
	const radius = Number.parseFloat(getComputedStyle(board).borderTopLeftRadius) || 12;
	const shadowColor = parseCssRgba(getComputedStyle(document.documentElement).getPropertyValue('--shadow-color'));

	boardIntroWash.style.setProperty('--board-intro-top', `${top}px`);
	boardIntroWash.style.setProperty('--board-intro-right', `${right}px`);
	boardIntroWash.style.setProperty('--board-intro-bottom', `${bottom}px`);
	boardIntroWash.style.setProperty('--board-intro-left', `${left}px`);
	boardIntroWash.style.setProperty('--board-intro-radius', `${radius}px`);

	return {
		top,
		right,
		bottom,
		left,
		radius,
		shadowColor
	};
}

function applyBoardIntroWashFrame(target, progress) {
	if (!boardIntroWash || !target) return;

	const clipProgress = getBoardIntroWashCurve(progress);
	const top = lerp(0, target.top, clipProgress);
	const right = lerp(0, target.right, clipProgress);
	const bottom = lerp(0, target.bottom, clipProgress);
	const left = lerp(0, target.left, clipProgress);
	const radius = lerp(0, target.radius, clipProgress);

	const shadowProgressRaw = clampNumber((progress - 0.62) / 0.38, 0, 1);
	const shadowProgress = easeOutCubic(shadowProgressRaw);
	const shadowColor = {
		...target.shadowColor,
		a: target.shadowColor.a * shadowProgress
	};

	boardIntroWash.style.clipPath = `inset(${top.toFixed(2)}px ${right.toFixed(2)}px ${bottom.toFixed(2)}px ${left.toFixed(2)}px round ${radius.toFixed(2)}px)`;
	boardIntroWash.style.boxShadow = `0 ${(4 * shadowProgress).toFixed(2)}px ${(20 * shadowProgress).toFixed(2)}px ${formatRgbaColor(shadowColor)}`;
}

async function playBoardIntroWash(sequenceId) {
	if (!boardIntroWash) return;

	boardIntroWash.classList.remove('is-hidden', 'is-active', 'is-exiting');
	boardIntroWash.style.opacity = '1';
	boardIntroWash.style.clipPath = 'inset(0 0 0 0 round 0px)';
	boardIntroWash.style.boxShadow = '0 0 0 rgba(0, 0, 0, 0)';

	await nextFrame();
	await nextFrame();
	if (sequenceId !== boardIntroSequenceId) return;

	const target = getBoardIntroWashTarget();
	if (!target) return;

	await new Promise((resolve) => {
		const startedAt = performance.now();

		function step(now) {
			if (sequenceId !== boardIntroSequenceId) {
				resolve();
				return;
			}

			const progress = clampNumber((now - startedAt) / BOARD_SHELL_REVEAL_MS, 0, 1);
			applyBoardIntroWashFrame(target, progress);

			if (progress >= 1) {
				resolve();
				return;
			}

			requestAnimationFrame(step);
		}

		requestAnimationFrame(step);
	});
	if (sequenceId !== boardIntroSequenceId) return;

	boardIntroWash.classList.add('is-exiting');
	await wait(BOARD_SHELL_FADE_MS);
	if (sequenceId !== boardIntroSequenceId) return;

	boardIntroWash.classList.add('is-hidden');
	boardIntroWash.classList.remove('is-active', 'is-exiting');
}

function finishBoardIntroAnimation(sequenceId) {
	if (sequenceId !== boardIntroSequenceId) return;
	isBoardIntroAnimating = false;
	resetBoardIntroPresentation();
	setButtonsState();
}

async function playBoardIntroAnimation(cellMap, rowCells, lastNumber) {
	if (!board) return;

	const sequenceId = ++boardIntroSequenceId;
	const order = buildBoardIntroOrder(lastNumber);
	const usableDuration = Math.max(
		BOARD_INTRO_STEP_MIN_MS,
		BOARD_INTRO_TOTAL_MS - BOARD_INTRO_START_DELAY_MS - BOARD_INTRO_HEAD_HOLD_MS
	);
	const stepDelay = clampNumber(
		Math.floor(usableDuration / Math.max(order.length, 1)),
		BOARD_INTRO_STEP_MIN_MS,
		BOARD_INTRO_STEP_MAX_MS
	);

	isBoardIntroAnimating = true;
	board.classList.add('is-intro-running');
	setBoardIntroUiHidden(true);
	setButtonsState();

	await playBoardIntroWash(sequenceId);
	if (sequenceId !== boardIntroSequenceId) return;

	for (const row of rowCells) {
		if (sequenceId !== boardIntroSequenceId) return;
		revealBoardIntroRow(row);
		await wait(BOARD_ROW_REVEAL_STEP_MS);
	}

	await wait(BOARD_ROW_REVEAL_SETTLE_MS);
	if (sequenceId !== boardIntroSequenceId) return;

	await wait(BOARD_INTRO_START_DELAY_MS);
	if (sequenceId !== boardIntroSequenceId) return;

	revealBoardIntroCell(cellMap.get(1));
	if (lastNumber !== 1) revealBoardIntroCell(cellMap.get(lastNumber));

	if (!order.length) {
		await wait(BOARD_INTRO_HEAD_HOLD_MS);
		if (sequenceId !== boardIntroSequenceId) return;
		setBoardIntroUiHidden(false);
		await wait(BOARD_UI_FADE_IN_MS);
		if (sequenceId !== boardIntroSequenceId) return;
		finishBoardIntroAnimation(sequenceId);
		return;
	}

	await wait(BOARD_INTRO_HEAD_HOLD_MS);
	if (sequenceId !== boardIntroSequenceId) return;

	for (const number of order) {
		if (sequenceId !== boardIntroSequenceId) return;
		revealBoardIntroCell(cellMap.get(number));
		await wait(stepDelay);
	}

	setBoardIntroUiHidden(false);
	await wait(BOARD_UI_FADE_IN_MS);
	if (sequenceId !== boardIntroSequenceId) return;

	finishBoardIntroAnimation(sequenceId);
}

function renderBoard(boardToken, options = {}){
	const restoredState = options.restoreState || null;
	const payload = resolveBoardPayload(restoredState?.boardToken || boardToken);
	const shouldAnimateIntro = !restoredState && !options.disableIntro && shouldAnimateBoardIntro();

	boardIntroSequenceId += 1;
	isBoardIntroAnimating = false;
	current_board = restoredState?.boardToken || payload.token;
	currentBoardDebugMeta = {
		token: restoredState?.boardMeta?.token || payload.token,
		type: restoredState?.boardMeta?.type || payload.type,
		name: restoredState?.boardMeta?.name || payload.name || ""
	};
	mapData = restoredState ? cloneGameSessionValue(restoredState.mapData) : payload.board;
	if (!isValidBoardMatrix(mapData)) {
		throw new Error('[Game] Invalid board matrix during render.');
	}
	if (restoredState) {
		current_punishment_passive = cloneGameSessionValue(restoredState.passiveMap);
		current_task_master = cloneGameSessionValue(restoredState.masterMap);
	} else {
		const packs = generateBoardFromData(mapData);
		current_punishment_passive = packs.passiveMap;
		current_task_master = packs.masterMap;
	}

	board.innerHTML = '';
	resetBoardIntroPresentation();
	if (shouldAnimateIntro) prepareBoardIntroPresentation();

	const startNumber = 1;
	passive_location = restoredState ? restoredState.passiveLocation : 1;
	master_location = restoredState ? restoredState.masterLocation : 1;
	actualActionTotal = restoredState ? restoredState.actualActionTotal : 0;
	actualActionTriggerCount = restoredState ? restoredState.actualActionTriggerCount : 0;
	lastRecordedActionRound = restoredState ? restoredState.lastRecordedActionRound : 0;
	lastRecordedActionCount = restoredState ? restoredState.lastRecordedActionCount : 0;
	lastRecordedActionAdjusted = restoredState ? restoredState.lastRecordedActionAdjusted : false;
	roundNo = restoredState ? restoredState.roundNo : 1;
	roundMasterDone = restoredState ? restoredState.roundMasterDone : false;
	roundPassiveDone = restoredState ? restoredState.roundPassiveDone : false;
	zEffectState.countRule = restoredState?.zEffectState?.countRule || null;
	zEffectState.forcedPosture = restoredState?.zEffectState?.forcedPosture || "";
	zEffectState.splitExecution = !!restoredState?.zEffectState?.splitExecution;
	zEffectState.restInvalidToken = Math.max(0, Number(restoredState?.zEffectState?.restInvalidToken || 0));
	roundPassiveSnapshot = restoredState?.roundPassiveSnapshot ? cloneGameSessionValue(restoredState.roundPassiveSnapshot) : null;
	endNumber = Math.max(...mapData.flat());
	const cellMap = new Map();
	const rowCells = [];
	const fragment = document.createDocumentFragment();

	const size = mapData.length;
	board.style.display = 'grid';
	rolldice.style.display = 'block';
	if (rollmaster) rollmaster.style.display = IS_DUAL ? 'block' : 'none';
	board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

	for (let i = 0; i < size; i++) {
		const row = [];
		for (let j = 0; j < size; j++) {
			const cellValue = mapData[i][j];
			const cell = document.createElement('div');
			cell.className = 'cell';

			if (cellValue !== 0) {
				if (cellValue === startNumber) {
					cell.classList.add('start');
				} else if (cellValue === endNumber) {
					cell.classList.add('end');
				} else {
					cell.classList.add('black');
				}

				if (cellValue === passive_location) cell.classList.add('passive-location');
				if (IS_DUAL && cellValue === master_location) cell.classList.add('master-location');

				cell.addEventListener('click', () => showCellInfo(cellValue));
				cell.innerHTML = '';
				cell.dataset.number = cellValue;
				cellMap.set(cellValue, cell);

				if (shouldAnimateIntro) {
					cell.classList.add('board-intro-pending');
				}
			}

			if (shouldAnimateIntro) {
				cell.classList.add('board-intro-row-pending');
			}

			row.push(cell);
			fragment.appendChild(cell);
		}
		rowCells.push(row);
	}

	board.appendChild(fragment);
	publishGameDebugSnapshot();

	if (shouldAnimateIntro) {
		playBoardIntroAnimation(cellMap, rowCells, endNumber);
	} else {
		resetBoardIntroPresentation();
		setButtonsState();
	}
	updateRoundInfo();
	updateVetoBadge();
	updateBTaskLiveCount();
	setTaskText('master', restoredState?.taskMasterText || t("common.status.dash"));
	setTaskText('passive', restoredState?.taskPassiveText || t("common.status.dash"));

	track("game_started", {
		mode: IS_DUAL ? "dual" : "solo",
		board_type: payload.type,
		board_steps: endNumber
	});
}

function escapeHtml(str) {
	return String(str || '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

const REST_COUNTDOWN_FALLBACK_SECONDS = 10;
const DURATION_PATTERN = new RegExp(DURATION_LOGIC.regex || "(\\d+(?:\\.\\d+)?|[a-z]+)\\s*(minutes?|mins?|min|m|seconds?|secs?|sec|s)", "i");
const DURATION_HALF_TOKEN = String(DURATION_LOGIC.halfToken || "");
const DURATION_TEN_TOKEN = String(DURATION_LOGIC.tenToken || "");
const DURATION_DIGIT_MAP = DURATION_LOGIC.digits || {};
const DURATION_MINUTE_TOKENS = Array.isArray(DURATION_LOGIC.minuteTokens) ? DURATION_LOGIC.minuteTokens : [];

function isMinuteUnit(unit) {
	const normalized = String(unit || "").toLowerCase();
	return DURATION_MINUTE_TOKENS.some((token) => {
		const value = String(token || "").toLowerCase();
		return value.length === 1 ? normalized.startsWith(value) : normalized.includes(value);
	});
}

function parseChineseNumber(rawValue) {
	const value = String(rawValue || '').trim();
	if (!value) return NaN;
	if (DURATION_HALF_TOKEN && value === DURATION_HALF_TOKEN) return 0.5;

	if (DURATION_TEN_TOKEN && value.includes(DURATION_TEN_TOKEN)) {
		const [tenPart, unitPart] = value.split(DURATION_TEN_TOKEN);
		const tens = tenPart ? (DURATION_DIGIT_MAP[tenPart] ?? NaN) : 1;
		const units = unitPart ? (DURATION_DIGIT_MAP[unitPart] ?? NaN) : 0;
		if (Number.isNaN(tens) || Number.isNaN(units)) return NaN;
		return (tens * 10) + units;
	}

	let result = '';
	for (const char of value) {
		if (DURATION_DIGIT_MAP[char] === undefined) return NaN;
		result += String(DURATION_DIGIT_MAP[char]);
	}

	return Number(result);
}

function getRestCountdownConfig(text) {
	const content = String(text || '').trim();
	const match = content.match(DURATION_PATTERN);

	if (!match) {
		return {
			seconds: REST_COUNTDOWN_FALLBACK_SECONDS,
			usedFallback: true
		};
	}

	const rawValue = match[1];
	const unit = match[2].toLowerCase();
	const value = /^\d/.test(rawValue) ? Number.parseFloat(rawValue) : parseChineseNumber(rawValue);

	if (!Number.isFinite(value) || value <= 0) {
		return {
			seconds: REST_COUNTDOWN_FALLBACK_SECONDS,
			usedFallback: true
		};
	}

	let multiplier = 1;
	if (isMinuteUnit(unit)) {
		multiplier = 60;
	}

	return {
		seconds: Math.max(1, Math.round(value * multiplier)),
		usedFallback: false
	};
}

function hasDurationHint(text){
	return DURATION_PATTERN.test(String(text || '').trim());
}

function normalizeDurationUnit(rawUnit) {
	const unit = String(rawUnit || "").toLowerCase();
	if (isMinuteUnit(unit)) return t("game.countdown.minuteUnit");
	return t("game.countdown.secondUnit");
}

function normalizeDurationForDisplay(text) {
	const content = String(text || '').trim();
	const match = content.match(DURATION_PATTERN);
	if (!match) return content;

	const rawValue = match[1];
	const parsedValue = /^\d/.test(rawValue) ? Number.parseFloat(rawValue) : parseChineseNumber(rawValue);
	if (!Number.isFinite(parsedValue) || parsedValue <= 0) return content;

	const numberText = Number.isInteger(parsedValue)
		? String(parsedValue)
		: String(parsedValue).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');

	return content.replace(match[0], `${numberText}${normalizeDurationUnit(match[2])}`);
}

function formatCountdown(remainingMs) {
	const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}

	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showTimedCountdownDialog(taskType, taskText) {
	const { seconds, usedFallback } = getRestCountdownConfig(taskText);
	const totalMs = seconds * 1000;
	const displayText = normalizeDurationForDisplay(taskText);
	const isSports = taskType === "sports";
	const title = isSports ? t("game.countdown.sportsTitle") : t("game.countdown.restTitle");
	const badge = t("game.countdown.badge");
	const noteText = usedFallback
		? t("game.countdown.fallback", { seconds })
		: t("game.countdown.current", { value: formatCountdown(totalMs) });
	track(isSports ? "sports_countdown_started" : "rest_countdown_started", {
		seconds,
		used_fallback: usedFallback
	});

	return new Promise((resolve) => {
		const overlay = document.createElement('div');
		overlay.className = 'punishment-overlay';

		const dialog = document.createElement('div');
		dialog.className = 'punishment-dialog rest-countdown-dialog';
		dialog.innerHTML = `
			<h3 class="punishment-title">${title}</h3>
			<div class="punishment-content rest-countdown-content">
				<div class="rest-countdown-badge">${badge}</div>
				<div class="rest-countdown-text">${escapeHtml(localizeBuiltinText(displayText))}</div>
				<div class="rest-countdown-number" id="restCountdownValue">${formatCountdown(totalMs)}</div>
				<div class="rest-countdown-progress" aria-hidden="true">
					<div class="rest-countdown-progress-bar" id="restCountdownBar"></div>
				</div>
				<div class="rest-countdown-note">${noteText}</div>
			</div>
		`;

		const countdownValue = dialog.querySelector('#restCountdownValue');
		const progressBar = dialog.querySelector('#restCountdownBar');
		const startedAt = performance.now();
		let timerId = 0;
		let finished = false;

		const finish = () => {
			if (finished) return;
			finished = true;
			if (timerId) {
				window.clearInterval(timerId);
			}
			track(isSports ? "sports_countdown_completed" : "rest_countdown_completed", { seconds });
			overlay.remove();
			resolve();
		};

		const tick = () => {
			const elapsed = Math.min(performance.now() - startedAt, totalMs);
			const remaining = Math.max(totalMs - elapsed, 0);
			const progress = totalMs > 0 ? elapsed / totalMs : 1;

			countdownValue.textContent = formatCountdown(remaining);
			progressBar.style.transform = `scaleX(${progress})`;

			if (elapsed >= totalMs) {
				finish();
			}
		};

		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				playDialogShake(dialog);
			}
		});

		overlay.appendChild(dialog);
		document.body.appendChild(overlay);

		tick();
		timerId = window.setInterval(tick, 100);
	});
}

let isMoving = false;

function setTaskText(role, text) {
	const el = document.getElementById(role === 'master' ? 'taskMaster' : 'taskPassive');
	if (!el) return;
	el.textContent = text || t("common.status.dash");
	persistGameSessionSnapshot();
}

function updateBTaskLiveCount() {
	if (!bTaskLiveCount) return;
	if (!gameUiSettings.showBTaskLiveCount) {
		bTaskLiveCount.hidden = true;
		bTaskLiveCount.style.display = "none";
		return;
	}
	bTaskLiveCount.hidden = false;
	bTaskLiveCount.style.display = "";
	bTaskLiveCount.textContent = t("game.liveCount", { count: actualActionTotal });
}

function extractActionCountForRecord(displayText, transformedCount) {
	if (Number.isFinite(transformedCount) && transformedCount > 0) {
		return transformedCount;
	}
	const matches = String(displayText || "").match(/\d+/g);
	if (!matches || !matches.length) return 0;
	const first = Number.parseInt(matches[0], 10);
	return Number.isFinite(first) && first > 0 ? first : 0;
}

function showReachEstimateHelpDialog(reachEstimate) {
	const overlay = document.createElement('div');
	overlay.className = 'punishment-overlay';

	const dialog = document.createElement('div');
	dialog.className = 'punishment-dialog';
	dialog.innerHTML = `
		<h3 class="punishment-title">${t("game.stats.reachHelpTitle")}</h3>
		<div class="punishment-content b-task-stats-content">
			<div class="b-task-stats-section">
				<div class="b-task-stats-row">
					<span>${t("game.stats.reachMean")}</span>
					<strong>${t("game.stats.cellsUnit", { value: reachEstimate.reachableMean.toFixed(1) })}</strong>
				</div>
				<div class="b-task-stats-row">
					<span>${t("game.stats.reachRange")}</span>
					<strong>${t("game.stats.cellsUnit", { value: `${reachEstimate.reachableLow} - ${reachEstimate.reachableHigh}` })}</strong>
				</div>
				<div class="b-task-stats-row">
					<span>${t("game.stats.hitsMean")}</span>
					<strong>${reachEstimate.hitsMean.toFixed(1)}</strong>
				</div>
				<div class="b-task-stats-row">
					<span>${t("game.stats.hitsRange")}</span>
					<strong>${reachEstimate.hitsLow} - ${reachEstimate.hitsHigh}</strong>
				</div>
				<div class="b-task-stats-row">
					<span>${t("game.stats.ci95")}</span>
					<strong>±${reachEstimate.ci95.toFixed(2)}</strong>
				</div>
				<div class="b-task-stats-row">
					<span>${t("game.stats.runs")}</span>
					<strong>${reachEstimate.runs}</strong>
				</div>
			</div>
			<p class="b-task-stats-note">${t("game.stats.note")}</p>
		</div>
	`;
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) overlay.remove();
	});
	dialog.addEventListener('click', (e) => e.stopPropagation());

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);
}

function showBTaskStatsDialog() {
	if (!gameUiSettings.showBTaskPrediction) return;
	if (!mapData || !current_punishment_passive || !endNumber) {
		showInfoDialog(t("game.stats.title"), t("game.stats.notReady"));
		return;
	}

	const bTaskCells = Object.keys(current_punishment_passive).length;
	const moduleCounts = countBTaskModules(current_punishment_passive);
	const reachEstimate = estimateReachableBTaskCells(current_punishment_passive, endNumber, bTaskCells, {
		isDual: IS_DUAL,
		masterMap: current_task_master
	});

	const rows = [
		{ label: getBTaskTypeLabel('action'), value: formatCountRatio(moduleCounts.action, bTaskCells) },
		{ label: getBTaskTypeLabel('rest'), value: formatCountRatio(moduleCounts.rest, bTaskCells) },
		{ label: getBTaskTypeLabel('move'), value: formatCountRatio(moduleCounts.move, bTaskCells) },
		{ label: getBTaskTypeLabel('sports'), value: formatCountRatio(moduleCounts.sports, bTaskCells) }
	];
	if (moduleCounts.unknown > 0) {
		rows.push({ label: getBTaskTypeLabel('unknown'), value: formatCountRatio(moduleCounts.unknown, bTaskCells) });
	}

	const hitsRangeText = t("game.stats.hitsRangeWithMean", {
		low: reachEstimate.hitsLow,
		high: reachEstimate.hitsHigh,
		mean: reachEstimate.hitsMean.toFixed(1)
	});

	const moduleRowsHtml = rows.map(row => `
		<div class="b-task-stats-row">
			<span>${escapeHtml(row.label)}</span>
			<strong>${escapeHtml(row.value)}</strong>
		</div>
	`).join('');

	const overlay = document.createElement('div');
	overlay.className = 'punishment-overlay';

	const dialog = document.createElement('div');
	dialog.className = 'punishment-dialog';
	dialog.innerHTML = `
		<h3 class="punishment-title">${t("game.stats.title")}</h3>
		<div class="punishment-content b-task-stats-content">
			<div class="b-task-stats-section">
				${moduleRowsHtml}
			</div>
			<div class="b-task-stats-divider"></div>
			<div class="b-task-stats-section">
				<div class="b-task-stats-stack">
					<span>${t("game.stats.estimateHitsTotal")}</span>
					<div class="b-task-stats-value-wrap">
						<strong>${hitsRangeText}</strong>
						<button class="b-task-stats-info-btn" id="bTaskStatsInfoBtn" type="button" aria-label="${t("game.stats.estimateHelpAria")}" title="${t("game.stats.estimateHelpTitle")}">
							<i class="bi bi-exclamation-lg" aria-hidden="true"></i>
						</button>
					</div>
				</div>
			</div>
		</div>
		<button class="punishment-button" id="confirmBtn">${t("common.actions.confirm")}</button>
	`;

	const confirmBtn = dialog.querySelector('#confirmBtn');
	const infoBtn = dialog.querySelector('#bTaskStatsInfoBtn');
	confirmBtn.addEventListener('click', () => {
		overlay.remove();
	});
	if (infoBtn) {
		infoBtn.addEventListener('click', () => {
			showReachEstimateHelpDialog(reachEstimate);
		});
	}

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			playDialogShake(confirmBtn);
		}
	});

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);

	track("b_task_stats_opened", {
		task_cells: bTaskCells,
		estimate_hits_mean: Number(reachEstimate.hitsMean.toFixed(2)),
		estimate_runs: reachEstimate.runs
	});
}

function showTip(msg) {
	const el = document.createElement('div');
	el.className = 'tmp-tip';
	el.textContent = msg;
	document.body.appendChild(el);
	requestAnimationFrame(() => el.classList.add('show'));
	setTimeout(() => {
		el.classList.remove('show');
		setTimeout(() => el.remove(), 200);
	}, 1200);
}

function showInfoDialog(title, message) {
	return new Promise((resolve) => {
		const overlay = document.createElement('div');
		overlay.className = 'punishment-overlay';
		const dialog = document.createElement('div');
		dialog.className = 'punishment-dialog';
		dialog.innerHTML = `
			<h3 class="punishment-title">${escapeHtml(title)}</h3>
			<div class="punishment-content">${escapeHtml(message)}</div>
			<button class="punishment-button" id="confirmBtn">${t("common.actions.confirmOk")}</button>
		`;

		const confirmBtn = dialog.querySelector('#confirmBtn');
		confirmBtn.addEventListener('click', () => {
			overlay.remove();
			resolve();
		});

		overlay.appendChild(dialog);
		document.body.appendChild(overlay);
	});
}

function showVetoDecisionDialog(restText) {
	return new Promise((resolve) => {
		const overlay = document.createElement('div');
		overlay.className = 'punishment-overlay';
		const dialog = document.createElement('div');
		dialog.className = 'punishment-dialog';
		dialog.innerHTML = `
			<h3 class="punishment-title">${t("game.veto.title")}</h3>
			<div class="punishment-content">${t("game.veto.detected", { text: escapeHtml(localizeBuiltinText(restText)) })}</div>
			<div class="dialog-buttons">
				<button class="punishment-button" id="useVetoBtn">${t("game.veto.use")}</button>
				<button class="punishment-button" id="keepVetoBtn">${t("game.veto.keep")}</button>
			</div>
		`;

		const useBtn = dialog.querySelector('#useVetoBtn');
		const keepBtn = dialog.querySelector('#keepVetoBtn');
		useBtn.addEventListener('click', () => {
			overlay.remove();
			resolve(true);
		});
		keepBtn.addEventListener('click', () => {
			overlay.remove();
			resolve(false);
		});

		overlay.appendChild(dialog);
		document.body.appendChild(overlay);
	});
}

async function shouldConsumeRestVeto(restText) {
	if (zEffectState.restInvalidToken <= 0) return false;
	const useVeto = await showVetoDecisionDialog(restText);
	if (!useVeto) return false;
	zEffectState.restInvalidToken -= 1;
	updateVetoBadge();
	persistGameSessionSnapshot();
	await showInfoDialog(t("game.veto.title"), t("game.veto.used"));
	return true;
}

function updateRoundInfo() {
	if (!roundInfo) return;
	if (!IS_DUAL) {
		roundInfo.textContent = t("game.roundSingle", { round: roundNo });
		persistGameSessionSnapshot();
		return;
	}
	const done = [];
	if (roundMasterDone) done.push('Z');
	if (roundPassiveDone) done.push('B');
	const suffix = done.length ? t("game.roundSuffix", { done: done.join(" / ") }) : "";
	roundInfo.textContent = t("game.roundDual", { round: roundNo, suffix });
	persistGameSessionSnapshot();
}

function setButtonsState() {
	if (!rolldice) return;
	if (!IS_DUAL) {
		rolldice.disabled = isBoardIntroAnimating;
		rolldice.textContent = t("game.roll.single");
		return;
	}
	if (rollmaster) {
		rollmaster.disabled = isBoardIntroAnimating || roundMasterDone;
		rollmaster.textContent = roundMasterDone ? t("game.roll.done") : t("game.roll.masterIdle");
	}
	rolldice.disabled = isBoardIntroAnimating || roundPassiveDone;
	rolldice.textContent = roundPassiveDone ? t("game.roll.done") : t("game.roll.passiveIdle");
}

function tryAdvanceRound() {
	if (!IS_DUAL) {
		roundNo += 1;
		roundPassiveDone = false;
		setButtonsState();
		updateRoundInfo();
		persistGameSessionSnapshot();
		return;
	}
	if (roundMasterDone && roundPassiveDone) {
		roundNo += 1;
		roundMasterDone = false;
		roundPassiveDone = false;
		setButtonsState();
		updateRoundInfo();
		persistGameSessionSnapshot();
	}
}

if (!IS_DUAL) {
	const masterBlock = document.getElementById('masterTaskBlock');
	if (masterBlock) masterBlock.style.display = 'none';
}

updateRoundInfo();
setButtonsState();
updateVetoBadge();
updateBTaskLiveCount();

function moveStep(from, to, role, stepDuration){
	return new Promise(resolve => {

		const total = stepDuration || window.MOVE_ANIM_DURATION || 500;
		const activeTime = Math.max(80, Math.floor(total * 0.6));
		const gapTime = Math.max(0, total - activeTime);

		const locClass = (role === 'master') ? 'master-location' : 'passive-location';

		const fromCell = document.querySelector(`[data-number="${from}"]`);
		const toCell = document.querySelector(`[data-number="${to}"]`);

		if(fromCell){
			fromCell.classList.remove(locClass);
			fromCell.classList.remove('moving');
		}

		if(!toCell){
			resolve();
			return;
		}

		toCell.classList.add(locClass);
		toCell.style.transitionDuration = activeTime + 'ms';

		requestAnimationFrame(()=>{
			toCell.classList.add('moving');

			setTimeout(() => {
				toCell.classList.remove('moving');
				resolve();
			}, activeTime + gapTime);
		});
	});
}

async function handleSpecialMove(moveType) {
	const startNumber = 1;
	const endNumber = Math.max(...mapData.flat());

	if (moveType === 'toEnd') {
		const steps = endNumber - passive_location;
		if (steps > 0) {
			await moveBySteps(steps, 'passive');
		}
	} else if (moveType === 'toStart') {
		const steps = startNumber - passive_location;
		if (steps < 0) {
			await moveBySteps(steps, 'passive');
		}
	}
}

function resolveMoveInstruction(text) {
	const content = String(text || "");
	if (content.includes(MOVE_TEXT.toEnd)) return { kind: 'toEnd' };
	if (content.includes(MOVE_TEXT.toStart)) return { kind: 'toStart' };
	if (content.includes(MOVE_TEXT.forwardRange)) return { kind: 'forwardRange' };
	if (content.includes(MOVE_TEXT.backwardRange)) return { kind: 'backwardRange' };
	return { kind: 'none' };
}

async function moveBySteps(steps, role) {
	if (isMoving) return;
	isMoving = true;

	try {
		const direction = steps > 0 ? 1 : -1;
		const cur = role === 'master' ? master_location : passive_location;
		const targetLocation = cur + steps;
		const maxLocation = Math.max(...mapData.flat());

		if (targetLocation > maxLocation) steps = maxLocation - cur;
		else if (targetLocation < 1) steps = 1 - cur;

		const totalSteps = Math.abs(steps);

		function getStepDuration(totalSteps, index){
			let base;

			if (totalSteps >= 15) base = 120;
			else if (totalSteps >= 9) base = 180;
			else if (totalSteps >= 5) base = 260;
			else base = 420;

			if (totalSteps >= 6){
				if (index === 0) return base + 80;
				if (index === 1) return base + 30;
				if (index === totalSteps - 1) return base + 60;
			}

			return base;
		}

		for (let i = 0; i < totalSteps; i++) {
			const cur2 = role === 'master' ? master_location : passive_location;
			const nextLocation = cur2 + direction;
			const stepDuration = getStepDuration(totalSteps, i);

			await moveStep(cur2, nextLocation, role, stepDuration);

			if (role === 'master') master_location = nextLocation;
			else passive_location = nextLocation;
		}
		persistGameSessionSnapshot();
	} finally {
		isMoving = false;
	}
}

async function showPassiveResult(targetNumber) {
	const punishment = current_punishment_passive[targetNumber];
	if (!punishment) return Promise.resolve();
	track("passive_result_shown", { type: punishment.type || "unknown" });
	roundPassiveSnapshot = {
		round: roundNo,
		type: punishment.type,
		targetNumber,
		baseText: String(punishment.text || ""),
		displayText: String(punishment.text || "")
	};

	const typeMap = {
		action: t("game.typeMap.action"),
		rest: t("game.typeMap.rest"),
		move: t("game.typeMap.move"),
		sports: t("game.typeMap.sports"),
		end: t("game.typeMap.end")
	};

	const panelPrefix = {
		action: t("game.prefix.action"),
		rest: t("game.prefix.rest"),
		move: t("game.prefix.move"),
		sports: t("game.prefix.sports"),
		end: t("game.prefix.end")
	};

	let displayText = punishment.text;
	let splitInfo = null;
	let actionCountForRecord = 0;
	if (punishment.type === "action") {
		const transformed = transformActionByZEffects(punishment.text);
		displayText = transformed.text;
		splitInfo = transformed.splitInfo;
		actionCountForRecord = extractActionCountForRecord(displayText, transformed.finalCount);
	}
	setTaskText('passive', `${panelPrefix[punishment.type] || t("game.prefix.content")}: ${localizeBuiltinText(displayText)}`);

	if (punishment.type === 'rest') {
		const blocked = await shouldConsumeRestVeto(displayText);
		if (blocked) return;
	}

	if (punishment.type === 'rest' && hasDurationHint(displayText)) {
		return showTimedCountdownDialog('rest', displayText);
	}

	if (punishment.type === 'sports' && hasDurationHint(displayText)) {
		return showTimedCountdownDialog('sports', displayText);
	}

	return new Promise((resolve) => {
		const overlay = document.createElement('div');
		overlay.className = 'punishment-overlay';

		const dialog = document.createElement('div');
		dialog.className = 'punishment-dialog';

		const localizedDisplayText = localizeBuiltinText(displayText);
		const splitLine = splitInfo
			? t("game.splitExecution", { first: splitInfo.first, second: splitInfo.second }).replace(/^[；;]\s*/, "")
			: "";
		dialog.innerHTML = `
			<h3 class="punishment-title">${typeMap[punishment.type] || t("game.typeMap.hint")}</h3>
			<div class="punishment-content">${escapeHtml(localizedDisplayText)}${splitInfo ? `<br><br>${escapeHtml(splitLine)}` : ''}</div>
			<button class="punishment-button" id="confirmBtn">${t("common.actions.confirmOk")}</button>
		`;

		overlay.style.pointerEvents = 'auto';
		dialog.style.pointerEvents = 'auto';

		const confirmBtn = dialog.querySelector('#confirmBtn');
		confirmBtn.disabled = false;

		confirmBtn.addEventListener('click', async function () {
			this.disabled = true;

			overlay.remove();

			if (punishment.type === 'action' && actionCountForRecord > 0) {
				actualActionTotal += actionCountForRecord;
				actualActionTriggerCount += 1;
				lastRecordedActionRound = roundNo;
				lastRecordedActionCount = actionCountForRecord;
				lastRecordedActionAdjusted = false;
				updateBTaskLiveCount();
			}

			await new Promise((innerResolve) => requestAnimationFrame(innerResolve));

			if (punishment.type === 'move') {
				const instruction = resolveMoveInstruction(displayText);
				if (instruction.kind === 'toEnd' || instruction.kind === 'toStart') {
					track("special_move_triggered", { move: instruction.kind === 'toEnd' ? "to_end" : "to_start" });
					await handleSpecialMove(instruction.kind);
				} else if (instruction.kind === 'forwardRange' || instruction.kind === 'backwardRange') {
					const offset = Math.floor(Math.random() * 3) + 1;
					const signed = instruction.kind === 'forwardRange' ? offset : -offset;
					const label = instruction.kind === 'forwardRange'
						? t("game.moveLabelForward", { count: offset })
						: t("game.moveLabelBackward", { count: offset });
					track("special_move_triggered", { move: instruction.kind, steps: offset });
					await showInfoDialog(t("game.moveResolveTitle"), t("game.moveResolveCurrent", { label }));
					await moveBySteps(signed, 'passive');
				}
			}

			resolve();
		});

		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				playDialogShake(confirmBtn);
			}
		});

		overlay.appendChild(dialog);
		document.body.appendChild(overlay);
	});
}

function showMasterResult(targetNumber) {
	const task = current_task_master[targetNumber];
	if (!task) return Promise.resolve();
	track("master_result_shown");

	setTaskText('master', localizeBuiltinText(task.text));

	return new Promise((resolve) => {
		const overlay = document.createElement('div');
		overlay.className = 'punishment-overlay';

		const dialog = document.createElement('div');
		dialog.className = 'punishment-dialog';
		dialog.innerHTML = `
			<h3 class="punishment-title">${t("game.typeMap.master")}</h3>
			<div class="punishment-content">${escapeHtml(localizeBuiltinText(task.text))}</div>
			<button class="punishment-button" id="confirmBtn">${t("common.actions.confirmOk")}</button>
		`;

		const confirmBtn = dialog.querySelector('#confirmBtn');
		confirmBtn.addEventListener('click', async () => {
			overlay.remove();
			await applyMasterInstruction(task.text);
			tryApplyMasterEffectsToCurrentRound();
			resolve();
		});

		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				playDialogShake(confirmBtn);
			}
		});

		overlay.appendChild(dialog);
		document.body.appendChild(overlay);
	});
}

function showCellInfo(num){
	if(!num) return;
	if(num === 1) return;
	if(num === endNumber) return;

	const isPassiveHere = passive_location === num;
	const isMasterHere = master_location === num;

	if(IS_DUAL){
		if(!isPassiveHere && !isMasterHere) return;
	}else{
		if(!isPassiveHere) return;
	}

	const m = current_task_master[num]?.text || '';
	const p = current_punishment_passive[num]?.text || '';

	let contentHtml = '';

	if(IS_DUAL && isMasterHere){
		contentHtml += `<div style="margin-bottom:10px;"><b>Z:</b>${escapeHtml(localizeBuiltinText(m))}</div>`;
	}
	if(isPassiveHere){
		contentHtml += `<div><b>B:</b>${escapeHtml(localizeBuiltinText(p))}</div>`;
	}

	const overlay = document.createElement('div');
	overlay.className = 'punishment-overlay';

	const dialog = document.createElement('div');
	dialog.className = 'punishment-dialog';
	dialog.innerHTML = `
		<h3 class="punishment-title">${t("game.cellInfoTitle")}</h3>
		<div class="punishment-content">${contentHtml}</div>
		<button class="punishment-button" id="confirmBtn">${t("common.actions.confirmOk")}</button>
	`;

	const confirmBtn = dialog.querySelector('#confirmBtn');
	confirmBtn.addEventListener('click', () => overlay.remove());

	overlay.appendChild(dialog);
	document.body.appendChild(overlay);
}

function showDice(finalNumber, duration = 1000){
	return new Promise(resolve => {

		const overlay = document.createElement('div');
		overlay.className = 'dice-overlay';
		document.body.appendChild(overlay);
		document.body.classList.add('dice-focus');

		const popup = document.createElement('div');
		popup.className = 'popup';

		const dice = document.createElement('div');
		dice.className = 'dice';

		for(let i=0;i<9;i++){
			const dot = document.createElement('div');
			dot.className = 'dot';
			dice.appendChild(dot);
		}

		popup.appendChild(dice);
		document.body.appendChild(popup);

		const interval = 30;
		const loops = Math.floor((duration * 0.7) / interval);
		const stayTime = duration - loops * interval;

		let count = 0;

		const timer = setInterval(()=>{
			const randomPoint = Math.floor(Math.random()*6)+1;
			dice.setAttribute('data-point', randomPoint);

			if(++count >= loops){
				clearInterval(timer);
				dice.setAttribute('data-point', finalNumber);

				setTimeout(()=>{
					popup.remove();
					overlay.remove();
					document.body.classList.remove('dice-focus');
					resolve();
				}, stayTime);
			}
		}, interval);
	});
}

function showEndGameDialog() {
	return new Promise((resolve) => {
		const overlay = document.createElement('div');
		overlay.className = 'punishment-overlay';

		const dialog = document.createElement('div');
		dialog.className = 'punishment-dialog';
		const summaryHtml = `
			<div class="b-task-stats-section" style="margin-bottom:8px;">
				<div class="b-task-stats-row">
					<span>${t("game.endGame.totalHits")}</span>
					<strong>${actualActionTotal}</strong>
				</div>
				<div class="b-task-stats-row">
					<span>${t("game.endGame.actionTriggers")}</span>
					<strong>${actualActionTriggerCount}</strong>
				</div>
			</div>
		`;
		dialog.innerHTML = `
			<h3 class="punishment-title">${t("game.endGame.title")}</h3>
			<div class="punishment-content">${summaryHtml}${t("game.endGame.restartQuestion")}</div>
			<div class="dialog-buttons">
				<button class="punishment-button" id="confirmRestart">${t("game.endGame.confirm")}</button>
				<button class="punishment-button" id="cancelRestart">${t("game.endGame.cancel")}</button>
			</div>
		`;

		const btnWrap = dialog.querySelector('.dialog-buttons');
		btnWrap.style.display = 'flex';
		btnWrap.style.gap = '10px';
		btnWrap.style.marginTop = '20px';

		dialog.querySelector('#confirmRestart').addEventListener('click', () => {
			track("endgame_restart_confirmed");
			overlay.remove();
			resolve(true);
		});

		dialog.querySelector('#cancelRestart').addEventListener('click', () => {
			track("endgame_restart_cancelled");
			overlay.remove();
			resolve(false);
		});

		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				playDialogShake(btnWrap);
			}
		});

		overlay.appendChild(dialog);
		document.body.appendChild(overlay);
	});
}

function showResumeGameDialog(snapshot) {
	const copy = {
		title: t("game.resumeGame.title", {}, "继续上局"),
		board: t("game.resumeGame.board", {}, "棋盘"),
		round: t("game.resumeGame.round", {}, "回合"),
		totalHits: t("game.resumeGame.totalHits", {}, "已累计触发总数"),
		question: t("game.resumeGame.question", {}, "检测到上一局还没结束，要继续吗？"),
		confirm: t("game.resumeGame.confirm", {}, "继续"),
		cancel: t("game.resumeGame.cancel", {}, "重新开始")
	};
	const summaryHtml = `
		<div class="b-task-stats-section" style="margin-bottom:8px;">
			<div class="b-task-stats-row">
				<span>${copy.board}</span>
				<strong>${escapeHtml(snapshot.boardMeta?.name || snapshot.boardToken || '-')}</strong>
			</div>
			<div class="b-task-stats-row">
				<span>${copy.round}</span>
				<strong>${snapshot.roundNo}</strong>
			</div>
			<div class="b-task-stats-row">
				<span>${copy.totalHits}</span>
				<strong>${snapshot.actualActionTotal}</strong>
			</div>
		</div>
	`;

	return new Promise((resolve) => {
		const overlay = document.createElement('div');
		overlay.className = 'punishment-overlay resume-game-overlay';

		const dialog = document.createElement('div');
		dialog.className = 'punishment-dialog resume-game-dialog';
		dialog.innerHTML = `
			<h3 class="punishment-title">${copy.title}</h3>
			<div class="punishment-content resume-game-content">${summaryHtml}${copy.question}</div>
			<div class="dialog-buttons">
				<button class="punishment-button" id="confirmResume">${copy.confirm}</button>
				<button class="punishment-button" id="cancelResume">${copy.cancel}</button>
			</div>
		`;

		const btnWrap = dialog.querySelector('.dialog-buttons');
		btnWrap.style.display = 'flex';
		btnWrap.style.gap = '10px';
		btnWrap.style.marginTop = '20px';

		dialog.querySelector('#confirmResume').addEventListener('click', () => {
			track("saved_game_resume_confirmed");
			overlay.remove();
			resolve(true);
		});

		dialog.querySelector('#cancelResume').addEventListener('click', () => {
			track("saved_game_resume_cancelled");
			overlay.remove();
			resolve(false);
		});

		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				playDialogShake(btnWrap);
			}
		});

		overlay.appendChild(dialog);
		document.body.appendChild(overlay);
	});
}

async function initGameSession(boardToken) {
	const sessionMode = getGameSessionModeKey();
	const storedSnapshot = normalizeStoredGameSession(readGameSessionSnapshot(boardToken, sessionMode), boardToken, sessionMode);
	if (storedSnapshot) {
		const shouldResume = await showResumeGameDialog(storedSnapshot);
		if (shouldResume) {
			try {
				renderBoard(boardToken, { restoreState: storedSnapshot });
				persistGameSessionSnapshot();
				return;
			} catch (error) {
				console.error('[Game] Failed to restore saved session. Starting a new game instead.', error);
				clearGameSessionSnapshot(boardToken, sessionMode);
				renderBoard(boardToken, { disableIntro: true });
				return;
			}
		}
		clearGameSessionSnapshot(boardToken, sessionMode);
		renderBoard(boardToken, { disableIntro: true });
		return;
	}

	renderBoard(boardToken);
}

window.addEventListener('error', (event) => {
	const message = event?.error?.stack || event?.error?.message || event?.message;
	if (!message) return;
	console.error('[Game] Unhandled error:', event.error || event.message);
	showFatalGameMessage(message);
});

window.addEventListener('unhandledrejection', (event) => {
	const reason = event?.reason;
	const message = reason?.stack || reason?.message || String(reason || '');
	if (!message) return;
	console.error('[Game] Unhandled promise rejection:', reason);
	showFatalGameMessage(message);
});

let isProcessing = false;

async function handleRoll(role) {
	if (isProcessing) return;

	if (IS_DUAL) {
		if (role === 'master' && roundMasterDone) { showTip(t("game.tips.masterDone")); return; }
		if (role === 'passive' && roundPassiveDone) { showTip(t("game.tips.passiveDone")); return; }
	}

	isProcessing = true;

	try {
		if (!roundMasterDone && !roundPassiveDone) {
			setTaskText('master', t("common.status.dash"));
			setTaskText('passive', t("common.status.dash"));
		}

		if (role === 'passive' && passive_location === endNumber) {
			clearGameSessionSnapshot();
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}
		if (role === 'master' && master_location === endNumber) {
			clearGameSessionSnapshot();
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}

		const randomSteps = Math.floor(Math.random() * 6) + 1;
		track("dice_rolled", {
			role,
			steps: randomSteps,
			mode: IS_DUAL ? "dual" : "solo",
			round: roundNo
		});

		await showDice(randomSteps);
		await moveBySteps(randomSteps, role);

		if (role === 'passive' && passive_location === endNumber) {
			clearGameSessionSnapshot();
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}
		if (role === 'master' && master_location === endNumber) {
			clearGameSessionSnapshot();
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}

		if (role === 'passive') await showPassiveResult(passive_location);
		if (role === 'master') await showMasterResult(master_location);

		if (role === 'passive' && passive_location === endNumber) {
			clearGameSessionSnapshot();
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}
		if (role === 'master' && master_location === endNumber) {
			clearGameSessionSnapshot();
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}

		if (!IS_DUAL) {
			roundPassiveDone = true;
			tryAdvanceRound();
			return;
		}

		if (role === 'passive') roundPassiveDone = true;
		if (role === 'master') roundMasterDone = true;

		setButtonsState();
		updateRoundInfo();
		tryAdvanceRound();
	} catch (e) {
		console.error('Flow error:', e);
	} finally {
		isProcessing = false;
	}
}

rolldice.addEventListener('click', () => handleRoll('passive'));
if (rollmaster) rollmaster.addEventListener('click', () => handleRoll('master'));
if (bTaskStatsBtn) bTaskStatsBtn.addEventListener('click', showBTaskStatsDialog);
window.initGameSession = initGameSession;
window.showFatalGameMessage = showFatalGameMessage;
window.addEventListener('pagehide', persistGameSessionSnapshot);
