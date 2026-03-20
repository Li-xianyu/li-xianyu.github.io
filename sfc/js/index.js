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

window.MOVE_ANIM_DURATION = window.MOVE_ANIM_DURATION || 500; 
// 单步总时长（ms）

const size = 10;

// localStorage 读设置
const storedSettings = JSON.parse(
	localStorage.getItem(ACTION_COUNT_RANGE_STORAGE_KEY) ||
	localStorage.getItem(LEGACY_ACTION_COUNT_RANGE_STORAGE_KEY) ||
	'null'
);
if (storedSettings) {
	ACTION_COUNT_RANGE.min = storedSettings.min;
	ACTION_COUNT_RANGE.max = storedSettings.max;
}

const storedGameData = JSON.parse(localStorage.getItem('GameData'));
GameData = normalizeGameData(storedGameData);

const storedActiveData = JSON.parse(localStorage.getItem('ActiveData'));
ActiveData = normalizeActiveData(storedActiveData);

const board = document.getElementById('board');
const rolldice = document.getElementById('rolldice');
const rollmaster = document.getElementById('rollmaster');

// dual：Z/B各投一次才进下一回合
// solo：只有B投掷
const GAME_MODE = (String(window.GAME_MODE || new URLSearchParams(location.search).get('mode') || 'dual')).toLowerCase();
const IS_DUAL = !(GAME_MODE === 'solo' || GAME_MODE === 'single' || GAME_MODE === 'one');

const roundInfo = document.getElementById('roundInfo');
const zVetoBadge = document.getElementById('zVetoBadge');
const bTaskStatsBtn = document.getElementById('bTaskStatsBtn');
const bTaskLiveCount = document.getElementById('bTaskLiveCount');

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

function updateVetoBadge() {
	if (!zVetoBadge) return;
	zVetoBadge.hidden = zEffectState.restInvalidToken <= 0;
}

if (board) board.style.display = '';
if (rolldice) rolldice.style.display = '';
if (rollmaster) rollmaster.style.display = IS_DUAL ? '' : 'none';

function getRandomSelected(items) {
	const active = items.filter(i => i.selected);
	if (!active.length) return null;
	return active[Math.floor(Math.random() * active.length)];
}

function generateMasterTask() {
	const item = getRandomSelected(ActiveData.items || []);
	return item ? { text: item.name, type: 'master' } : { text: '无可用指令', type: 'master' };
}

function getRandomSelectedName(items) {
	const active = (items || []).filter(item => item && item.selected);
	if (!active.length) return "";
	return active[Math.floor(Math.random() * active.length)].name || "";
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
		.map(item => String(item?.name || "").trim())
		.filter(Boolean)
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
		? `；分期执行：先 ${transformed.splitInfo.first}，中间休息2分钟，再 ${transformed.splitInfo.second}`
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
	setTaskText("passive", `处理：${finalDisplay}`);
	showTip("已对本回合 B 任务应用 Z 指令");
}

async function applyMasterInstruction(taskText) {
	const text = String(taskText || "").trim();
	if (!text) return;

	if (text === "数量+5") zEffectState.countRule = { type: "add", value: 5 };
	else if (text === "数量+10") zEffectState.countRule = { type: "add", value: 10 };
	else if (text === "数量-5") zEffectState.countRule = { type: "add", value: -5 };
	else if (text === "数量-10") zEffectState.countRule = { type: "add", value: -10 };
	else if (text === "翻倍") zEffectState.countRule = { type: "multiply", value: 2 };
	else if (text === "减半(向上取整)") zEffectState.countRule = { type: "half", value: 0 };
	else if (text === "指定姿势") zEffectState.forcedPosture = getRandomSelectedName(GameData.posture?.items || []);
	else if (text === "分期执行(中间休2分钟)") zEffectState.splitExecution = true;
	else if (text === "休息无效") {
		zEffectState.restInvalidToken = 1;
		updateVetoBadge();
		await showInfoDialog("🛡️ 一票否决", "已获得一次一票否决权。下次出现休息弹窗时可选择是否使用。");
	}
	else if (text === "强制休息(5分钟)") {
		const blocked = await shouldConsumeRestVeto("强制休息5分钟");
		if (!blocked) {
			await showTimedCountdownDialog("rest", "强制休息5分钟");
		}
	}
}

