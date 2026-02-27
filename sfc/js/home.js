"use strict";


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

			2. 隐私保护条款：本程序不向服务器上传任何个人数据，所有设置与行为数据仅存储于用户本地浏览器。清除浏览器缓存数据即可删除相关信息。<br><br>

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
		localStorage.setItem('manualAgreed','true');
		overlay.remove();
		confirmBtn.removeEventListener('click', handleConfirm);
		cancelBtn.removeEventListener('click', handleCancel);
	};

	const handleCancel = () => {
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
			confirmBtn.style.animation = 'shake 0.5s';
			setTimeout(() => confirmBtn.style.animation = '', 500);
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

function createBoardDialog(){
	const overlay = document.createElement('div');
	overlay.className = 'punishment-overlay';

	const dialog = document.createElement('div');
	dialog.className = 'board-dialog';

	const title = document.createElement('h3');
	title.className = 'punishment-title';
	title.textContent = '选择棋盘';

	const listContainer = document.createElement('div');
	listContainer.className = 'board-list';

	Boards.forEach((board, index) => {
		const item = document.createElement('div');
		item.className = 'board-item';
		item.innerHTML = `
			<div class="board-info">
				<div class="board-name">${boardNames[index].name}</div>
				<div class="board-desc">${boardNames[index].desc}</div>
			</div>
			<div class="board-size">${getMaxGrid(board)}格</div>
		`;

		item.addEventListener('click', () => {
			overlay.remove();
			document.body.appendChild(createModeDialog(index + 1));
		});

		listContainer.appendChild(item);
	});

	const cancelBtn = document.createElement('button');
	cancelBtn.className = 'punishment-button';
	cancelBtn.textContent = '取消选择';
	cancelBtn.addEventListener('click', () => overlay.remove());

	const footer = document.createElement('div');
	footer.className = 'dialog-buttons';
	footer.appendChild(cancelBtn);

	dialog.append(title, listContainer, footer);
	overlay.appendChild(dialog);

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay){
			cancelBtn.style.animation = 'shake 0.5s';
			setTimeout(() => cancelBtn.style.animation = '', 500);
		}
	});

	return overlay;
}

function createModeDialog(boardId){
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
		{ key:'solo', name:'单人模式', desc:'只投「被」的一套任务' },
		{ key:'dual', name:'双人模式', desc:'主/被都投，一个格子中有两人的任务' }
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
			window.location.href = `game.html?id=${encodeURIComponent(boardId)}&mode=${encodeURIComponent(m.key)}`;
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
	// 首次自动弹免责声明
	if (!localStorage.getItem('manualAgreed')){
		document.body.appendChild(createManualDialog());
	}else{
		console.log('用户已同意须知');
	}

	// 手动打开免责声明
	document.getElementById('gameManual').addEventListener('click', () => {
		document.body.appendChild(createManualDialog());
	});

	// 开始游戏：先棋盘后模式
	document.getElementById('startGame').addEventListener('click', () => {
		document.body.appendChild(createBoardDialog());
	});

	// 设置页
	document.getElementById('gameSettings').addEventListener('click', () => {
		window.location.href = 'setting.html';
	});
});