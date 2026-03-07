"use strict";

(function(){
	const BOARD_SIZE = 10;
	const STORAGE_KEY = "CUSTOM_BOARDS";
	const DRAFT_KEY = "CUSTOM_BOARD_DRAFT";

	const boardEl = document.getElementById("board");
	const outputEl = document.getElementById("output");
	const boardNameEl = document.getElementById("boardName");
	const boardDescEl = document.getElementById("boardDesc");
	const savedListEl = document.getElementById("savedList");

	const statCountEl = document.getElementById("statCount");
	const statStartEl = document.getElementById("statStart");
	const statEndEl = document.getElementById("statEnd");
	const pathStatusTextEl = document.getElementById("pathStatusText");
	const pathStatusChipEl = document.getElementById("pathStatusChip");

	const state = {
		mode: "draw",
		isPointerDown: false,
		activePointerId: null,
		path: [],
		lastTouchedKey: "",
		breakIndexes: []
	};

	function init(){
		createBoardCells();
		bindEvents();
		renderAll();
		renderSavedBoards();
	}

	function createBoardCells(){
		const frag = document.createDocumentFragment();

		for(let row = 0; row < BOARD_SIZE; row++){
			for(let col = 0; col < BOARD_SIZE; col++){
				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = "board-cell empty";
				btn.dataset.row = String(row);
				btn.dataset.col = String(col);
				btn.innerHTML = '<span class="cell-num"></span>';
				frag.appendChild(btn);
			}
		}

		boardEl.appendChild(frag);
	}

	function bindEvents(){
		document.getElementById("backBtn").addEventListener("click", () => {
			window.location.href = "setting.html";
		});

		document.getElementById("clearBtn").addEventListener("click", clearBoard);
		document.getElementById("fillDemoBtn").addEventListener("click", fillDemoBoard);
		document.getElementById("copyBoardBtn").addEventListener("click", copyBoardCode);
		document.getElementById("saveBoardBtn").addEventListener("click", saveCurrentBoard);
		document.getElementById("loadDraftBtn").addEventListener("click", loadDraft);

		boardNameEl.addEventListener("input", handleMetaChange);
		boardDescEl.addEventListener("input", handleMetaChange);

		document.querySelectorAll(".mode-btn").forEach(btn => {
			btn.addEventListener("click", () => {
				document.querySelectorAll(".mode-btn").forEach(x => x.classList.remove("active"));
				btn.classList.add("active");
				state.mode = btn.dataset.mode;
			});
		});

		boardEl.addEventListener("pointerdown", onBoardPointerDown);
		boardEl.addEventListener("pointermove", onBoardPointerMove);
		window.addEventListener("pointerup", onPointerUp);
		window.addEventListener("pointercancel", onPointerUp);
		window.addEventListener("pointermove", onBoardPointerMove, { passive: false });
	}

	function getCellFromPoint(clientX, clientY){
		const el = document.elementFromPoint(clientX, clientY);
		if(!el) return null;
		return el.closest(".board-cell");
	}

	function onBoardPointerDown(e){
		const cell = getCellFromPoint(e.clientX, e.clientY);
		if(!cell) return;

		e.preventDefault();

		state.isPointerDown = true;
		state.activePointerId = e.pointerId;
		state.lastTouchedKey = "";

		if(boardEl.setPointerCapture){
			try{
				boardEl.setPointerCapture(e.pointerId);
			}catch(err){}
		}

		handleCellAction(cell);
	}

	function onBoardPointerMove(e){
		if(!state.isPointerDown) return;
		if(state.activePointerId !== null && e.pointerId !== state.activePointerId) return;

		e.preventDefault();

		const cell = getCellFromPoint(e.clientX, e.clientY);
		if(!cell) return;

		handleCellAction(cell);
	}

	function onPointerUp(e){
		if(state.activePointerId !== null && e && e.pointerId !== state.activePointerId) return;

		if(boardEl.releasePointerCapture && state.activePointerId !== null){
			try{
				boardEl.releasePointerCapture(state.activePointerId);
			}catch(err){}
		}

		state.isPointerDown = false;
		state.activePointerId = null;
		state.lastTouchedKey = "";
	}

	function handleCellAction(cell){
		const row = Number(cell.dataset.row);
		const col = Number(cell.dataset.col);
		const key = `${row},${col}`;

		if(state.lastTouchedKey === key) return;
		state.lastTouchedKey = key;

		if(state.mode === "draw"){
			addCell(row, col);
		}else{
			removeCell(row, col);
		}

		renderAll();
		saveDraft();
	}

	function addCell(row, col){
		if(findPathIndex(row, col) !== -1) return;
		state.path.push([row, col]);
	}

	function removeCell(row, col){
		const idx = findPathIndex(row, col);
		if(idx === -1) return;
		state.path.splice(idx, 1);
	}

	function findPathIndex(row, col){
		return state.path.findIndex(item => item[0] === row && item[1] === col);
	}

	function buildBoardMatrix(){
		const matrix = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
		state.path.forEach((item, index) => {
			const row = item[0];
			const col = item[1];
			matrix[row][col] = index + 1;
		});
		return matrix;
	}

	function validatePath(){
		const breakIndexes = [];

		if(state.path.length <= 1){
			return {
				ok: state.path.length === 1,
				breakIndexes
			};
		}

		for(let i = 1; i < state.path.length; i++){
			const prev = state.path[i - 1];
			const curr = state.path[i];
			const dr = Math.abs(prev[0] - curr[0]);
			const dc = Math.abs(prev[1] - curr[1]);

			if(dr > 1 || dc > 1 || (dr === 0 && dc === 0)){
				breakIndexes.push(i);
			}
		}

		return {
			ok: breakIndexes.length === 0,
			breakIndexes
		};
	}

	function renderAll(){
		const matrix = buildBoardMatrix();
		const validation = validatePath();
		state.breakIndexes = validation.breakIndexes;

		renderBoard(matrix);
		renderStats(validation);
		renderOutput(matrix);
	}

	function renderBoard(matrix){
		const cells = boardEl.querySelectorAll(".board-cell");

		cells.forEach(cell => {
			const row = Number(cell.dataset.row);
			const col = Number(cell.dataset.col);
			const value = matrix[row][col];
			const numEl = cell.querySelector(".cell-num");

			cell.className = "board-cell";
			numEl.textContent = "";

			if(value > 0){
				cell.classList.add("filled");
				numEl.textContent = String(value);
			}else{
				cell.classList.add("empty");
			}
		});

		state.path.forEach((item, index) => {
			const row = item[0];
			const col = item[1];
			const selector = `.board-cell[data-row="${row}"][data-col="${col}"]`;
			const cell = boardEl.querySelector(selector);
			if(!cell) return;

			if(index === 0) cell.classList.add("start");
			if(index === state.path.length - 1) cell.classList.add("end");
			if(state.breakIndexes.includes(index)) cell.classList.add("breakpoint");
		});
	}

	function renderStats(validation){
		const count = state.path.length;
		const start = count ? coordText(state.path[0][0], state.path[0][1]) : "-";
		const end = count ? coordText(state.path[count - 1][0], state.path[count - 1][1]) : "-";

		statCountEl.textContent = String(count);
		statStartEl.textContent = start;
		statEndEl.textContent = end;

		pathStatusChipEl.classList.remove("ok", "bad");

		if(count === 0){
			pathStatusTextEl.textContent = "未开始";
			return;
		}

		if(count === 1){
			pathStatusTextEl.textContent = "只有起点";
			pathStatusChipEl.classList.add("bad");
			return;
		}

		if(validation.ok){
			pathStatusTextEl.textContent = "合法";
			pathStatusChipEl.classList.add("ok");
		}else{
			pathStatusTextEl.textContent = `断裂 ${validation.breakIndexes.length} 处`;
			pathStatusChipEl.classList.add("bad");
		}
	}

	function renderOutput(matrix){
		const code = formatBoardCode(matrix);
		outputEl.value = code;
	}

	function formatBoardCode(matrix){
		const rows = matrix.map(row => {
			const content = row.map(n => String(n).padStart(2, " ")).join(", ");
			return `\t[${content}]`;
		}).join(",\n");

		return `const board = [\n${rows}\n];`;
	}

	function coordText(row, col){
		return `${row + 1},${col + 1}`;
	}

	function clearBoard(){
		state.path = [];
		renderAll();
		saveDraft();
		showToast("已清空棋盘");
	}

	function fillDemoBoard(){
		state.path = [
			[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],
			[1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9],
			[9,8],[9,7],[9,6],[9,5],[9,4],[9,3],[9,2],[9,1],[9,0],
			[8,0],[7,0],[6,0],[5,0],[4,0],[3,0],[2,0]
		];

		if(!boardNameEl.value.trim()) boardNameEl.value = "示例长廊";
		if(!boardDescEl.value.trim()) boardDescEl.value = "外圈回游，长度适中";

		renderAll();
		saveDraft();
		showToast("已加载示例");
	}

	async function copyBoardCode(){
		try{
			await navigator.clipboard.writeText(outputEl.value);
			showToast("board 已复制");
		}catch(err){
			outputEl.select();
			document.execCommand("copy");
			showToast("board 已复制");
		}
	}

	function getSavedBoards(){
		try{
			const raw = localStorage.getItem(STORAGE_KEY);
			const parsed = raw ? JSON.parse(raw) : [];
			return Array.isArray(parsed) ? parsed : [];
		}catch(err){
			console.error("[CreateBoards] 读取本地棋盘失败", err);
			return [];
		}
	}

	function setSavedBoards(list){
		localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	}

	function saveCurrentBoard(){
		const name = boardNameEl.value.trim();
		const desc = boardDescEl.value.trim();
		const validation = validatePath();

		if(!name){
			showToast("先写个棋盘名称");
			boardNameEl.focus();
			return;
		}

		if(state.path.length < 2){
			showToast("至少得有 2 格，不然太抽象了");
			return;
		}

		if(!validation.ok){
			showToast("路径有断裂，先修一修");
			return;
		}

		const matrix = buildBoardMatrix();
		const list = getSavedBoards();
		const now = Date.now();
		const draftId = "";

		const item = {
			id: draftId || createId(),
			name,
			desc,
			board: matrix,
			steps: state.path.length,
			updatedAt: now,
			createdAt: draftId ? getCreatedAtById(list, draftId) : now
		};

		const index = list.findIndex(x => x.id === item.id);
		if(index === -1){
			list.unshift(item);
		}else{
			list[index] = item;
		}

		setSavedBoards(list);
		saveDraft("");
		renderSavedBoards();
		showToast("已保存到本地");
	}

	function renderSavedBoards(){
		const list = getSavedBoards();

		if(!list.length){
			savedListEl.innerHTML = '<div class="saved-empty">还没有自定义棋盘。先画一个再说。</div>';
			return;
		}

		savedListEl.innerHTML = "";

		list.forEach(item => {
			const card = document.createElement("div");
			card.className = "saved-item";

			card.innerHTML = `
				<div class="saved-main">
					<div class="saved-meta">
						<div class="saved-name">${escapeHtml(item.name || "未命名棋盘")}</div>
						<div class="saved-desc">${escapeHtml(item.desc || "无简介")}</div>
					</div>
					<div class="saved-badge">${item.steps || getMaxGrid(item.board)} 格</div>
				</div>
				<div class="saved-actions">
					<button type="button" class="primary" data-action="load" data-id="${item.id}">载入</button>
					<button type="button" data-action="copy" data-id="${item.id}">复制代码</button>
					<button type="button" class="danger" data-action="delete" data-id="${item.id}">删除</button>
				</div>
			`;

			card.addEventListener("click", async (e) => {
				const btn = e.target.closest("button");
				if(!btn) return;

				const action = btn.dataset.action;
				const id = btn.dataset.id;

				if(action === "load"){
					loadBoardById(id);
				}else if(action === "copy"){
					await copySavedBoardById(id);
				}else if(action === "delete"){
					deleteBoardById(id);
				}
			});

			savedListEl.appendChild(card);
		});
	}

	function loadBoardById(id){
		const list = getSavedBoards();
		const item = list.find(x => x.id === id);
		if(!item) return;

		boardNameEl.value = item.name || "";
		boardDescEl.value = item.desc || "";
		state.path = matrixToPath(item.board);
		saveDraft(id);
		renderAll();
		showToast("已载入棋盘");
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	async function copySavedBoardById(id){
		const list = getSavedBoards();
		const item = list.find(x => x.id === id);
		if(!item) return;

		const code = formatBoardCode(item.board);
		try{
			await navigator.clipboard.writeText(code);
			showToast("已复制已存档棋盘代码");
		}catch(err){
			showToast("复制失败");
		}
	}

	function deleteBoardById(id){
		const list = getSavedBoards().filter(x => x.id !== id);
		setSavedBoards(list);

		const draft = getDraft();
		if(draft && draft.editingId === id){
			saveDraft("");
		}

		renderSavedBoards();
		showToast("已删除");
	}

	function matrixToPath(matrix){
		const flat = [];

		for(let row = 0; row < BOARD_SIZE; row++){
			for(let col = 0; col < BOARD_SIZE; col++){
				const value = Number(matrix?.[row]?.[col] || 0);
				if(value > 0){
					flat.push({ row, col, value });
				}
			}
		}

		flat.sort((a, b) => a.value - b.value);
		return flat.map(item => [item.row, item.col]);
	}

	function getMaxGrid(matrix){
		let max = 0;

		for(let row = 0; row < BOARD_SIZE; row++){
			for(let col = 0; col < BOARD_SIZE; col++){
				const value = Number(matrix?.[row]?.[col] || 0);
				if(value > max) max = value;
			}
		}

		return max;
	}

	function handleMetaChange(){
		saveDraft();
	}

	function getDraft(){
		try{
			const raw = localStorage.getItem(DRAFT_KEY);
			return raw ? JSON.parse(raw) : null;
		}catch(err){
			console.error("[CreateBoards] 读取草稿失败", err);
			return null;
		}
	}

	function getCurrentEditingId(){
		const draft = getDraft();
		return draft && draft.editingId ? draft.editingId : "";
	}

	function getCreatedAtById(list, id){
		const item = list.find(x => x.id === id);
		return item && item.createdAt ? item.createdAt : Date.now();
	}

	function saveDraft(editingId){
		const draft = {
			name: boardNameEl.value.trim(),
			desc: boardDescEl.value.trim(),
			path: state.path,
			editingId: typeof editingId === "string" ? editingId : getCurrentEditingId(),
			updatedAt: Date.now()
		};

		localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
	}

	function loadDraft(){
		const draft = getDraft();

		if(!draft){
			showToast("没有草稿");
			return;
		}

		boardNameEl.value = draft.name || "";
		boardDescEl.value = draft.desc || "";
		state.path = Array.isArray(draft.path) ? draft.path : [];
		renderAll();
		showToast("已载入草稿");
	}

	function createId(){
		return "cb_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
	}

	function escapeHtml(str){
		return String(str)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	}

	let toastTimer = null;
	function showToast(text){
		const toast = document.getElementById("toast");
		toast.textContent = text;
		toast.classList.add("show");

		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toast.classList.remove("show");
		}, 1800);
	}

	init();
})();