function generatePunishment(options = {}) {
	let allowedTypes;
	if (typeof options === 'string') allowedTypes = [options];
	else if (Array.isArray(options)) allowedTypes = options;
	else allowedTypes = options.allowedTypes;

	const getRandomActiveName = (items) => {
		const activeItems = items.filter(item => item.selected);
		return activeItems.length > 0
			? activeItems[Math.floor(Math.random() * activeItems.length)].name
			: null;
	};

	const hasActiveItems = (items) => Array.isArray(items) && items.some(item => item && item.selected);

	const getRandomTens = (min, max) => {
		const minTens = Math.ceil(min / 10);
		const maxTens = Math.floor(max / 10);
		return (Math.floor(Math.random() * (maxTens - minTens + 1)) + minTens) * 10;
	};

	const modules = [
		{
			type: 'action',
			weight: GameData.prop.weight || 0,
			available: () => hasActiveItems(GameData.prop.items),
			handler: () => {
				const postureName = getRandomActiveName(GameData.posture.items);
				const propName = getRandomActiveName(GameData.prop.items);
				const count = getRandomTens(ACTION_COUNT_RANGE.min, ACTION_COUNT_RANGE.max);

				if (!propName) return { text: "无可用工具", type: 'error' };

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
			handler: () => ({ text: getRandomActiveName(GameData.reward.items) || "无可用休息项" })
		},
		{
			type: 'move',
			weight: GameData.aod.weight || 0,
			available: () => hasActiveItems(GameData.aod.items),
			handler: () => ({ text: getRandomActiveName(GameData.aod.items) || "无可用移动项" })
		},
		{
			type: 'sports',
			weight: GameData.sports.weight || 0,
			available: () => hasActiveItems(GameData.sports.items),
			handler: () => ({ text: getRandomActiveName(GameData.sports.items) || "无可用运动项" })
		}
	];

	const filteredModules = (allowedTypes ? modules.filter(m => allowedTypes.includes(m.type)) : modules)
		.filter(m => m.weight > 0 && m.available());
	if (filteredModules.length === 0) return { text: "无可用类型", type: 'error' };

	const totalWeight = filteredModules.reduce((sum, m) => sum + m.weight, 0);
	if (totalWeight <= 0) return { text: "无可用类型", type: 'error' };
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
		action: '处理项',
		rest: '休息',
		move: '位移',
		sports: '运动',
		unknown: '其他'
	};

	if (type === 'action') {
		const postureDesc = String(GameData.posture?.description || '').trim();
		const propDesc = String(GameData.prop?.description || '').trim();
		if (postureDesc && propDesc) {
			return `${fallback.action}（${postureDesc}+${propDesc}）`;
		}
		return fallback.action;
	}
	if (type === 'rest') {
		return String(GameData.reward?.description || '').trim() || fallback.rest;
	}
	if (type === 'move') {
		return String(GameData.aod?.description || '').trim() || fallback.move;
	}
	if (type === 'sports') {
		return String(GameData.sports?.description || '').trim() || fallback.sports;
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
	if (text.includes("数量+5")) return { type: "add", value: 5 };
	if (text.includes("数量+10")) return { type: "add", value: 10 };
	if (text.includes("数量-5")) return { type: "add", value: -5 };
	if (text.includes("数量-10")) return { type: "add", value: -10 };
	if (text.includes("翻倍")) return { type: "multiply", value: 2 };
	if (text.includes("减半")) return { type: "half", value: 0 };
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
		console.error("[Game] 读取自定义棋盘失败", err);
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
				name: found.name || "自定义棋盘",
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
		name: (boardNames[index - 1] && boardNames[index - 1].name) || `官方棋盘 ${index}`,
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

	// 体验约束：前 18 格不出现休息项，避免开局连续被打断。
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
function renderBoard(boardToken){
	const payload = resolveBoardPayload(boardToken);

	mapData = payload.board;
	const packs = generateBoardFromData(mapData);
	current_punishment_passive = packs.passiveMap;
	current_task_master = packs.masterMap;

	board.innerHTML = '';

	const startNumber = 1;
	passive_location = 1;
	master_location = 1;
	actualActionTotal = 0;
	actualActionTriggerCount = 0;
	lastRecordedActionRound = 0;
	lastRecordedActionCount = 0;
	lastRecordedActionAdjusted = false;
	updateBTaskLiveCount();
	endNumber = Math.max(...mapData.flat());

	const size = mapData.length;
	board.style.display = 'grid';
	rolldice.style.display = 'block';
	if (rollmaster) rollmaster.style.display = IS_DUAL ? 'block' : 'none';
	board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

	for (let i = 0; i < size; i++) {
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
			}

			board.appendChild(cell);
		}
	}

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
const DURATION_PATTERN = /(\d+(?:\.\d+)?|[零一二两三四五六七八九十半]+)\s*(分钟|分|秒钟|秒|minutes?|mins?|min|m|seconds?|secs?|sec|s)/i;

function parseChineseNumber(rawValue) {
	const value = String(rawValue || '').trim();
	if (!value) return NaN;
	if (value === '半') return 0.5;

	const digitMap = {
		'零': 0,
		'一': 1,
		'二': 2,
		'两': 2,
		'三': 3,
		'四': 4,
		'五': 5,
		'六': 6,
		'七': 7,
		'八': 8,
		'九': 9
	};

	if (value.includes('十')) {
		const [tenPart, unitPart] = value.split('十');
		const tens = tenPart ? (digitMap[tenPart] ?? NaN) : 1;
		const units = unitPart ? (digitMap[unitPart] ?? NaN) : 0;
		if (Number.isNaN(tens) || Number.isNaN(units)) return NaN;
		return (tens * 10) + units;
	}

	let result = '';
	for (const char of value) {
		if (digitMap[char] === undefined) return NaN;
		result += String(digitMap[char]);
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
	if (unit.includes('分钟') || unit === '分' || unit.startsWith('m')) {
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
	if (unit.includes('分钟') || unit === '分' || unit.startsWith('m')) return '分钟';
	return '秒';
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
	const title = isSports ? "🏃 B：运动计时" : "☕️ B：强制休息";
	const badge = "倒计时结束后自动继续";
	const noteText = usedFallback
		? `未识别到时长，默认倒计时 ${seconds} 秒`
		: `本次倒计时 ${formatCountdown(totalMs)}`;
	const hintText = "支持：3分钟 / 三分钟 / 20min / 45s（仅分钟和秒）";
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
				<div class="rest-countdown-text">${escapeHtml(displayText)}</div>
				<div class="rest-countdown-number" id="restCountdownValue">${formatCountdown(totalMs)}</div>
				<div class="rest-countdown-progress" aria-hidden="true">
					<div class="rest-countdown-progress-bar" id="restCountdownBar"></div>
				</div>
				<div class="rest-countdown-note">${noteText}</div>
				<div class="rest-countdown-note">${hintText}</div>
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
	el.textContent = text || '—';
}

function updateBTaskLiveCount() {
	if (!bTaskLiveCount) return;
	bTaskLiveCount.textContent = `累计 ${actualActionTotal}`;
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
		<h3 class="punishment-title">预估说明</h3>
		<div class="punishment-content b-task-stats-content">
			<div class="b-task-stats-section">
				<div class="b-task-stats-row">
					<span>预估可触达格子（均值）</span>
					<strong>${reachEstimate.reachableMean.toFixed(1)} 格</strong>
				</div>
				<div class="b-task-stats-row">
					<span>预估可触达格子区间（P10-P90）</span>
					<strong>${reachEstimate.reachableLow} - ${reachEstimate.reachableHigh} 格</strong>
				</div>
				<div class="b-task-stats-row">
					<span>预估触达总数（均值）</span>
					<strong>${reachEstimate.hitsMean.toFixed(1)}</strong>
				</div>
				<div class="b-task-stats-row">
					<span>预估触达总数区间（P10-P90）</span>
					<strong>${reachEstimate.hitsLow} - ${reachEstimate.hitsHigh}</strong>
				</div>
				<div class="b-task-stats-row">
					<span>估计精度（95% 置信区间）</span>
					<strong>±${reachEstimate.ci95.toFixed(2)}</strong>
				</div>
				<div class="b-task-stats-row">
					<span>模拟次数</span>
					<strong>${reachEstimate.runs}</strong>
				</div>
			</div>
			<p class="b-task-stats-note">算法：基于当前棋盘已生成内容，结合位移规则与骰子 1-6 的随机过程进行蒙特卡洛模拟；双人模式下按本局主任务棋盘实际随机出的数量指令动态修正；“触达总数”表示每次落到处理项时对应次数的累计值。</p>
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
	if (!mapData || !current_punishment_passive || !endNumber) {
		showInfoDialog('B任务统计', '棋盘正在初始化，请稍后再试。');
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

	const hitsRangeText = `${reachEstimate.hitsLow} - ${reachEstimate.hitsHigh}（均值 ${reachEstimate.hitsMean.toFixed(1)}）`;

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
		<h3 class="punishment-title">B任务统计</h3>
		<div class="punishment-content b-task-stats-content">
			<div class="b-task-stats-section">
				${moduleRowsHtml}
			</div>
			<div class="b-task-stats-divider"></div>
			<div class="b-task-stats-section">
				<div class="b-task-stats-stack">
					<span>预估触达总数</span>
					<div class="b-task-stats-value-wrap">
						<strong>${hitsRangeText}</strong>
						<button class="b-task-stats-info-btn" id="bTaskStatsInfoBtn" type="button" aria-label="查看预估说明" title="查看预估说明">
							<i class="bi bi-exclamation-lg" aria-hidden="true"></i>
						</button>
					</div>
				</div>
			</div>
		</div>
		<button class="punishment-button" id="confirmBtn">确认</button>
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
			<button class="punishment-button" id="confirmBtn">👌 确认</button>
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
			<h3 class="punishment-title">🛡️ 一票否决</h3>
			<div class="punishment-content">检测到休息弹窗：${escapeHtml(restText)}<br><br>是否使用“一票否决”使本次休息无效？</div>
			<div class="dialog-buttons">
				<button class="punishment-button" id="useVetoBtn">使用</button>
				<button class="punishment-button" id="keepVetoBtn">保留</button>
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
	await showInfoDialog("🛡️ 休息无效", "已使用一次一票否决权，本次休息无效。");
	return true;
}

function updateRoundInfo() {
	if (!roundInfo) return;
	if (!IS_DUAL) {
		roundInfo.textContent = `第 ${roundNo} 回合`;
		return;
	}
	const done = [];
	if (roundMasterDone) done.push('Z');
	if (roundPassiveDone) done.push('B');
	const suffix = done.length ? `（已投：${done.join(' / ')}）` : '';
	roundInfo.textContent = `第 ${roundNo} 回合${suffix}`;
}

function setButtonsState() {
	if (!rolldice) return;
	if (!IS_DUAL) {
		rolldice.disabled = false;
		rolldice.textContent = '投掷';
		return;
	}
	if (rollmaster) {
		rollmaster.disabled = roundMasterDone;
		rollmaster.textContent = roundMasterDone ? '已投' : 'Z投';
	}
	rolldice.disabled = roundPassiveDone;
	rolldice.textContent = roundPassiveDone ? '已投' : 'B投';
}

function tryAdvanceRound() {
	if (!IS_DUAL) {
		roundNo += 1;
		roundPassiveDone = false;
		setButtonsState();
		updateRoundInfo();
		return;
	}
	if (roundMasterDone && roundPassiveDone) {
		roundNo += 1;
		roundMasterDone = false;
		roundPassiveDone = false;
		setButtonsState();
		updateRoundInfo();
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
	if (content.includes('直达终点')) return { kind: 'toEnd' };
	if (content.includes('回到起点')) return { kind: 'toStart' };
	if (content.includes('前进1-3格')) return { kind: 'forwardRange' };
	if (content.includes('后退1-3格')) return { kind: 'backwardRange' };
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

			/* 前两步和最后一步稍微慢一点，中间更快，看起来更顺 */
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
		action: '⛔️ B：处理项',
		rest: '☕️ B：休息项',
		move: '🚶 B：移动',
		sports: '🏃 B：运动项',
		end: '🏁 终点'
	};

	const panelPrefix = {
		action: '处理',
		rest: '休息',
		move: '移动',
		sports: '运动',
		end: '终点'
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
	setTaskText('passive', `${panelPrefix[punishment.type] || '内容'}：${displayText}`);

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

		dialog.innerHTML = `
			<h3 class="punishment-title">${typeMap[punishment.type] || '提示'}</h3>
			<div class="punishment-content">${escapeHtml(displayText)}${splitInfo ? `<br><br>分期执行：先 ${splitInfo.first}，中间休息2分钟，再 ${splitInfo.second}` : ''}</div>
			<button class="punishment-button" id="confirmBtn">👌 确认</button>
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
					const label = instruction.kind === 'forwardRange' ? `前进 ${offset} 格` : `后退 ${offset} 格`;
					track("special_move_triggered", { move: instruction.kind, steps: offset });
					await showInfoDialog("🚶 位移判定", `本次${label}`);
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

	setTaskText('master', task.text);

	return new Promise((resolve) => {
		const overlay = document.createElement('div');
		overlay.className = 'punishment-overlay';

		const dialog = document.createElement('div');
		dialog.className = 'punishment-dialog';
		dialog.innerHTML = `
			<h3 class="punishment-title">🎲 Z：本格指令</h3>
			<div class="punishment-content">${escapeHtml(task.text)}</div>
			<button class="punishment-button" id="confirmBtn">👌 确认</button>
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

	// ✅ 关键：只拼当前格子“在场角色”的内容
	let contentHtml = '';

	if(IS_DUAL && isMasterHere){
		contentHtml += `<div style="margin-bottom:10px;"><b>Z：</b>${escapeHtml(m)}</div>`;
	}
	if(isPassiveHere){
		contentHtml += `<div><b>B：</b>${escapeHtml(p)}</div>`;
	}

	const overlay = document.createElement('div');
	overlay.className = 'punishment-overlay';

	const dialog = document.createElement('div');
	dialog.className = 'punishment-dialog';
	dialog.innerHTML = `
		<h3 class="punishment-title">当前格子</h3>
		<div class="punishment-content">${contentHtml}</div>
		<button class="punishment-button" id="confirmBtn">👌 确认</button>
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

		const interval = 30; // 每次跳点间隔
		const loops = Math.floor((duration * 0.7) / interval); // 前70%乱跳
		const stayTime = duration - loops * interval; // 剩余时间停留最终值

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
					<span>本局真实触达总数</span>
					<strong>${actualActionTotal}</strong>
				</div>
				<div class="b-task-stats-row">
					<span>处理项触发次数</span>
					<strong>${actualActionTriggerCount}</strong>
				</div>
			</div>
		`;
		dialog.innerHTML = `
			<h3 class="punishment-title">🏁 结束</h3>
			<div class="punishment-content">${summaryHtml}开始新局？</div>
			<div class="dialog-buttons">
				<button class="punishment-button" id="confirmRestart">确定</button>
				<button class="punishment-button" id="cancelRestart">取消</button>
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

let isProcessing = false;

async function handleRoll(role) {
	if (isProcessing) return;

	if (IS_DUAL) {
		if (role === 'master' && roundMasterDone) { showTip('Z本回合已投'); return; }
		if (role === 'passive' && roundPassiveDone) { showTip('B本回合已投'); return; }
	}

	isProcessing = true;

	try {
		if (!roundMasterDone && !roundPassiveDone) {
			// 新回合第一掷：清理上回合残留任务显示。
			setTaskText('master', '—');
			setTaskText('passive', '—');
		}

		if (role === 'passive' && passive_location === endNumber) {
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}
		if (role === 'master' && master_location === endNumber) {
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
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}
		if (role === 'master' && master_location === endNumber) {
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}

		if (role === 'passive') await showPassiveResult(passive_location);
		if (role === 'master') await showMasterResult(master_location);

		if (role === 'passive' && passive_location === endNumber) {
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}
		if (role === 'master' && master_location === endNumber) {
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
		console.error('流程异常:', e);
	} finally {
		isProcessing = false;
	}
}

rolldice.addEventListener('click', () => handleRoll('passive'));
if (rollmaster) rollmaster.addEventListener('click', () => handleRoll('master'));
if (bTaskStatsBtn) bTaskStatsBtn.addEventListener('click', showBTaskStatsDialog);
