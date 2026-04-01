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
const canonicalDataCatalog = window.getI18nValue("data", {
	lang: "zh",
	fallback: {
		boardNames: [],
		categories: {}
	}
}) || { boardNames: [], categories: {} };

function getCategoryCatalog(scopeKey, options = {}) {
	return window.getI18nValue(`data.categories.${scopeKey}`, {
		lang: options.lang,
		fallback: canonicalDataCatalog.categories?.[scopeKey] || { description: "", items: [] }
	}) || { description: "", items: [] };
}

function getBoardMetaCatalog(index, options = {}) {
	const list = window.getI18nValue("data.boardNames", {
		lang: options.lang,
		fallback: canonicalDataCatalog.boardNames || []
	}) || [];
	return list[index] || canonicalDataCatalog.boardNames?.[index] || { id: `board-${index + 1}`, name: "", desc: "" };
}

const boardNames = (canonicalDataCatalog.boardNames || []).map((item, index) => ({
	id: String(item?.id || `board-${index + 1}`),
	name: String(item?.name || "").trim(),
	desc: String(item?.desc || "").trim()
}));


const ACTION_COUNT_RANGE = {
    min: 20, 
    max: 50 
};
const ACTION_COUNT_RANGE_LIMITS = Object.freeze({
	min: 5,
	max: 100,
	step: 5,
	minGap: 5
});

const ACTION_COUNT_RANGE_STORAGE_KEY = "ACTION_COUNT_RANGE";
const LEGACY_ACTION_COUNT_RANGE_STORAGE_KEY = "SPANK_COUNT_RANGE";
const GAME_UI_SETTINGS_STORAGE_KEY = "GAME_UI_SETTINGS";
const DEFAULT_GAME_UI_SETTINGS = {
    showBTaskPrediction: true,
    showBTaskLiveCount: true,
    enableBoardIntroAnimation: true
};

function clampNumber(value, min, max){
	return Math.min(max, Math.max(min, value));
}

function snapActionCountValue(value, fallbackValue = ACTION_COUNT_RANGE.min){
	const parsedValue = Number.parseInt(value, 10);
	if (!Number.isFinite(parsedValue)) return fallbackValue;

	const clampedValue = clampNumber(parsedValue, ACTION_COUNT_RANGE_LIMITS.min, ACTION_COUNT_RANGE_LIMITS.max);
	const steppedValue = ACTION_COUNT_RANGE_LIMITS.min + Math.round((clampedValue - ACTION_COUNT_RANGE_LIMITS.min) / ACTION_COUNT_RANGE_LIMITS.step) * ACTION_COUNT_RANGE_LIMITS.step;
	return clampNumber(steppedValue, ACTION_COUNT_RANGE_LIMITS.min, ACTION_COUNT_RANGE_LIMITS.max);
}

function coerceActionCountRange(rawValue, fallbackRange = ACTION_COUNT_RANGE){
	const fallbackMin = snapActionCountValue(fallbackRange?.min, ACTION_COUNT_RANGE.min);
	const fallbackMax = snapActionCountValue(fallbackRange?.max, ACTION_COUNT_RANGE.max);
	let minValue = snapActionCountValue(rawValue?.min, fallbackMin);
	let maxValue = snapActionCountValue(rawValue?.max, fallbackMax);

	minValue = clampNumber(minValue, ACTION_COUNT_RANGE_LIMITS.min, ACTION_COUNT_RANGE_LIMITS.max - ACTION_COUNT_RANGE_LIMITS.minGap);
	maxValue = clampNumber(maxValue, ACTION_COUNT_RANGE_LIMITS.min + ACTION_COUNT_RANGE_LIMITS.minGap, ACTION_COUNT_RANGE_LIMITS.max);

	if (maxValue - minValue < ACTION_COUNT_RANGE_LIMITS.minGap) {
		if (minValue + ACTION_COUNT_RANGE_LIMITS.minGap <= ACTION_COUNT_RANGE_LIMITS.max) {
			maxValue = minValue + ACTION_COUNT_RANGE_LIMITS.minGap;
		} else {
			minValue = maxValue - ACTION_COUNT_RANGE_LIMITS.minGap;
		}
	}

	return { min: minValue, max: maxValue };
}



function buildCategoryItems(scopeKey) {
	return getCategoryCatalog(scopeKey, { lang: "zh" }).items.map((item, index) => ({
		id: String(item?.id || `${scopeKey}-${index + 1}`),
		name: String(item?.label || "").trim(),
		selected: true
	}));
}

let GameData = {
	posture: {
		description: String(getCategoryCatalog("posture", { lang: "zh" }).description || "").trim(),
		weight: 60,
		items: buildCategoryItems("posture")
	},
	prop: {
		description: String(getCategoryCatalog("prop", { lang: "zh" }).description || "").trim(),
		weight: 80,
		items: buildCategoryItems("prop")
	},
	reward: {
		description: String(getCategoryCatalog("reward", { lang: "zh" }).description || "").trim(),
		weight: 10,
		items: buildCategoryItems("reward")
	},
	aod: {
		description: String(getCategoryCatalog("aod", { lang: "zh" }).description || "").trim(),
		weight: 5,
		items: buildCategoryItems("aod")
	},
	sports: {
		description: String(getCategoryCatalog("sports", { lang: "zh" }).description || "").trim(),
		weight: 10,
		items: buildCategoryItems("sports")
	}
};

let ActiveData = {
	description: String(getCategoryCatalog("active", { lang: "zh" }).description || "").trim(),
	weight: 30,
	items: buildCategoryItems("active")
};

