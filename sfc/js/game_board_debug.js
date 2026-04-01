"use strict";

const GAME_BOARD_DEBUG_STORAGE_KEY = "SFC_GAME_BOARD_DEBUG_ENABLED";
const GAME_BOARD_DEBUG_ENABLED = (() => {
	try {
		const storedValue = localStorage.getItem(GAME_BOARD_DEBUG_STORAGE_KEY);
		if (storedValue === "1") return true;
		if (storedValue === "0") return false;
	} catch (error) {}
	return false;
})();
const GAME_BOARD_DEBUG_DEFAULT_ITERATIONS = 4000;

(function initGameBoardDebug(global) {
	let latestSnapshot = null;

	function normalizeIterations(iterations) {
		const value = Number.parseInt(iterations, 10);
		if (!Number.isFinite(value) || value <= 0) {
			return GAME_BOARD_DEBUG_DEFAULT_ITERATIONS;
		}
		return Math.max(100, value);
	}

	function getSnapshot() {
		if (latestSnapshot) return latestSnapshot;
		if (typeof global.__SFC_GET_GAME_DEBUG_SNAPSHOT === "function") {
			return global.__SFC_GET_GAME_DEBUG_SNAPSHOT();
		}
		return null;
	}

	function buildWeightRows(snapshot) {
		const weights = snapshot?.weights || {};
		return [
			{ module: "action", weight: weights.action ?? 0 },
			{ module: "rest", weight: weights.rest ?? 0 },
			{ module: "move", weight: weights.move ?? 0 },
			{ module: "sports", weight: weights.sports ?? 0 },
			{ module: "active", weight: weights.active ?? 0 }
		];
	}

	function buildSelectionRows(snapshot) {
		const selections = snapshot?.selections || {};
		return Object.keys(selections).map((scopeKey) => {
			const info = selections[scopeKey] || {};
			return {
				scope: scopeKey,
				selected: info.selectedCount ?? 0,
				total: info.totalCount ?? 0,
				items: Array.isArray(info.selectedItems) ? info.selectedItems.map((item) => item.displayName).join(" | ") : ""
			};
		});
	}

	function buildModuleRows(snapshot, key) {
		const moduleStates = snapshot?.moduleStates?.[key] || [];
		return moduleStates.map((module) => ({
			module: module.type,
			weight: module.weight ?? 0,
			selected: module.selectedCount ?? 0,
			total: module.totalCount ?? 0,
			allowed: module.enabledByAllowedTypes ? "yes" : "no",
			poolReady: module.enabledByPool ? "yes" : "no",
			participates: module.participates ? "yes" : "no",
			items: Array.isArray(module.selectedItems)
				? module.selectedItems.map((item) => item.displayName).join(" | ")
				: ""
		}));
	}

	function logSampling(title, iterations, allowedTypes) {
		if (typeof global.__SFC_SAMPLE_PUNISHMENT_DISTRIBUTION !== "function") return null;
		const result = global.__SFC_SAMPLE_PUNISHMENT_DISTRIBUTION(iterations, allowedTypes);
		console.groupCollapsed(title);
		console.table(result.rows || []);
		console.log(result);
		console.groupEnd();
		return result;
	}

	function dumpLatest(options = {}) {
		const snapshot = getSnapshot();
		if (!snapshot) {
			console.warn("[GameDebug] No board snapshot is available yet.");
			return null;
		}

		const iterations = normalizeIterations(options.iterations);
		const label = `[GameDebug] ${snapshot.board?.token || "unknown"} | ${snapshot.board?.name || "Unnamed board"}`;

		console.groupCollapsed(label);
		console.log("board", snapshot.board);
		console.log("uiSettings", snapshot.uiSettings || {});
		console.log("passiveSummary", snapshot.passiveSummary || {});
		console.log("earlyPassiveSummary", snapshot.earlyPassiveSummary || {});
		console.table(buildWeightRows(snapshot));
		console.groupCollapsed("moduleStates: all passive modules");
		console.table(buildModuleRows(snapshot, "all"));
		console.groupEnd();
		console.groupCollapsed("moduleStates: early replacement pool");
		console.table(buildModuleRows(snapshot, "earlyReplacementPool"));
		console.groupEnd();
		console.table(buildSelectionRows(snapshot));

		if (options.includeMatrix !== false) {
			console.groupCollapsed("boardMatrix");
			console.table(snapshot.boardMatrix || []);
			console.groupEnd();
		}

		if (options.includePassive !== false) {
			console.groupCollapsed("passiveCells");
			console.table(snapshot.passiveCells || []);
			console.groupEnd();
		}

		if (options.includeMaster !== false) {
			console.groupCollapsed("masterCells");
			console.table(snapshot.masterCells || []);
			console.groupEnd();
		}

		if (options.includeSamples !== false) {
			logSampling("sampling: all passive modules", iterations, ["action", "rest", "move", "sports"]);
			logSampling("sampling: early replacement pool", iterations, ["action", "move", "sports"]);
		}

		console.groupEnd();
		return snapshot;
	}

	const api = {
		enabled: GAME_BOARD_DEBUG_ENABLED,
		setSnapshot(snapshot) {
			latestSnapshot = snapshot || null;
			if (GAME_BOARD_DEBUG_ENABLED && latestSnapshot) {
				dumpLatest({ includeSamples: true });
			}
		},
		getSnapshot,
		dumpLatest,
		sample(iterations, allowedTypes) {
			return logSampling("[GameDebug] manual sampling", normalizeIterations(iterations), allowedTypes);
		}
	};

	global.GameBoardDebug = api;
	global.dumpGameBoardDebug = dumpLatest;
})(window);
