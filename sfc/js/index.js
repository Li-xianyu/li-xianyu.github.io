"use strict";
/*
*
*  佛祖拈花示真诠，乾三连兮坤六断，伏羲敕令无咎bug遁入巽
*  周易八卦衍妙玄，代码如龙乘云变，坎离既济兆吉昌于CPU巅
*
*/ 



let mapData;
let current_punishment_passive;
let current_task_master;
let passive_location;
let master_location;
let current_board;
let endNumber;

const size = 10; 

// 获取 localStorage 中的 SPANK_COUNT_RANGE，如果没有则使用 data.js 中的默认值
const storedSettings = JSON.parse(localStorage.getItem('SPANK_COUNT_RANGE'));

// 更新 SPANK_COUNT_RANGE 的值
if (storedSettings) {
    SPANK_COUNT_RANGE.min = storedSettings.min;
    SPANK_COUNT_RANGE.max = storedSettings.max;
}

console.log(SPANK_COUNT_RANGE); // 输出更新后的 SPANK_COUNT_RANGE 对象

const storedGameData = JSON.parse(localStorage.getItem('GameData'));

// 更新 GameData 的值
if (storedGameData) {
    GameData = storedGameData;
} else {
    // 如果没有存储的 GameData，就使用默认的 GameData 配置
    GameData = GameData; // 这里直接引用你当前声明的 GameData
}

console.log(GameData); // 输出更新后的 GameData 对象

// ===== 主动方数据（ActiveData） =====
const storedActiveData = JSON.parse(localStorage.getItem('ActiveData'));
if (storedActiveData) {
    ActiveData = storedActiveData;
}
console.log(ActiveData);





const board = document.getElementById('board');
const rolldice = document.getElementById('rolldice');
const rollmaster = document.getElementById('rollmaster');

// ===== 游戏模式（单人/双人） =====
// dual：主+被各投一次，凑齐才进下一回合（顺序随便）
// solo：只有“被”投掷，每投一次就是新回合
const GAME_MODE = (String(window.GAME_MODE || new URLSearchParams(location.search).get('mode') || 'dual')).toLowerCase();
const IS_DUAL = !(GAME_MODE === 'solo' || GAME_MODE === 'single' || GAME_MODE === 'one');

const roundInfo = document.getElementById('roundInfo');

let roundNo = 1;
let roundMasterDone = false;
let roundPassiveDone = false;

// 棋盘和按钮直接显示（不再用“选择模式”面板）
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
    return item ? { text: item.name, type: 'master' } : { text: '无可用主指令', type: 'master' };
}

function generatePunishment(options = {}) {
    // 解析允许的类型
    let allowedTypes;
    if (typeof options === 'string') {
        allowedTypes = [options];
    } else if (Array.isArray(options)) {
        allowedTypes = options;
    } else {
        allowedTypes = options.allowedTypes;
    }

    // 辅助函数：过滤并随机获取 selected=true 的项
    const getRandomActiveName = (items) => {
        const activeItems = items.filter(item => item.selected);
        return activeItems.length > 0
            ? activeItems[Math.floor(Math.random() * activeItems.length)].name
            : null;
    };

    // 生成整十数
    const getRandomTens = (min, max) => {
        const minTens = Math.ceil(min / 10);
        const maxTens = Math.floor(max / 10);
        return (Math.floor(Math.random() * (maxTens - minTens + 1)) + minTens) * 10;
    };

    // 定义模块处理器（动态获取权重）
    const modules = [
        {
            type: 'spank',
            weight: GameData.prop.weight || 0, // 取道具的权重
            handler: () => {
                const postureName = getRandomActiveName(GameData.posture.items);
                const propName = getRandomActiveName(GameData.prop.items);
                const count = getRandomTens(SPANK_COUNT_RANGE.min, SPANK_COUNT_RANGE.max);
                
                if (!propName) return { text: "无可用工具", type: 'error' };

                return { 
                    text: postureName 
                        ? `${postureName}${propName} ${count}下` 
                        : `${propName} ${count}下`
                };
            }
        },
        {
            type: 'rest',
            weight: GameData.reward.weight || 0,
            handler: () => ({
                text: getRandomActiveName(GameData.reward.items) || "无可用休息项"
            })
        },
        {
            type: 'move',
            weight: GameData.aod.weight || 0,
            handler: () => ({
                text: getRandomActiveName(GameData.aod.items) || "无可用移动项"
            })
        },
        {
            type: 'sports',
            weight: GameData.sports.weight || 0,
            handler: () => ({
                text: getRandomActiveName(GameData.sports.items) || "无可用体罚项"
            })
        }
    ];

    // 过滤允许的类型
    const filteredModules = allowedTypes
        ? modules.filter(m => allowedTypes.includes(m.type))
        : modules;

    // 校验是否有可用模块
    if (filteredModules.length === 0) {
        return { text: "无可用惩罚类型", type: 'error' };
    }

    // 带权重的随机选择
    const totalWeight = filteredModules.reduce((sum, m) => sum + m.weight, 0);
    let random = Math.random() * totalWeight;
    const selected = filteredModules.find(m => (random -= m.weight) <= 0);

    // 合并返回结果
    return {
        ...selected.handler(),
        type: selected.type
    };
}