const CUSTOMIZABLE_GAME_CATEGORIES = ['posture', 'prop', 'reward', 'sports'];

const canonicalStringRegistry = [];

function registerCanonicalString(canonical, path) {
	const text = String(canonical || "").trim();
	if (!text) return;
	canonicalStringRegistry.push({ canonical: text, path });
}

(function buildCanonicalRegistry() {
	(canonicalDataCatalog.boardNames || []).forEach((item, index) => {
		registerCanonicalString(item?.name, `data.boardNames.${index}.name`);
		registerCanonicalString(item?.desc, `data.boardNames.${index}.desc`);
	});

	Object.keys(canonicalDataCatalog.categories || {}).forEach((scopeKey) => {
		const category = canonicalDataCatalog.categories[scopeKey] || {};
		registerCanonicalString(category.description, `data.categories.${scopeKey}.description`);
		(category.items || []).forEach((item, index) => {
			registerCanonicalString(item?.label, `data.categories.${scopeKey}.items.${index}.label`);
		});
	});

	canonicalStringRegistry.sort((a, b) => b.canonical.length - a.canonical.length);
})();

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

function normalizeGameUiSettings(storedGameUiSettings){
	const base = { ...DEFAULT_GAME_UI_SETTINGS };
	const stored = storedGameUiSettings && typeof storedGameUiSettings === 'object'
		? storedGameUiSettings
		: {};

	if (stored.showBTaskPrediction !== undefined) {
		base.showBTaskPrediction = !!stored.showBTaskPrediction;
	}
	if (stored.showBTaskLiveCount !== undefined) {
		base.showBTaskLiveCount = !!stored.showBTaskLiveCount;
	}
	if (stored.enableBoardIntroAnimation !== undefined) {
		base.enableBoardIntroAnimation = !!stored.enableBoardIntroAnimation;
	}

	return base;
}

function getCategoryItemById(scopeKey, itemId, options = {}) {
	const category = getCategoryCatalog(scopeKey, options);
	return (category.items || []).find(item => String(item?.id || "") === String(itemId || "")) || null;
}

function getCanonicalCategoryItemLabel(scopeKey, itemId) {
	return String(getCategoryItemById(scopeKey, itemId, { lang: "zh" })?.label || "").trim();
}

function getLocalizedCategoryItemLabel(scopeKey, itemId) {
	const current = getCategoryItemById(scopeKey, itemId);
	if (current && current.label) return String(current.label).trim();
	return getCanonicalCategoryItemLabel(scopeKey, itemId);
}

function getLocalizedCategoryDescription(scopeKey, fallback = "") {
	const category = getCategoryCatalog(scopeKey);
	return String(category?.description || fallback || "").trim();
}

function getLocalizedBoardMeta(index) {
	const current = getBoardMetaCatalog(index);
	const fallback = boardNames[index] || { id: `board-${index + 1}`, name: "", desc: "" };
	return {
		id: String(current?.id || fallback.id || `board-${index + 1}`),
		name: String(current?.name || fallback.name || "").trim(),
		desc: String(current?.desc || fallback.desc || "").trim()
	};
}

function getLocalizedItemName(scopeKey, item) {
	if (!item) return "";
	if (item.custom) return String(item.name || "").trim();
	if (item.id) {
		return getLocalizedCategoryItemLabel(scopeKey, item.id) || String(item.name || "").trim();
	}
	return localizeBuiltinText(String(item.name || "").trim());
}

function localizeBuiltinText(text) {
	let output = String(text || "");
	if (!output) return output;

	canonicalStringRegistry.forEach((entry) => {
		const translated = t(entry.path, {}, entry.canonical);
		if (!entry.canonical || translated === entry.canonical) return;
		output = output.split(entry.canonical).join(translated);
	});

	return output;
}

GameData = normalizeGameData(GameData);
ActiveData = normalizeActiveData(ActiveData);

window.CUSTOMIZABLE_GAME_CATEGORIES = CUSTOMIZABLE_GAME_CATEGORIES;
window.createCustomItem = createCustomItem;
window.normalizeGameData = normalizeGameData;
window.normalizeActiveData = normalizeActiveData;
window.ACTION_COUNT_RANGE = ACTION_COUNT_RANGE;
window.ACTION_COUNT_RANGE_LIMITS = ACTION_COUNT_RANGE_LIMITS;
window.ACTION_COUNT_RANGE_STORAGE_KEY = ACTION_COUNT_RANGE_STORAGE_KEY;
window.LEGACY_ACTION_COUNT_RANGE_STORAGE_KEY = LEGACY_ACTION_COUNT_RANGE_STORAGE_KEY;
window.coerceActionCountRange = coerceActionCountRange;
window.GAME_UI_SETTINGS_STORAGE_KEY = GAME_UI_SETTINGS_STORAGE_KEY;
window.DEFAULT_GAME_UI_SETTINGS = DEFAULT_GAME_UI_SETTINGS;
window.normalizeGameUiSettings = normalizeGameUiSettings;
window.getCanonicalCategoryItemLabel = getCanonicalCategoryItemLabel;
window.getLocalizedCategoryItemLabel = getLocalizedCategoryItemLabel;
window.getLocalizedCategoryDescription = getLocalizedCategoryDescription;
window.getLocalizedBoardMeta = getLocalizedBoardMeta;
window.getLocalizedItemName = getLocalizedItemName;
window.localizeBuiltinText = localizeBuiltinText;
