const Boards = [
	[
		[ 1,  2,  3,  4,  5,  6,  7,  8,  9, 10],
		[ 0,  0,  0,  0,  0,  0,  0,  0,  0, 11],
		[35, 36, 37, 38, 39, 40, 41, 42,  0, 12],
		[34,  0,  0,  0,  0,  0,  0, 43,  0, 13],
		[33,  0, 55, 56, 57, 58,  0, 44,  0, 14],
		[32,  0, 54,  0, 0, 59,  0, 45,  0, 15],
		[31,  0, 53,  0,  0,  0,  0, 46,  0, 16],
		[30,  0, 52, 51, 50, 49, 48, 47,  0, 17],
		[29,  0,  0,  0,  0,  0,  0,  0,  0, 18],
		[28, 27, 26, 25, 24, 23, 22, 21, 20, 19]
	],
	[
		[ 1,  2,  3,  4,  5,  6,  7,  8,  9, 10],
		[ 0,  0,  0,  0,  0,  0,  0,  0,  0, 11],
		[21, 20, 19, 18, 17, 16, 15, 14, 13, 12],
		[22,  0,  0,  0,  0,  0,  0,  0,  0,  0],
		[23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
		[ 0,  0,  0,  0,  0,  0,  0,  0,  0, 33],
		[43, 42, 41, 40, 39, 38, 37, 36, 35, 34],
		[44,  0,  0,  0,  0,  0,  0,  0,  0,  0],
		[45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
		[ 0,  0,  0,  0,  0,  0,  0,  0,  0, 55]
	],
	[
		[10, 11, 12,  0, 32, 33, 34, 35, 36, 37],
		[ 9,  0, 13,  0, 31,  0,  0,  0,  0, 38],
		[ 8,  0, 14,  0, 30,  0, 42, 41, 40, 39],
		[ 7,  0, 15,  0, 29,  0, 43,  0,  0,  0],
		[ 6,  0, 16,  0, 28,  0, 44, 45, 46, 47],
		[ 5,  0, 17,  0, 27,  0,  0,  0,  0, 48],
		[ 4,  0, 18,  0, 26,  0, 52, 51, 50, 49],
		[ 3,  0, 19,  0, 25,  0, 53,  0,  0,  0],
		[ 2,  0, 20,  0, 24,  0, 54, 55, 56, 57],
		[ 1,  0, 21, 22, 23,  0,  0,  0,  0, 58]
	],
	[
		[ 0,  1,  0, 11, 12, 13,  0, 39, 40, 41],
		[ 3,  2,  0, 10,  0, 14,  0, 38,  0, 42],
		[ 4,  0,  0,  9,  0, 15,  0, 37,  0, 43],
		[ 5,  6,  7,  8,  0, 16,  0, 36,  0, 44],
		[ 0,  0,  0,  0,  0, 17,  0, 35,  0, 45],
		[23, 22, 21, 20, 19, 18,  0, 34,  0, 46],
		[24,  0,  0,  0,  0,  0,  0, 33,  0, 47],
		[25, 26, 27, 28, 29, 30, 31, 32,  0, 48],
		[ 0,  0,  0,  0,  0,  0,  0,  0,  0, 49],
		[59, 58, 57, 56, 55, 54, 53, 52, 51, 50]
	],
	[
		[ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
		[ 0,  5,  4,  3,  0,  0, 30, 29, 28,  0],
		[ 6,  0,  0,  2,  1, 32, 31,  0,  0, 27],
		[ 7,  0,  0,  0,  0,  0,  0,  0,  0, 26],
		[ 8,  0,  0,  0,  0,  0,  0,  0,  0, 25],
		[ 9,  0,  0,  0,  0,  0,  0,  0,  0, 24],
		[10, 11,  0,  0,  0,  0,  0,  0, 22, 23],
		[ 0, 12, 13,  0,  0,  0,  0, 20, 21,  0],
		[ 0,  0, 14, 15,  0,  0, 18, 19,  0,  0],
		[ 0,  0,  0,  0, 16, 17,  0,  0,  0,  0]
	]
];
const boardNames = [
    { name: "经典回字形路径", desc: "传统飞行棋布局" },
    { name: "蛇形1", desc: "" },
    { name: "蛇形2", desc: "" },
    { name: "蛇形3", desc: "" },
    { name: "爱心路径", desc: "格子少，脆皮专用" }
];


const ACTION_COUNT_RANGE = {
    min: 20, 
    max: 50 
};

const ACTION_COUNT_RANGE_STORAGE_KEY = "ACTION_COUNT_RANGE";
const LEGACY_ACTION_COUNT_RANGE_STORAGE_KEY = "SPANK_COUNT_RANGE";



let GameData = {
    posture: {
        description: '姿势',
        weight: 60,
        items: [
            { name: '平趴', selected: true },
            { name: '弯腰抱膝', selected: true },
            { name: '站立', selected: true },
            { name: '跪立', selected: true },
            { name: '垫脚扶墙', selected: true }
        ]
    },
    prop: {
        description: '工具',
        weight: 80,
        items: [
            { name: '戒尺', selected: true },
            { name: '藤条', selected: true },
            { name: '热熔胶棒', selected: true },
            { name: '木勺', selected: true },
            { name: '竹条', selected: true },
            { name: '小绿', selected: true },   
            { name: '小红', selected: true },
            { name: '巴掌', selected: true },
            { name: '数据线', selected: true },
            { name: '猫爪拍', selected: true },
            { name: '树脂棒', selected: true },
            { name: '柳叶拍', selected: true },
			{ name: '散鞭', selected: true }

        ]
    },
    reward: {
        description: '休息',
        weight: 10,
        items: [
            { name: '休息3分钟', selected: true },
            { name: '休息5分钟', selected: true },
            { name: '揉2分钟', selected: true },
            { name: '温柔的抱抱', selected: true },
            { name: '免挨一轮', selected: true },
            { name: '免挨两轮', selected: true }
        ]
    },
    aod: {
        description: '位移',
        weight: 5,
        items: [
            { name: '直达终点', selected: true },
            { name: '回到起点', selected: true },
            { name: '前进1-3格', selected: true },
            { name: '后退1-3格', selected: true }
        ]
    },
    sports: {
        description: '运动',
        weight: 10,
        items: [
            { name: '平板支撑三分钟', selected: true },
            { name: '墙角罚站五分钟', selected: true }
        ]
    }
};




let ActiveData = {
    description: '主动方指令',
    weight: 30,
    items: [
        { name: '数量+5', selected: true },
        { name: '数量+10', selected: true },
        { name: '数量-5', selected: true },
        { name: '数量-10', selected: true },
        { name: '翻倍', selected: true },
        { name: '减半(向上取整)', selected: true },
        { name: '指定姿势', selected: true },
        { name: '分期执行(中间休2分钟)', selected: true },
        { name: '强制休息(5分钟)', selected: true },
        { name: '休息无效', selected: true }
    ]
};

const CUSTOMIZABLE_GAME_CATEGORIES = ['posture', 'prop', 'reward', 'sports'];

function cloneStructuredData(value){
	return JSON.parse(JSON.stringify(value));
}

function createBuiltinItem(item, fallbackId){
	return {
		id: String((item && item.id) || fallbackId),
		name: String((item && item.name) || '').trim(),
		selected: item && item.selected !== undefined ? !!item.selected : true,
		custom: false
	};
}

function createCustomItemId(scopeKey){
	return `${scopeKey}-custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createCustomItem(scopeKey, name, selected = true){
	return {
		id: createCustomItemId(scopeKey),
		name: String(name || '').trim(),
		selected: !!selected,
		custom: true
	};
}

function isCustomStoredItem(item, scopeKey){
	if (!item || typeof item !== 'object') return false;
	if (item.custom) return true;

	const id = String(item.id || '');
	return id.startsWith(`${scopeKey}-custom-`);
}

function normalizeStoredCustomItems(items, scopeKey){
	if (!Array.isArray(items)) return [];

	return items
		.filter(item => isCustomStoredItem(item, scopeKey))
		.map(item => {
			const name = String(item.name || '').trim();
			if (!name) return null;

			return {
				id: String(item.id || createCustomItemId(scopeKey)),
				name,
				selected: item.selected !== undefined ? !!item.selected : true,
				custom: true
			};
		})
		.filter(Boolean);
}

function normalizeItemsWithStored(defaultItems, storedItems, scopeKey){
	const builtins = defaultItems.map((item, index) => createBuiltinItem(item, `${scopeKey}-${index + 1}`));
	const sourceItems = Array.isArray(storedItems) ? storedItems : [];
	const storedBuiltins = sourceItems.filter(item => !isCustomStoredItem(item, scopeKey));
	const storedCustoms = normalizeStoredCustomItems(sourceItems, scopeKey);

	const mergedBuiltins = builtins.map((item, index) => {
		const matchedById = storedBuiltins.find(stored => String((stored && stored.id) || '') === item.id);
		const matchedByIndex = storedBuiltins[index];
		const matchedByName = storedBuiltins.find(stored => String((stored && stored.name) || '').trim() === item.name);
		const matched = matchedById || matchedByIndex || matchedByName;

		return {
			...item,
			selected: matched && matched.selected !== undefined ? !!matched.selected : item.selected
		};
	});

	return [...mergedBuiltins, ...storedCustoms];
}

function buildDefaultGameData(source){
	const clone = cloneStructuredData(source);

	Object.keys(clone).forEach(categoryKey => {
		const category = clone[categoryKey] || {};
		const items = Array.isArray(category.items) ? category.items : [];
		category.items = items.map((item, index) => createBuiltinItem(item, `${categoryKey}-${index + 1}`));
		clone[categoryKey] = category;
	});

	return clone;
}

function buildDefaultActiveData(source){
	const clone = cloneStructuredData(source);
	const items = Array.isArray(clone.items) ? clone.items : [];
	clone.items = items.map((item, index) => createBuiltinItem(item, `active-${index + 1}`));
	return clone;
}

const DEFAULT_GAME_DATA = buildDefaultGameData(GameData);
const DEFAULT_ACTIVE_DATA = buildDefaultActiveData(ActiveData);

function normalizeGameData(storedGameData){
	const base = cloneStructuredData(DEFAULT_GAME_DATA);
	const stored = storedGameData && typeof storedGameData === 'object' ? storedGameData : {};

	Object.keys(base).forEach(categoryKey => {
		const category = base[categoryKey];
		const storedCategory = stored[categoryKey] && typeof stored[categoryKey] === 'object'
			? stored[categoryKey]
			: {};

		category.weight = storedCategory.weight !== undefined
			? Number(storedCategory.weight)
			: category.weight;

		if (!Number.isFinite(category.weight)) {
			category.weight = DEFAULT_GAME_DATA[categoryKey].weight;
		}

		category.items = normalizeItemsWithStored(
			DEFAULT_GAME_DATA[categoryKey].items,
			storedCategory.items,
			categoryKey
		);
	});

	return base;
}

function normalizeActiveData(storedActiveData){
	const base = cloneStructuredData(DEFAULT_ACTIVE_DATA);
	const stored = storedActiveData && typeof storedActiveData === 'object' ? storedActiveData : {};

	base.weight = stored.weight !== undefined ? Number(stored.weight) : base.weight;
	if (!Number.isFinite(base.weight)) {
		base.weight = DEFAULT_ACTIVE_DATA.weight;
	}

	base.items = normalizeItemsWithStored(
		DEFAULT_ACTIVE_DATA.items,
		stored.items,
		'active'
	);

	return base;
}

GameData = normalizeGameData(GameData);
ActiveData = normalizeActiveData(ActiveData);

window.CUSTOMIZABLE_GAME_CATEGORIES = CUSTOMIZABLE_GAME_CATEGORIES;
window.createCustomItem = createCustomItem;
window.normalizeGameData = normalizeGameData;
window.normalizeActiveData = normalizeActiveData;
window.ACTION_COUNT_RANGE = ACTION_COUNT_RANGE;
window.ACTION_COUNT_RANGE_STORAGE_KEY = ACTION_COUNT_RANGE_STORAGE_KEY;
window.LEGACY_ACTION_COUNT_RANGE_STORAGE_KEY = LEGACY_ACTION_COUNT_RANGE_STORAGE_KEY;