// // 测试
// console.log(generatePunishment('spank'));


// 辅助函数：获取棋盘的非零值数量
function getNonZeroCount(board) {
    let count = 0;
    for (const row of board) {
        for (const cell of row) {
            if (cell !== 0) {
                count++;
            }
        }
    }
	// console.log(count);
    return count;
}

function generateBoard(boardIndex) {
    boardIndex--;
    // 参数边界检查
    if (boardIndex === undefined || boardIndex < 0 || boardIndex >= Boards.length) {
        console.log("未指定有效的棋盘索引，随机选择一个棋盘。");
        boardIndex = Math.floor(Math.random() * Boards.length);
    }
    const selectedBoard = Boards[boardIndex];

    console.log(`选择的棋盘索引是：${boardIndex + 1}`);
    // console.log(selectedBoard);

    const nonZeroCount = getNonZeroCount(selectedBoard) - 2;
    // console.log(nonZeroCount);

    const passiveMap = {};
    const masterMap = {};

    // 序号从2开始，覆盖所有可走格（不含起点1与终点end）
    for (let i = 0; i < nonZeroCount; i++) {
        const num = i + 2;
        passiveMap[num] = generatePunishment(['spank','rest','move','sports']);
        masterMap[num] = generateMasterTask();
    }

    return { passiveMap, masterMap };
}

function renderBoard(boardIndex) {
    mapData = Boards[boardIndex-1];
    const packs = generateBoard(boardIndex);
    current_punishment_passive = packs.passiveMap;
    current_task_master = packs.masterMap;
    
    // 清空棋盘
    board.innerHTML = '';
    
    // 获取起点和终点的数字标识
    const startNumber = 1;
	passive_location = 1;
	master_location = 1;
    endNumber = Math.max(...mapData.flat());
    
    // 设置棋盘尺寸
    const size = mapData.length;
	board.style.display = 'grid';
	rolldice.style.display = 'block';
	if (rollmaster) rollmaster.style.display = IS_DUAL ? 'block' : 'none';
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    // 渲染棋盘
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cellValue = mapData[i][j];
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (cellValue !== 0) {
                // 添加基础样式
                if (cellValue === startNumber) {
                    cell.classList.add('start');
                } else if (cellValue === endNumber) {
                    cell.classList.add('end');
                } else {
                    cell.classList.add('black');
                }
                
                // 标记主/被位置
                if (cellValue === passive_location) cell.classList.add('passive-location');
                if (IS_DUAL && cellValue === master_location) {
                    cell.classList.add('master-location');
                }

                // 点击格子显示信息
                cell.addEventListener('click', () => showCellInfo(cellValue));

                cell.innerHTML = '';
                cell.dataset.number = cellValue;
            }
            
            board.appendChild(cell);
        }
    }
}

