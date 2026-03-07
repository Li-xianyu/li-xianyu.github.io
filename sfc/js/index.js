"use strict";

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
const storedSettings = JSON.parse(localStorage.getItem('SPANK_COUNT_RANGE'));
if (storedSettings) {
	SPANK_COUNT_RANGE.min = storedSettings.min;
	SPANK_COUNT_RANGE.max = storedSettings.max;
}

const storedGameData = JSON.parse(localStorage.getItem('GameData'));
if (storedGameData) {
	GameData = storedGameData;
}

const storedActiveData = JSON.parse(localStorage.getItem('ActiveData'));
if (storedActiveData) {
	ActiveData = storedActiveData;
}

const board = document.getElementById('board');
const rolldice = document.getElementById('rolldice');
const rollmaster = document.getElementById('rollmaster');

// dual：Z/B各投一次才进下一回合
// solo：只有B投掷
const GAME_MODE = (String(window.GAME_MODE || new URLSearchParams(location.search).get('mode') || 'dual')).toLowerCase();
const IS_DUAL = !(GAME_MODE === 'solo' || GAME_MODE === 'single' || GAME_MODE === 'one');

const roundInfo = document.getElementById('roundInfo');

let roundNo = 1;
let roundMasterDone = false;
let roundPassiveDone = false;

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

	const getRandomTens = (min, max) => {
		const minTens = Math.ceil(min / 10);
		const maxTens = Math.floor(max / 10);
		return (Math.floor(Math.random() * (maxTens - minTens + 1)) + minTens) * 10;
	};

	const modules = [
		{
			type: 'spank',
			weight: GameData.prop.weight || 0,
			handler: () => {
				const postureName = getRandomActiveName(GameData.posture.items);
				const propName = getRandomActiveName(GameData.prop.items);
				const count = getRandomTens(SPANK_COUNT_RANGE.min, SPANK_COUNT_RANGE.max);

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
			handler: () => ({ text: getRandomActiveName(GameData.reward.items) || "无可用休息项" })
		},
		{
			type: 'move',
			weight: GameData.aod.weight || 0,
			handler: () => ({ text: getRandomActiveName(GameData.aod.items) || "无可用移动项" })
		},
		{
			type: 'sports',
			weight: GameData.sports.weight || 0,
			handler: () => ({ text: getRandomActiveName(GameData.sports.items) || "无可用运动项" })
		}
	];

	const filteredModules = allowedTypes ? modules.filter(m => allowedTypes.includes(m.type)) : modules;
	if (filteredModules.length === 0) return { text: "无可用类型", type: 'error' };

	const totalWeight = filteredModules.reduce((sum, m) => sum + m.weight, 0);
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
		passiveMap[num] = generatePunishment(['spank', 'rest', 'move', 'sports']);
		masterMap[num] = generateMasterTask();
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
	const match = content.match(/(\d+(?:\.\d+)?|[零一二两三四五六七八九十半]+)\s*(小时|时|分钟|分|秒钟|秒|hours?|hrs?|hr|h|minutes?|mins?|min|m|seconds?|secs?|sec|s)/i);

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
	if (unit.includes('小时') || unit === '时' || unit.startsWith('h')) {
		multiplier = 3600;
	} else if (unit.includes('分钟') || unit === '分' || unit.startsWith('m')) {
		multiplier = 60;
	}

	return {
		seconds: Math.max(1, Math.round(value * multiplier)),
		usedFallback: false
	};
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

function showRestCountdownDialog(restText) {
	const { seconds, usedFallback } = getRestCountdownConfig(restText);
	const totalMs = seconds * 1000;

	return new Promise((resolve) => {
		const overlay = document.createElement('div');
		overlay.className = 'punishment-overlay';

		const dialog = document.createElement('div');
		dialog.className = 'punishment-dialog rest-countdown-dialog';
		dialog.innerHTML = `
			<h3 class="punishment-title">☕️ B：强制休息</h3>
			<div class="punishment-content rest-countdown-content">
				<div class="rest-countdown-badge">倒计时结束后自动继续</div>
				<div class="rest-countdown-text">${escapeHtml(restText)}</div>
				<div class="rest-countdown-number" id="restCountdownValue">${formatCountdown(totalMs)}</div>
				<div class="rest-countdown-progress" aria-hidden="true">
					<div class="rest-countdown-progress-bar" id="restCountdownBar"></div>
				</div>
				<div class="rest-countdown-note">${usedFallback ? `未识别到时长，默认强制休息 ${seconds} 秒` : `本次强制休息 ${formatCountdown(totalMs)}`}</div>
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

function showPassiveResult(targetNumber) {
	const punishment = current_punishment_passive[targetNumber];
	if (!punishment) return Promise.resolve();

	const typeMap = {
		spank: '⛔️ B：处理项',
		rest: '☕️ B：休息项',
		move: '🚶 B：移动',
		sports: '🏃 B：运动项',
		end: '🏁 终点'
	};

	const panelPrefix = {
		spank: '处理',
		rest: '休息',
		move: '移动',
		sports: '运动',
		end: '终点'
	};

	setTaskText('passive', `${panelPrefix[punishment.type] || '内容'}：${punishment.text}`);

	if (punishment.type === 'rest') {
		return showRestCountdownDialog(punishment.text);
	}

	return new Promise((resolve) => {
		const overlay = document.createElement('div');
		overlay.className = 'punishment-overlay';

		const dialog = document.createElement('div');
		dialog.className = 'punishment-dialog';

		dialog.innerHTML = `
			<h3 class="punishment-title">${typeMap[punishment.type] || '提示'}</h3>
			<div class="punishment-content">${escapeHtml(punishment.text)}</div>
			<button class="punishment-button" id="confirmBtn">👌 确认</button>
		`;

		overlay.style.pointerEvents = 'auto';
		dialog.style.pointerEvents = 'auto';

		const confirmBtn = dialog.querySelector('#confirmBtn');
		confirmBtn.disabled = false;

		confirmBtn.addEventListener('click', async function () {
			this.disabled = true;

			overlay.remove();

			await new Promise((innerResolve) => requestAnimationFrame(innerResolve));

			if (punishment.type === 'move') {
				const isToEnd = punishment.text.includes('直达终点');
				await handleSpecialMove(isToEnd ? 'toEnd' : 'toStart');
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
		confirmBtn.addEventListener('click', () => {
			overlay.remove();
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
		dialog.innerHTML = `
			<h3 class="punishment-title">🏁 结束</h3>
			<div class="punishment-content">开始新局？</div>
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
			overlay.remove();
			resolve(true);
		});

		dialog.querySelector('#cancelRestart').addEventListener('click', () => {
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
