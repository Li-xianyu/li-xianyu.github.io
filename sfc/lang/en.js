"use strict";

window.__I18N_DICTIONARIES = window.__I18N_DICTIONARIES || {};

window.__I18N_DICTIONARIES.en = {
	meta: {
		lang: "en"
	},
	common: {
		appName: "Dual Protocol",
		actions: {
			confirm: "Confirm",
			confirmOk: "👌 Confirm",
			cancel: "Cancel",
			save: "Save",
			close: "Close",
			back: "Back",
			reload: "Reload",
			load: "Load",
			delete: "Delete",
			generate: "Generate",
			copy: "Copy",
			sort: "Sort",
			use: "Use",
			keep: "Keep",
			openMenu: "Open menu",
			knowIt: "Got it",
			continue: "Agree and continue",
			reject: "Decline and exit",
			fillAll: "All +1",
			resetAll: "Reset all"
		},
		quickDock: {
			open: "Open quick actions",
			theme: "Toggle theme",
			settings: "Open settings",
			install: "Install app",
			language: "Switch language"
		},
		language: {
			short: {
				en: "EN",
				zh: "中"
			},
			switchTo: {
				en: "Switch to English",
				zh: "Switch to Chinese"
			}
		},
		status: {
			dash: "—"
		}
	},
	data: {
		boardNames: [
			{ id: "classic-loop", name: "Classic Loop", desc: "Traditional flight-board layout" },
			{ id: "snake-1", name: "Snake 1", desc: "" },
			{ id: "snake-2", name: "Snake 2", desc: "" },
			{ id: "snake-3", name: "Snake 3", desc: "" },
			{ id: "heart-route", name: "Heart Route", desc: "Shorter route with fewer cells" }
		],
		categories: {
			posture: {
				description: "Posture",
				items: [
					{ id: "prone", label: "Prone" },
					{ id: "bend_hold_knees", label: "Bend and hold knees" },
					{ id: "standing", label: "Standing" },
					{ id: "kneeling", label: "Kneeling" },
					{ id: "tiptoe_wall", label: "Tiptoe against wall" }
				]
			},
			prop: {
				description: "Tool",
				items: [
					{ id: "ruler", label: "Ruler" },
					{ id: "cane", label: "Cane" },
					{ id: "glue_stick", label: "Glue stick" },
					{ id: "wooden_spoon", label: "Wooden spoon" },
					{ id: "bamboo_strip", label: "Bamboo strip" },
					{ id: "little_green", label: "Little Green" },
					{ id: "little_red", label: "Little Red" },
					{ id: "palm", label: "Palm" },
					{ id: "data_cable", label: "Data cable" },
					{ id: "cat_paw_paddle", label: "Cat paw paddle" },
					{ id: "resin_rod", label: "Resin rod" },
					{ id: "willow_paddle", label: "Willow paddle" },
					{ id: "loose_whip", label: "Loose whip" }
				]
			},
			reward: {
				description: "Rest",
				items: [
					{ id: "rest_3m", label: "Rest 3 min" },
					{ id: "rest_5m", label: "Rest 5 min" },
					{ id: "rub_2m", label: "Rub 2 min" },
					{ id: "gentle_hug", label: "Gentle hug" },
					{ id: "skip_one_round", label: "Skip one round" },
					{ id: "skip_two_rounds", label: "Skip two rounds" }
				]
			},
			aod: {
				description: "Move",
				items: [
					{ id: "to_end", label: "Go straight to finish" },
					{ id: "to_start", label: "Back to start" },
					{ id: "forward_1_3", label: "Move forward 1-3 cells" },
					{ id: "backward_1_3", label: "Move backward 1-3 cells" }
				]
			},
			sports: {
				description: "Exercise",
				items: [
					{ id: "plank_3m", label: "Plank for 3 min" },
					{ id: "wall_stand_5m", label: "Wall stand for 5 min" }
				]
			},
			active: {
				description: "Active-side instructions",
				items: [
					{ id: "count_plus_5", label: "Count +5" },
					{ id: "count_plus_10", label: "Count +10" },
					{ id: "count_minus_5", label: "Count -5" },
					{ id: "count_minus_10", label: "Count -10" },
					{ id: "double_count", label: "Double" },
					{ id: "half_up", label: "Half (round up)" },
					{ id: "choose_posture", label: "Pick posture" },
					{ id: "split_with_rest", label: "Split execution (rest 2 min in between)" },
					{ id: "force_rest_5m", label: "Forced rest (5 min)" },
					{ id: "rest_invalid", label: "Rest invalid" }
				]
			}
		}
	},
	logic: {
		duration: {
			regex: "(\\d+(?:\\.\\d+)?|[零一二两三四五六七八九十半]+)\\s*(分钟|分|秒钟|秒|minutes?|mins?|min|m|seconds?|secs?|sec|s)",
			halfToken: "半",
			tenToken: "十",
			digits: {
				"零": 0,
				"一": 1,
				"二": 2,
				"两": 2,
				"三": 3,
				"四": 4,
				"五": 5,
				"六": 6,
				"七": 7,
				"八": 8,
				"九": 9
			},
			minuteTokens: ["分钟", "分", "m"]
		}
	},
	home: {
		title: "Dual Protocol",
		chips: {
			localFirst: "Local-First",
			dualSolo: "Dual & Solo"
		},
		hero: {
			subtitle: "Rules are yours, dice are destiny",
			lines: [
				"Rules are yours, dice are destiny",
				"The board is ready when you are",
				"Let's see who gets unlucky today",
				"The board is set, only cowards hesitate",
				"Take the hint: configure first, then play",
				"The dice are not targeting you, bad luck is just bad luck"
			]
		},
		installSpotlight: {
			badge: "App",
			dismiss: "Hide this",
			title: "Install is available from the top-right menu",
			desc: "There is an install entry in the fixed floating menu at the top right. Once added to your desktop, it opens faster and feels more like a native app.",
			action: "Install now",
			guide: "Browser advice",
			descCanInstall: "An install button will appear in the fixed floating menu at the top right, and you can also install from the button below. Chrome or Edge is recommended on Android / Windows / macOS, and Safari on iPhone / iPad.",
			descManualInstall: "You are on a Chrome / Edge family browser. The install button in the top-right floating menu will stay there; if it does not open the system install dialog, open the browser menu and choose “Install”, not “Create shortcut”.",
			descIosSafari: "Safari is recommended on iPhone / iPad. Safari usually does not show a system install dialog, so use “Share -> Add to Home Screen” instead.",
			descUnsupported: "If the install button does not appear in the top-right floating menu, the current browser usually does not support it. Chrome or Edge is recommended on Android / Windows / macOS, and Safari on iPhone / iPad.",
			actionInstall: "Install now",
			actionHelp: "View install steps"
		},
		buttons: {
			start: {
				title: "Start Game",
				desc: "Throw the first die and today’s round begins"
			},
			settings: {
				title: "Game Settings",
				desc: "Tune weights and rule parameters, then draw custom board routes"
			},
			manual: {
				title: "Usage Notes",
				desc: "Read the guide, privacy notes, and terms"
			},
			devlog: {
				title: "Dev Log",
				desc: "See the iteration trail and how this thing evolved"
			}
		},
		note: "Supports custom boards and rule parameters, so you can tune things before each session.",
		social: {
			nameHtml: "<s>@yunshanlxy</s> <strong>(capital got me)</strong>",
			line: "X, seriously? You leave all that trash up but suspend one indie tool maker. If you have the guts, go block my GitHub too."
		},
		installHint: {
			title: "You can install from the top-right menu",
			heading: "Install entry hint",
			body1: "There is an install icon in the fixed floating menu at the top right. Tap it to try installation. On Chrome / Edge family browsers, if it does not open the system install dialog, open the browser menu and choose “Install”, not “Create shortcut”.",
			body2: "If you are inside a built-in browser like WeChat or QQ, open the page in the system browser first, then install."
		},
		manualDialog: {
			title: "Disclaimer and Terms of Use",
			bodyHtml: "1. This app is a fictional entertainment product. Its scenarios, tasks, and interactions are fictional creations and do not advocate or endorse real-world behavior.<br><br>2. Privacy and data: settings, boards, and related content are stored in your local browser by default. The site may collect anonymous usage events such as page visits and button clicks to improve the experience, but it does not include information that directly identifies you. Clearing browser storage may remove local data.<br><br>By continuing to use this app, you confirm that you have read, understood, and agreed to all of the above.",
			accept: "Agree and continue",
			reject: "Decline and exit"
		},
		exit: {
			title: "Access ended",
			desc: "Page has been cleared..."
		},
		boardDialog: {
			title: "Choose Board",
			tabBuiltin: "Built-in Boards",
			tabCustom: "Workshop",
			emptyCustom: "There are no custom boards yet. Create one from the top of the settings page first.",
			emptyBuiltin: "No built-in boards available",
			customDesc: "Local custom board",
			size: "{steps} cells",
			cancel: "Cancel"
		},
		modeDialog: {
			title: "Choose Mode",
			soloName: "DIY Mode",
			soloDesc: "Roll and execute by yourself",
			dualName: "SJ Mode",
			dualDesc: "Two players roll, and each cell contains tasks for both sides",
			back: "Back to board selection"
		},
		onboarding: {
			introTitle: "Quick Tour",
			introBody: "This is a 4-step intro to the home page. You will go through Start Game, Settings, Usage Notes, and Dev Log in order. It is worth reading once before your first round.",
			startTitle: "Start Game",
			startBody: "This enters the main game flow. It opens board selection first, then mode selection (DIY or SJ). Best practice: finish basic setup in Game Settings before starting so the experience matches your rules more closely.",
			settingsTitle: "Game Settings",
			settingsBody: "This is the rule and content center. You can tune task weights, toggle modules, and manage custom content and boards. Finishing a basic setup once will make future rounds feel much more aligned with your preferences.",
			dockTitle: "Top-right quick menu",
			dockBody: "Tap here to open the fixed floating menu. Chrome / Edge family browsers keep the install icon there; if the system install dialog does not appear, open the browser menu and choose “Install”, not “Create shortcut”. Safari is recommended on iPhone / iPad.",
			devlogTitle: "Dev Log",
			devlogBody: "This is where version notes and iteration details live. If something behaves differently from before, check the latest changes first. It is also the fastest way to see whether a new feature is worth turning on.",
			next: "Next",
			prev: "Back",
			done: "Done",
			skip: "Skip"
		}
	},
	settings: {
		title: "Rule Settings",
		backHome: "Back Home",
		createBoards: "Create Board",
		tabs: {
			b: "B Module",
			z: "Z Module",
			x: "Extensions"
		},
		rangeLegend: "Single-hit count range",
		minCount: "Minimum count:",
		maxCount: "Maximum count:",
		weightsLegend: "Module weight settings",
		weightsTip: "Weights control the relative chance of each module when random content is generated. Higher weight means higher chance.",
		weightProp: "Core module weight:",
		weightReward: "Rest module weight:",
		weightAod: "Move module weight:",
		weightSports: "Exercise module weight:",
		modulePoolTitle: "Execution content pool",
		modulePoolTipHtml: "Tap an item to toggle it on or off (dark = enabled, light = disabled). Categories with <span class=\"plus-badge\">+</span> support custom additions.",
		activeLegend: "Z module weight",
		activeTip: "This weight is reserved for a future mode where instructions also join the random pool. Right now it does not affect board rendering.",
		activeWeight: "Instruction weight:",
		uiLegend: "In-game display",
		uiTip: "Controls whether the B-task prediction entry and live total are shown on the game page. Both are enabled by default.",
		togglePredictionTitle: "B-task prediction indicator",
		togglePredictionDesc: "Shows the exclamation button in the task panel so you can open prediction and stats.",
		toggleLiveCountTitle: "Live actual total",
		toggleLiveCountDesc: "Keeps the accumulated actual count visible in the task panel during a round.",
		dataTransferLegend: "Local data transfer",
		dataTransferTip: "Export your current local configuration and custom boards as a backup, or import a previous backup to restore them on this device.",
		dataTransferButton: "Import / Export Data",
		save: "Save settings",
		modalSavedTitle: "Settings saved",
		modalSavedMessage: "Your configuration has been saved successfully.",
		transferDialogTitle: "Local Data Transfer",
		transferTabs: {
			export: "Export",
			import: "Import"
		},
		transferExportTip: "The export contains rule settings, B/Z pools, in-game display options, custom boards, board draft, language, and theme.",
		transferImportTip: "Paste a backup JSON here, or choose a local `.json` file. Importing will overwrite the corresponding local data on this device.",
		transferChooseFile: "Choose JSON File",
		transferNoFile: "No file selected",
		transferSelectedFile: "Selected file: {name}",
		transferImportPlaceholder: "Paste backup JSON here",
		transferClear: "Clear",
		transferApply: "Import and Overwrite",
		transferCopy: "Copy JSON",
		transferDownload: "Download File",
		transferSummary: "Includes {groups} data groups and {boards} custom board(s).",
		transferExportUnavailable: "Export is unavailable until the current settings values are valid.",
		transferExportErrorTitle: "Export unavailable",
		transferCopySuccessTitle: "Copied",
		transferCopySuccessMessage: "Backup JSON has been copied to the clipboard.",
		transferCopyError: "Copy failed. Please select and copy the JSON manually.",
		transferDownloadError: "Download failed. Please try again.",
		transferImportEmpty: "Paste backup JSON or choose a JSON file first.",
		transferImportParseError: "The JSON could not be parsed. Please check the file content and try again.",
		transferImportUnsupported: "No supported local data was found in this backup file.",
		transferImportErrorTitle: "Import failed",
		transferImportConfirmTitle: "Import local data",
		transferImportConfirmMessage: "This will overwrite {groups} local data group(s) on this device. Continue?",
		transferImportSuccessTitle: "Import complete",
		transferImportSuccessMessage: "The backup has been imported. Confirm to refresh this page and apply the new data.",
		transferFileReadError: "The selected file could not be read.",
		transferImportRangeInvalid: "The action count range in this backup is invalid.",
		transferImportGameDataInvalid: "The B module data in this backup is invalid.",
		transferImportActiveDataInvalid: "The Z module data in this backup is invalid.",
		transferImportUiInvalid: "The in-game display settings in this backup are invalid.",
		transferImportBoardsInvalid: "The custom board data in this backup is invalid.",
		transferImportDraftInvalid: "The board draft data in this backup is invalid.",
		categoryLabels: {
			posture: "Posture",
			prop: "Tool",
			reward: "Rest",
			aod: "Move",
			sports: "Exercise",
			active: "Instruction Pool (Z)"
		},
		editableMeta: {
			postureTitle: "Add posture",
			posturePlaceholder: "Enter a new posture",
			propTitle: "Add tool",
			propPlaceholder: "Enter a new tool name",
			rewardTitle: "Add rest item",
			rewardPlaceholder: "Example: Rest 3 min (plain text is also fine)",
			sportsTitle: "Add exercise",
			sportsPlaceholder: "Example: Plank 3 min (plain text is also fine)",
			activeTitle: "Add Z instruction",
			activePlaceholder: "Enter a new Z instruction",
			defaultTitle: "Add content",
			defaultPlaceholder: "Enter new content"
		},
		addAria: "Add {label}",
		deleteAria: "Delete {name}",
		inputConfirm: "Confirm",
		inputCancel: "Cancel",
		confirmDeleteTitle: "Delete custom content",
		confirmDeleteMessage: "Delete “{name}”?",
		emptyContentTitle: "Content cannot be empty",
		emptyContentMessage: "Enter some content before confirming.",
		duplicateTitle: "Duplicate content",
		duplicateMessage: "This category already contains the same content.",
		sportsTip: "Tip: texts with numbers plus sec/min units in Chinese or English, such as “Plank 3 min” or “plank 30s”, will trigger a countdown. Plain text also works.",
		rewardTip: "Tip: texts with numbers plus sec/min units in Chinese or English, such as “Rest 3 min”, “rest 5s”, or “rest 10min”, will trigger a countdown. Plain text also works.",
		aodTip: "Tip: “Move forward 1-3 cells / Move backward 1-3 cells” only changes position for now and does not trigger extra content on the destination cell.",
		errorTitle: "Error",
		errorMultipleOfTen: "Please enter a multiple of 10.",
		errorMinLessThanMax: "The minimum value must be smaller than the maximum value."
	},
	createBoards: {
		title: "Create Board",
		backSettings: "Back to Settings",
		loadDraft: "Load Draft",
		clear: "Clear",
		heroTitle: "Create Board",
		heroSubHtml: "Draw it as you think it<br>Starting from the first cell and dragging all the way to the last one usually keeps things clearer.",
		canvasTitle: "Canvas",
		draw: "Draw",
		erase: "Erase",
		tips: [
			"Hold mouse or finger to draw continuously",
			"Do not drag too fast or cells may be skipped",
			"The path should stay connected up, down, left, or right",
			"Numbers are automatically reindexed, so no gaps are left behind"
		],
		stats: {
			count: "Cells",
			start: "Start",
			end: "End",
			status: "Path status",
			notStarted: "Not started",
			startOnly: "Start only",
			valid: "Valid",
			broken: "{count} break(s)"
		},
		cellUnit: "cells",
		infoTitle: "Board Info",
		boardName: "Board name",
		boardNamePlaceholder: "For example: Spiral Hallway",
		boardDesc: "Board description",
		boardDescPlaceholder: "For example: medium length with more corners",
		demoName: "Demo Corridor",
		demoDesc: "Outer loop with medium length",
		fillDemo: "Load Demo",
		copyBoard: "Copy board",
		saveLocal: "Save locally",
		exportTitle: "Export",
		exportHelpFormat: "Saved in `CUSTOM_BOARDS`",
		exportHelpOutput: "The export only outputs the 2D `board` array so you can paste it directly into `Data.js`",
		storageTitle: "Local Saves",
		savedEmpty: "No custom boards yet. Draw one first.",
		defaultBoardName: "Untitled board",
		defaultBoardDesc: "No description",
		localCustomBoard: "Local custom board",
		load: "Load",
		copyCode: "Copy code",
		delete: "Delete",
		toasts: {
			cleared: "Board cleared",
			demoLoaded: "Demo loaded",
			boardCopied: "Board copied",
			writeNameFirst: "Enter a board name first",
			atLeastTwoCells: "You need at least 2 cells",
			pathBroken: "The path has breaks. Fix it first.",
			saved: "Saved locally",
			loaded: "Board loaded",
			savedCodeCopied: "Saved board code copied",
			copyFailed: "Copy failed",
			deleted: "Deleted",
			noDraft: "No draft found",
			draftLoaded: "Draft loaded"
		}
	},
	game: {
		title: "In Game...",
		roundInitial: "Round 1",
		roundSingle: "Round {round}",
		roundDual: "Round {round}{suffix}",
		roundSuffix: " ({done} rolled)",
		taskMasterTitle: "Z Task",
		taskPassiveTitle: "B Task",
		vetoBadge: "Veto",
		liveCountDefault: "Total 0",
		liveCount: "Total {count}",
		statsAria: "View B-task stats",
		statsTitle: "View stats",
		roll: {
			masterIdle: "Z Roll",
			passiveIdle: "B Roll",
			done: "Done",
			single: "Roll"
		},
		prefix: {
			action: "Action",
			rest: "Rest",
			move: "Move",
			sports: "Exercise",
			end: "Finish",
			content: "Content"
		},
		typeMap: {
			action: "⛔️ B: Action",
			rest: "☕️ B: Rest",
			move: "🚶 B: Move",
			sports: "🏃 B: Exercise",
			end: "🏁 Finish",
			master: "🎲 Z: Cell Instruction",
			hint: "Hint"
		},
		bTaskType: {
			action: "Action",
			rest: "Rest",
			move: "Move",
			sports: "Exercise",
			unknown: "Other"
		},
		noInstruction: "No instruction available",
		noTool: "No tool available",
		noRest: "No rest item available",
		noMove: "No move item available",
		noSports: "No exercise item available",
		noType: "No available type",
		taskApplied: "Z instruction applied to this round's B task",
		taskPrefixApplied: "Action: {text}",
		splitExecution: "; split execution: first {first}, rest 2 min, then {second}",
		veto: {
			title: "🛡️ Veto",
			granted: "You received one veto. You can choose to use it the next time a rest dialog appears.",
			detected: "Rest detected: {text}<br><br>Use the veto to cancel this rest?",
			used: "The veto was used. This rest is cancelled.",
			use: "Use",
			keep: "Keep"
		},
		forceRest: "Forced rest 5 min",
		countdown: {
			sportsTitle: "🏃 B: Exercise timer",
			restTitle: "☕️ B: Forced rest",
			badge: "Continues automatically when the countdown ends",
			fallback: "Duration not detected, defaulting to {seconds} seconds",
			current: "This countdown: {value}",
			hint: "Supported: 3 min / three minutes / 20min / 45s (minutes and seconds only)",
			minuteUnit: "min",
			secondUnit: "sec"
		},
		stats: {
			title: "B-task Stats",
			notReady: "The board is still initializing. Please try again in a moment.",
			reachHelpTitle: "Estimate guide",
			reachMean: "Estimated reachable cells (mean)",
			reachRange: "Estimated reachable cell range (P10-P90)",
			hitsMean: "Estimated total hits (mean)",
			hitsRange: "Estimated total hit range (P10-P90)",
			ci95: "Estimated precision (95% CI)",
			runs: "Simulation runs",
			cellsUnit: "{value} cells",
			note: "Method: Monte Carlo simulation based on the current board content, move rules, and random die results from 1 to 6. In dual mode, the current round's Z instruction count modifiers are applied dynamically. “Total hits” means the accumulated counts from all action-cell landings.",
			estimateHitsTotal: "Estimated total hits",
			estimateHelpAria: "View estimate guide",
			estimateHelpTitle: "View estimate guide",
			hitsRangeWithMean: "{low} - {high} (mean {mean})"
		},
		cellInfoTitle: "Current Cell",
		moveResolveTitle: "🚶 Move Result",
		moveResolveCurrent: "This time: {label}",
		moveLabelForward: "move forward {count} cells",
		moveLabelBackward: "move backward {count} cells",
		endGame: {
			title: "🏁 Finish",
			totalHits: "Actual total hits this round",
			actionTriggers: "Action triggers",
			restartQuestion: "Start a new round?",
			confirm: "Confirm",
			cancel: "Cancel"
		},
		tips: {
			masterDone: "Z already rolled this round",
			passiveDone: "B already rolled this round"
		}
	},
	pwa: {
		install: {
			aria: "Install app",
			title: "Install app",
			ios: {
				title: "Safari install steps",
				lead: "Safari is recommended on iPhone / iPad. The top-right floating menu mainly serves browsers that support direct install. On iOS, please use the Safari share menu.",
				steps: [
					"If you are not in Safari yet, open this page in Safari first",
					"Tap the Share button at the top or bottom of the browser",
					"Choose “Add to Home Screen”",
					"After confirming, you can launch it from the home screen like a native app"
				]
			},
			chromium: {
				title: "Browser menu install steps",
				lead: "This browser supports installation. The install button in the top-right floating menu will stay visible. If the system install dialog does not appear, use the browser menu and choose “Install”, not “Create shortcut”.",
				steps: [
					"Try the install button in the top-right floating menu first",
					"If the system install dialog does not appear, open the browser menu",
					"Prefer options such as “Install / Install app / Add to desktop”",
					"If you also see “Create shortcut”, do not use it unless install is unavailable"
				]
			},
			general: {
				title: "Install steps",
				lead: "If the install icon is already visible in the top-right floating menu, that is the easiest route. If not, follow the steps below and install from the browser menu.",
				steps: [
					"Open the current page with Chrome or Edge if possible",
					"Open the browser menu",
					"Find an option like “Install app / Install / Add to desktop”",
					"Confirm to launch it directly from the desktop or start menu later"
				]
			},
			ok: "Got it"
		},
		browserAdvice: {
			title: "Browser advice",
			lead: "To reliably see install entry points, prefer a system browser with solid PWA support.",
			steps: [
				"Android / Windows / macOS: Chrome or Edge is recommended because they keep the in-site install entry",
				"iPhone / iPad: Safari is recommended",
				"Built-in browsers inside apps such as WeChat, QQ, or Weibo: use “Open in browser” first",
				"If the install entry still does not show up, refresh once and check the floating menu again"
			]
		}
	},
	offline: {
		title: "Dual Protocol | Offline",
		badge: "Offline",
		heading: "Network is unavailable",
		body: "The core pages and static assets are already cached. You can go back to the home page now, or reload after the network returns to fetch the latest content.",
		backHome: "Back home",
		reload: "Reload",
		list: [
			"Pages that were opened before are often still available.",
			"During the first offline session, third-party CDN resources may be missing.",
			"After the network returns, refresh once and the cache will update automatically."
		]
	},
	devlog: {
		title: "Dual Protocol · Dev Log",
		backHome: "Back Home",
		heroTitle: "Dual Protocol Dev Log",
		heroSub: "No official marketing voice here. This page is just a record of how I dragged the project from “playable” toward “closer to a product”. A lot of it was built and revised in parallel, with plenty of rough edges, but every version felt a little better to use.",
		milestonesTitle: "Major Milestones",
		timeline: [
			{
				title: "Experience upgrade: custom boards + per-round estimate and actual totals",
				time: "Late March 2026",
				desc: "This version closed the loop on playability and feedback. It added custom boards, estimated total hits per round, and live/final actual totals so both the play loop and the data feedback felt more complete.",
				tags: ["Custom boards", "In-round estimate", "Actual totals"]
			},
			{
				title: "Structure upgrade: engine layer and rule layer start to split",
				time: "Late Feb - Early Mar 2026",
				desc: "This was the most important technical refactor so far. Once movement handling and rule triggering were separated, the code finally shifted from “it runs” to “it can keep evolving”.",
				tags: ["Engine layer", "Rule layer", "Structural split"]
			},
			{
				title: "Decision to ship on Pages and clean up sensitive wording",
				time: "February 2026",
				desc: "When preparing for a public deployment, the wording had to be tightened up or the project simply could not be shared outward. The target was practical: keep the core play while making the presentation friendlier to outsiders.",
				tags: ["GitHub Pages", "Text cleanup", "Public deployment"]
			},
			{
				title: "Settings system goes live: user experience ++",
				time: "Second half of 2025",
				desc: "After this step it stopped being something only I could use. Once the settings page was live, rules, weights, and content could all be configured directly, and the whole project finally started to feel alive.",
				tags: ["Settings page", "Local storage", "Configurable"]
			},
			{
				title: "Data split: task content becomes modular",
				time: "Mid to late 2025",
				desc: "As content grew, the page itself stayed manageable but the data quickly became painful. Splitting the task pool into modules made weights, toggles, and custom content far easier to maintain later.",
				tags: ["Data.js", "Modular", "Extensible"]
			},
			{
				title: "Dual-core thinking: not just content, but flow",
				time: "First half of 2025",
				desc: "Adding more entries was no longer enough. The flow was the real key. That is why rounds, dice, movement, and position state all had to be completed before the game stopped feeling scattered.",
				tags: ["Turn-based", "Dice logic", "Flow progression"]
			},
			{
				title: "Direction locks in: fixed-route board game",
				time: "October 2024",
				desc: "This was the first major turn. Instead of a pure document page, the project moved directly into a board route. From this point onward it finally had that “move across cells + trigger events + advance rounds” feel.",
				tags: ["Fixed route", "Board-based", "Direction set"]
			},
			{
				title: "Earliest prototype: rule list format",
				time: "Around mid 2024",
				desc: "At the very beginning it was not a board at all. It was basically a web-based rule handbook. The first goal was just to get the content in, make sections expand and collapse, and build the skeleton.",
				tags: ["Rule list", "Frontend interaction", "Early prototype"]
			}
		],
		thanksTitle: "Thanks",
		thanksLines: [
			"First, thanks to my girlfriend and partner in this small circle. She stayed with me through all the detail-polishing, feedback loops, real tests, and my constant dev-time zigzags.",
			"I also owe thanks to an old friend I originally met through IT and have known for many years. We have talked about tech, life, and eventually this project too, and I even ended up dragging him into understanding a bit of this tiny niche.",
			"And thanks to all the friends who playtested and gave feedback along the way. Every “this part still feels off” reminder mattered."
		],
		thanksChatgptPrefix: "A special last thanks to",
		thanksChatgptBadge: "wildly overpowered ChatGPT",
		thanksChatgptSuffix: "for staying up with me while I kept revising things deep into the night.",
		toYouTitle: "To You",
		toYouHtml: "If you made it this far, thank you for reading.<br><br>The road ahead is long. Let's keep going."
	},
	bottle: {
		title: "Bottle Studio",
		heroTitle: "Bottle Studio",
		backHome: "Home",
		heroSub: "A cleaner bottle management panel aligned with the board UI style.",
		inputPlaceholder: "Enter names separated by spaces, line breaks, or commas. Example: Water Meditation English Push-ups",
		build: "Build Bottles",
		maxLevel: "Max level",
		liquid: "Liquid",
		paletteAria: "Liquid color presets",
		fillAll: "All +1",
		resetAll: "Reset all",
		sort: "Sort by level",
		empty: "Enter names and click “Build Bottles”.",
		noData: "No bottles yet. Enter names and build them first.",
		stats: "{count} bottles, total progress {total}/{maxTotal} ({percent}%)",
		flash: {
			maxLevelRange: "Max level range: 3 - 20",
			enterNames: "Enter some names first",
			generated: "{count} bottles created",
			reset: "All progress cleared"
		},
		colorAria: "Choose liquid color {color}"
	}
};