function escapeHtml(str){
    return String(str || '')
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'",'&#39;');
}

let isMoving = false; // 防止动画期间重复点击

// ===== 任务面板（不往格子里塞文字） =====
function setTaskText(role, text){
    const el = document.getElementById(role === 'master' ? 'taskMaster' : 'taskPassive');
    if (!el) return;
    el.textContent = text || '—';
}


function showTip(msg){
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

function updateRoundInfo(){
	if (!roundInfo) return;
	if (!IS_DUAL){
		roundInfo.textContent = `第 ${roundNo} 回合`;
		return;
	}
	const done = [];
	if (roundMasterDone) done.push('主');
	if (roundPassiveDone) done.push('被');
	const suffix = done.length ? `（已投掷：${done.join(' / ')}）` : '';
	roundInfo.textContent = `第 ${roundNo} 回合${suffix}`;
}

function setButtonsState(){
	if (!rolldice) return;
	if (!IS_DUAL){
		rolldice.disabled = false;
		rolldice.textContent = '投掷';
		return;
	}
	if (rollmaster){
		rollmaster.disabled = roundMasterDone;
		rollmaster.textContent = roundMasterDone ? '已投掷' : '主投';
	}
	rolldice.disabled = roundPassiveDone;
	rolldice.textContent = roundPassiveDone ? '已投掷' : '被投';
}

function tryAdvanceRound(){
	if (!IS_DUAL){
		roundNo += 1;
		roundPassiveDone = false;
		setButtonsState();
		updateRoundInfo();
		return;
	}
	if (roundMasterDone && roundPassiveDone){
		roundNo += 1;
		roundMasterDone = false;
		roundPassiveDone = false;
		setButtonsState();
		updateRoundInfo();
	}
}

// 单人模式：隐藏主任务显示块
if (!IS_DUAL){
	const masterBlock = document.getElementById('masterTaskBlock');
	if (masterBlock) masterBlock.style.display = 'none';
}

updateRoundInfo();
setButtonsState();

// 辅助函数 非单用
function moveStep(from, to, role) {
    return new Promise(resolve => {
        const fromCell = document.querySelector(`[data-number="${from}"]`);
        if (fromCell) {
            fromCell.classList.remove(role === 'master' ? 'master-location' : 'passive-location');
        }
        
        // 添加移动动画
        const toCell = document.querySelector(`[data-number="${to}"]`);
        if (toCell) {
            toCell.classList.add('moving');
            setTimeout(() => {
                toCell.classList.remove('moving');
                toCell.classList.add(role === 'master' ? 'master-location' : 'passive-location');
                resolve();
            }, 300); // 动画持续时间
        } else {
            resolve();
        }
    });
}


// 处理特殊移动
async function handleSpecialMove(moveType) {
    const startNumber = 1;
    const endNumber = Math.max(...mapData.flat());
    
    // 执行移动动画
    if (moveType === 'toEnd') {
        await moveStep(passive_location, endNumber, 'passive');
        passive_location = endNumber;
    } else if (moveType === 'toStart') {
        await moveStep(passive_location, startNumber, 'passive');
        passive_location = startNumber;
    }
    
    // 更新界面显示
    showPassiveResult(passive_location);
}

async function moveBySteps(steps, role) {
    if (isMoving) return;
    isMoving = true;

    try {
        const direction = steps > 0 ? 1 : -1;
        const cur = role === 'master' ? master_location : passive_location;
        const targetLocation = cur + steps;
        const maxLocation = Math.max(...mapData.flat());

        // 新增边界校验
        if (targetLocation > maxLocation) {
            steps = maxLocation - cur;
        } else if (targetLocation < 1) {
            steps = 1 - cur;
        }

        for (let i = 0; i < Math.abs(steps); i++) {
            const cur2 = role === 'master' ? master_location : passive_location;
            const nextLocation = cur2 + direction;
            await moveStep(cur2, nextLocation, role);
            if (role === 'master') master_location = nextLocation;
            else passive_location = nextLocation;
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    } finally {
        isMoving = false;
    }
}




function showPassiveResult(targetNumber) {
    const punishment = current_punishment_passive[targetNumber];
    if (!punishment) return;

    const typeMap = {
        spank: '⛔️ 被动方：惩罚内容',
        rest: '☕️ 被动方：休息内容',
        move: '🚶 被动方：移动',
        sports: '⛔️ 被动方：体罚内容',
        end: '🏁 终点达成'
    };
    // 先把本轮结果写到面板（格子不写字）
    const panelPrefix = {
        spank: '惩罚',
        rest: '休息',
        move: '移动',
        sports: '体罚',
        end: '终点'
    };
    setTaskText('passive', `${panelPrefix[punishment.type] || '内容'}：${punishment.text}`);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'punishment-overlay';
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'punishment-dialog';
    
    dialog.innerHTML = `
        <h3 class="punishment-title">${typeMap[punishment.type] || '⚠️ 注意事项'}</h3>
        <div class="punishment-content">
            ${punishment.text}
        </div>
        <button class="punishment-button" id="confirmBtn">
            👌 确认
        </button>
    `;
	overlay.style.pointerEvents = 'auto'; // 允许点击
	dialog.style.pointerEvents = 'auto'; // 允许点击
	
	// 2. 强制按钮确认
	const confirmBtn = dialog.querySelector('#confirmBtn');
	confirmBtn.disabled = false;
	
	confirmBtn.addEventListener('click', async function() {
		this.disabled = true;
		try {
			if (punishment.type === 'move') {
				const isToEnd = punishment.text.includes('直达终点');
				await handleSpecialMove(isToEnd ? 'toEnd' : 'toStart');
			}
		} finally {
			overlay.remove();
		}
	});

	// 3. 外部点击提示
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			confirmBtn.style.animation = 'shake 0.5s';
			setTimeout(() => {
				confirmBtn.style.animation = '';
			}, 500);
		}
	});
	

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

}

function showMasterResult(targetNumber) {
    const task = current_task_master[targetNumber];
    if (!task) return;

    // 面板显示
    setTaskText('master', task.text);

    const overlay = document.createElement('div');
    overlay.className = 'punishment-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'punishment-dialog';
    dialog.innerHTML = `
        <h3 class="punishment-title">🎲 主动方：本格指令</h3>
        <div class="punishment-content">${escapeHtml(task.text)}</div>
        <button class="punishment-button" id="confirmBtn">👌 确认</button>
    `;

    const confirmBtn = dialog.querySelector('#confirmBtn');
    confirmBtn.addEventListener('click', () => overlay.remove());

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            confirmBtn.style.animation = 'shake 0.5s';
            setTimeout(() => confirmBtn.style.animation = '', 500);
        }
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

function showCellInfo(num){
    if (!num) return;
    if (num === 1) return;
    if (num === endNumber) return;

    // ✅ 只有单位在这个格子上才允许查看
    const isPassiveHere = passive_location === num;
    const isMasterHere = master_location === num;

    if (IS_DUAL){
        if (!isPassiveHere && !isMasterHere) return;
    } else {
        if (!isPassiveHere) return;
    }

    const m = current_task_master[num]?.text || '';
    const p = current_punishment_passive[num]?.text || '';

    const overlay = document.createElement('div');
    overlay.className = 'punishment-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'punishment-dialog';
    dialog.innerHTML = `
        <h3 class="punishment-title">当前格子内容</h3>
        <div class="punishment-content">
            ${IS_DUAL ? `<div style="margin-bottom:10px;"><b>主：</b>${escapeHtml(m)}</div>` : ''}
            <div><b>被：</b>${escapeHtml(p)}</div>
        </div>
        <button class="punishment-button" id="confirmBtn">👌 确认</button>
    `;

    const confirmBtn = dialog.querySelector('#confirmBtn');
    confirmBtn.addEventListener('click', () => overlay.remove());
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}


function showDice(finalNumber) {
    return new Promise((resolve) => {
        const popup = document.createElement('div');
        popup.className = 'popup';

        const dice = document.createElement('div');
        dice.className = 'dice';

        // 生成9个点
        for (let i = 0; i < 9; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dice.appendChild(dot);
        }

        popup.appendChild(dice);
        document.body.appendChild(popup);

        let count = 0;
        const maxLoop = 20;
        const animation = setInterval(() => {
            let randomPoint = Math.floor(Math.random() * 6) + 1;
            dice.setAttribute('data-point', randomPoint);
            
            if (++count >= maxLoop) {
                clearInterval(animation);
                dice.setAttribute('data-point', finalNumber);
                
                // 动画结束后 1 秒移除弹窗并 resolve
                setTimeout(() => {
                    popup.remove();
                    resolve(); // 关键点：动画完全结束后才 resolve
                }, 1000);
            }
        }, 100);
    });
}


function showEndGameDialog() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'punishment-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'punishment-dialog';
        dialog.innerHTML = `
            <h3 class="punishment-title">🏁 游戏结束</h3>
            <div class="punishment-content">要开始新游戏吗？</div>
            <div class="dialog-buttons">
                <button class="punishment-button" id="confirmRestart">确定</button>
                <button class="punishment-button" id="cancelRestart">取消</button>
            </div>
        `;

        // 按钮容器样式
        dialog.querySelector('.dialog-buttons').style.display = 'flex';
        dialog.querySelector('.dialog-buttons').style.gap = '10px';
        dialog.querySelector('.dialog-buttons').style.marginTop = '20px';

        // 确定按钮事件
        dialog.querySelector('#confirmRestart').addEventListener('click', () => {
            overlay.remove();
            resolve(true);
        });

        // 取消按钮事件
        dialog.querySelector('#cancelRestart').addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });
		overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			dialog.querySelector('.dialog-buttons').style.animation = 'shake 0.5s';
			setTimeout(() => {
				dialog.querySelector('.dialog-buttons').style.animation = '';
			}, 500);
		}
	});
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    });
}


let isProcessing = false; // 全局锁：避免动效还没播完就连点

async function handleRoll(role){
	if (isProcessing) return;

	if (IS_DUAL){
		if (role === 'master' && roundMasterDone){ showTip('主这回合已经投过了'); return; }
		if (role === 'passive' && roundPassiveDone){ showTip('被这回合已经投过了'); return; }
	}

	isProcessing = true;

	try{
		// 终点状态检查
		if (role === 'passive' && passive_location === endNumber){
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}
		if (role === 'master' && master_location === endNumber){
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}

		const randomSteps = Math.floor(Math.random() * 6) + 1;

		// 播骰子动画
		await showDice(randomSteps);

		// 走格子
		await moveBySteps(randomSteps, role);

		// 到终点：结束弹窗
		if (role === 'passive' && passive_location === endNumber){
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}
		if (role === 'master' && master_location === endNumber){
			const userChoice = await showEndGameDialog();
			if (userChoice) window.location.reload();
			return;
		}

		// 展示本格任务
		if (role === 'passive') showPassiveResult(passive_location);
		if (role === 'master') showMasterResult(master_location);

		// 标记本回合已投
		if (!IS_DUAL){
			roundPassiveDone = true;
			tryAdvanceRound(); // 单人：投完就进下一回合
			return;
		}

		if (role === 'passive') roundPassiveDone = true;
		if (role === 'master') roundMasterDone = true;

		setButtonsState();
		updateRoundInfo();
		tryAdvanceRound(); // 双人：凑齐才进下一回合
	} catch (e){
		console.error('流程异常:', e);
	} finally {
		isProcessing = false;
	}
}

rolldice.addEventListener('click', () => handleRoll('passive'));
if (rollmaster) rollmaster.addEventListener('click', () => handleRoll('master'));