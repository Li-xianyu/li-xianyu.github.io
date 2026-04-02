"use strict";

window.__I18N_DICTIONARIES = window.__I18N_DICTIONARIES || {};

window.__I18N_DICTIONARIES.zh = {
	meta: {
		lang: "zh-CN"
	},
	common: {
		appName: "Dual Protocol",
		actions: {
			confirm: "确认",
			confirmOk: "👌 确认",
			cancel: "取消",
			save: "保存",
			close: "关闭",
			back: "返回",
			reload: "重新加载",
			load: "载入",
			delete: "删除",
			generate: "生成",
			copy: "复制",
			sort: "排序",
			use: "使用",
			keep: "保留",
			openMenu: "打开菜单",
			knowIt: "知道了",
			continue: "同意并继续",
			reject: "拒绝并退出",
			fillAll: "全部 +1",
			resetAll: "全部清零"
		},
		quickDock: {
			open: "打开快捷按钮",
			theme: "切换主题",
			settings: "打开设置",
			install: "安装应用",
			language: "切换语言"
		},
		language: {
			short: {
				en: "EN",
				zh: "中"
			},
			switchTo: {
				en: "切换到英文",
				zh: "切换到中文"
			}
		},
		status: {
			dash: "—"
		}
	},
	data: {
		boardNames: [
			{ id: "classic-loop", name: "经典回字形路径", desc: "传统飞行棋布局" },
			{ id: "snake-1", name: "蛇形1", desc: "" },
			{ id: "snake-2", name: "蛇形2", desc: "" },
			{ id: "snake-3", name: "蛇形3", desc: "" },
			{ id: "heart-route", name: "爱心路径", desc: "格子少，脆皮专用" }
		],
		categories: {
			posture: {
				description: "姿势",
				items: [
					{ id: "prone", label: "平趴" },
					{ id: "bend_hold_knees", label: "弯腰抱膝" },
					{ id: "standing", label: "站立" },
					{ id: "kneeling", label: "跪立" },
					{ id: "tiptoe_wall", label: "垫脚扶墙" }
				]
			},
			prop: {
				description: "工具",
				items: [
					{ id: "ruler", label: "戒尺" },
					{ id: "cane", label: "藤条" },
					{ id: "glue_stick", label: "热熔胶棒" },
					{ id: "wooden_spoon", label: "木勺" },
					{ id: "bamboo_strip", label: "竹条" },
					{ id: "little_green", label: "小绿" },
					{ id: "little_red", label: "小红" },
					{ id: "palm", label: "巴掌" },
					{ id: "data_cable", label: "数据线" },
					{ id: "cat_paw_paddle", label: "猫爪拍" },
					{ id: "resin_rod", label: "树脂棒" },
					{ id: "willow_paddle", label: "柳叶拍" },
					{ id: "loose_whip", label: "散鞭" }
				]
			},
			reward: {
				description: "休息",
				items: [
					{ id: "rest_3m", label: "休息3分钟" },
					{ id: "rest_5m", label: "休息5分钟" },
					{ id: "rub_2m", label: "揉2分钟" },
					{ id: "gentle_hug", label: "温柔的抱抱" },
					{ id: "skip_one_round", label: "免挨一轮" },
					{ id: "skip_two_rounds", label: "免挨两轮" }
				]
			},
			aod: {
				description: "位移",
				items: [
					{ id: "to_end", label: "直达终点" },
					{ id: "to_start", label: "回到起点" },
					{ id: "forward_1_3", label: "前进1-3格" },
					{ id: "backward_1_3", label: "后退1-3格" }
				]
			},
			sports: {
				description: "运动",
				items: [
					{ id: "plank_3m", label: "平板支撑三分钟" },
					{ id: "wall_stand_5m", label: "墙角罚站五分钟" }
				]
			},
			active: {
				description: "主动方指令",
				items: [
					{ id: "count_plus_5", label: "数量+5" },
					{ id: "count_plus_10", label: "数量+10" },
					{ id: "count_minus_5", label: "数量-5" },
					{ id: "count_minus_10", label: "数量-10" },
					{ id: "double_count", label: "翻倍" },
					{ id: "half_up", label: "减半(向上取整)" },
					{ id: "choose_posture", label: "指定姿势" },
					{ id: "split_with_rest", label: "分期执行(中间休2分钟)" },
					{ id: "force_rest_5m", label: "强制休息(5分钟)" },
					{ id: "rest_invalid", label: "休息无效" }
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
			localFirst: "本地优先",
			dualSolo: "双人 / 单人"
		},
		hero: {
			subtitle: "规则你定，骰子由命",
			lines: [
				"规则你定，骰子由命",
				"棋盘已就位，就等你开始",
				"看看今天谁最倒霉",
				"棋盘已经摆好，怂的人是小狗",
				"听作者一句，先设置再开局",
				"骰子不会故意欺负你，运气不好就是运气不好"
			]
		},
		installSpotlight: {
			badge: "App",
			dismiss: "不再提示",
			title: "右上角菜单支持安装",
			desc: "右上角固定悬浮菜单里有安装入口。装到桌面后，打开更快，也更像本地 App。",
			action: "立即安装",
			guide: "浏览器建议",
			descCanInstall: "右上角固定悬浮菜单里会出现安装按钮，也可以直接点下面安装。推荐 Android / Windows / macOS 用 Chrome 或 Edge；iPhone / iPad 请用 Safari。",
			descManualInstall: "当前是 Chrome / Edge 这一系浏览器。右上角固定悬浮菜单里的安装按钮会保留；点了如果没弹系统安装窗，就去浏览器菜单里选“安装”，不要选“快捷方式”。",
			descIosSafari: "iPhone / iPad 推荐直接用 Safari。Safari 一般不弹系统安装窗，请用“分享 -> 添加到主屏幕”安装。",
			descUnsupported: "如果右上角固定悬浮菜单里没出现安装按钮，通常是当前浏览器不支持。推荐 Android / Windows / macOS 用 Chrome 或 Edge；iPhone / iPad 用 Safari。",
			actionInstall: "立即安装",
			actionHelp: "查看安装步骤"
		},
		buttons: {
			start: {
				title: "开始游戏",
				desc: "掷下第一颗骰子，今天这局就开了"
			},
			settings: {
				title: "游戏设置",
				desc: "调整项目权重与规则参数、绘制自定义棋盘路径"
			},
			manual: {
				title: "使用须知",
				desc: "查看说明、隐私和使用条款"
			},
			devlog: {
				title: "开发日志",
				desc: "看看我一路踩坑，顺便围观这个东西怎么进化"
			}
		},
		note: "支持自定义棋盘与规则参数，开局前可自由调整。",
		social: {
			handle: "@LiXianYu101",
			quote: "今日觉昨日之浅，明日笑今日之狂",
			line: "今日觉昨日之浅，明日笑今日之狂"
		},
		debug: {
			enabled: "调试模式已开启",
			disabled: "调试模式已关闭"
		},
		installHint: {
			title: "右上角菜单可以安装",
			heading: "安装入口提示",
			body1: "右上角固定悬浮菜单按钮里有安装图标，点一下即可尝试安装。Chrome / Edge 这一系浏览器如果没弹系统安装窗，就去浏览器菜单里选“安装”，不要选“快捷方式”。",
			body2: "如果你在微信、QQ 这类内置浏览器里，建议先用系统浏览器打开，再安装。"
		},
		manualDialog: {
			title: "免责声明与使用条款",
			bodyHtml: "1. 本程序为虚拟娱乐产品，所包含的情节、任务与互动设计均为虚构创作内容，不构成对任何现实行为的倡导或价值导向。<br><br>2. 隐私与数据说明：设置与棋盘等内容默认仅存储于本地浏览器；站点会采集匿名使用行为（如页面访问、功能点击）用于优化体验，不包含可直接识别个人身份的信息。清除浏览器缓存后，本地数据可被删除。<br><br>继续使用本程序即表示您已阅读、理解并同意以上全部条款。",
			accept: "同意并继续",
			reject: "拒绝并退出"
		},
		exit: {
			title: "已终止访问",
			desc: "已经清除页面..."
		},
		boardDialog: {
			title: "选择棋盘",
			tabBuiltin: "官方棋盘",
			tabCustom: "玩家工坊",
			emptyCustom: "还没有自定义棋盘，先去设置页顶部的“创建棋盘”做一个。",
			emptyBuiltin: "暂无官方棋盘",
			customDesc: "本地自定义棋盘",
			size: "{steps}格",
			cancel: "取消选择"
		},
		modeDialog: {
			title: "选择模式",
			soloName: "DIY模式",
			soloDesc: "自己投骰自己执行",
			dualName: "SJ模式",
			dualDesc: "双人都投骰子，每一个格子中都有两人的任务",
			back: "返回重选棋盘"
		},
		onboarding: {
			introTitle: "快速引导",
			introBody: "这是一段首页上手引导，共 4 步。你会依次了解“开始游戏、设置、使用须知、开发日志”。建议先完整看一遍，再开始第一局。",
			startTitle: "开始游戏",
			startBody: "从这里进入游戏主流程。点击后会先弹出“棋盘选择”，再选择“模式（DIY 或 SJ）”。重点建议：先到“游戏设置”完成基础配置再开局，体验会更稳定、更符合你的玩法。",
			settingsTitle: "游戏设置",
			settingsBody: "这里是规则与内容中心。你可以调整任务权重、开关模块、维护自定义内容与棋盘。建议先完成一次基础设置，再回到首页开始游戏，这样每局抽到的内容会更符合你的玩法。",
			dockTitle: "右上角快捷菜单",
			dockBody: "点击这里可以唤出右上角固定悬浮菜单。Chrome / Edge 这一系浏览器里，菜单会保留“安装”图标；如果没弹系统安装窗，就去浏览器菜单里选“安装”，不要选“快捷方式”。iPhone / iPad 则推荐用 Safari。",
			devlogTitle: "开发日志",
			devlogBody: "这里记录版本更新与迭代内容。遇到“和之前不一样”的表现时，先看最近变更说明，通常能快速定位原因。你也可以通过这里判断是否有新功能值得开启。",
			next: "下一步",
			prev: "上一步",
			done: "完成",
			skip: "Skip"
		}
	},
	settings: {
		title: "规则设置",
		backHome: "返回主页",
		createBoards: "创建棋盘",
		tabs: {
			b: "B Module",
			z: "Z Module",
			x: "Extensions"
		},
		rangeLegend: "单次强度区间",
		minCount: "最小数量：",
		maxCount: "最大数量：",
		weightsLegend: "模块权重设置",
		weightsTip: "权重表示各模块在随机生成时的相对占比。权重越高，被选中的概率越大。",
		weightsInteractionTip: "可点击下方图例按钮或直接点击圆环分段来选中模块，再在底部进行调整或启用/禁用。",
		weightProp: "核心模块权重：",
		weightReward: "休息模块权重：",
		weightAod: "位移模块权重：",
		weightSports: "运动模块权重：",
		modulePoolTitle: "执行内容池",
		modulePoolTipHtml: "在下面的 5 个模块概括间切换，只编辑当前内容组。带 <span class=\"plus-badge\">+</span> 的分类支持自定义添加。",
		modulePoolSelectPrompt: "先从上方选择一个模块。",
		modulePoolSummaryMeta: "{enabled}/{total} | {status}",
		modulePoolSummaryGroupAria: "B 模块内容概括",
		modulePoolStatusFull: "全启用",
		modulePoolStatusRich: "较丰富",
		modulePoolStatusLight: "启用较少",
		modulePoolStatusNone: "未启用",
		modulePoolSelectAll: "全选",
		modulePoolSelectNone: "全不选",
		modulePoolInvert: "反选",
		modulePoolEnabledSection: "已启用",
		modulePoolDisabledSection: "未启用",
		modulePoolEnabledEmpty: "当前没有已启用内容。",
		modulePoolDisabledEmpty: "当前没有未启用内容。",
		activeLegend: "Z 模块权重",
		activeTip: "这个权重是给未来“指令也参与随机池”预留的；现在不影响格子显示逻辑。",
		activeWeight: "指令权重：",
		activeWeightDecrease: "降低指令权重",
		activeWeightIncrease: "提高指令权重",
		activePoolTip: "这里先按和 B 模块一致的轻量结构预置未来的指令内容池。",
		uiLegend: "局内 EX 选项",
		uiTip: "控制 game 页面里的任务面板 EX 项，以及棋盘首屏动画，默认都开启。",
		togglePredictionTitle: "B任务预测指标",
		togglePredictionDesc: "显示任务面板里的感叹号按钮，点击后可查看预测与统计。",
		toggleLiveCountTitle: "实时累计实际数量",
		toggleLiveCountDesc: "在任务面板中持续显示本局已累计的实际数量。",
		toggleBoardIntroTitle: "棋盘首屏动画",
		toggleBoardIntroDesc: "进入 game 页面时，先显示整盘浅色格，再快速亮起起点、终点和路径块。",
		dataTransferLegend: "本地数据迁移",
		dataTransferTip: "把当前本地配置和自定义棋盘导出成备份，或导入以前导出的备份，在这台设备上恢复使用。",
		dataTransferButton: "导入 / 导出数据",
		save: "保存设置",
		modalSavedTitle: "设置已保存",
		modalSavedMessage: "你的配置已经成功保存。",
		transferDialogTitle: "本地数据迁移",
		transferTabs: {
			export: "导出",
			import: "导入"
		},
		transferExportTip: "导出内容包含规则设置、B/Z 内容池、EX 选项、自定义棋盘、棋盘草稿、语言和主题。",
		transferImportTip: "你可以直接粘贴备份 JSON，也可以选择本地 `.json` 文件。导入后会覆盖这台设备上的对应本地数据。",
		transferChooseFile: "选择 JSON 文件",
		transferNoFile: "未选择文件",
		transferSelectedFile: "已选择文件：{name}",
		transferImportPlaceholder: "请在这里粘贴备份 JSON",
		transferClear: "清空",
		transferApply: "导入并覆盖",
		transferCopy: "复制 JSON",
		transferDownload: "下载文件",
		transferSummary: "当前备份包含 {groups} 组数据，以及 {boards} 个自定义棋盘。",
		transferExportUnavailable: "当前设置里还有无效数值，修正后才能导出。",
		transferExportErrorTitle: "暂时无法导出",
		transferCopySuccessTitle: "已复制",
		transferCopySuccessMessage: "备份 JSON 已复制到剪贴板。",
		transferCopyError: "复制失败，请手动选中文本后复制。",
		transferDownloadError: "下载失败，请稍后再试。",
		transferImportEmpty: "请先粘贴备份 JSON，或选择一个 JSON 文件。",
		transferImportParseError: "JSON 解析失败，请检查内容格式后重试。",
		transferImportUnsupported: "这个备份里没有识别到可导入的本地数据。",
		transferImportErrorTitle: "导入失败",
		transferImportConfirmTitle: "导入本地数据",
		transferImportConfirmMessage: "这会覆盖当前设备上的 {groups} 组本地数据，确定继续吗？",
		transferImportSuccessTitle: "导入完成",
		transferImportSuccessMessage: "备份已经导入。点击确认后将刷新当前页面并应用新数据。",
		transferFileReadError: "读取所选文件失败。",
		transferImportRangeInvalid: "备份里的次数区间数据无效。",
		transferImportGameDataInvalid: "备份里的 B 模块数据无效。",
		transferImportActiveDataInvalid: "备份里的 Z 模块数据无效。",
		transferImportUiInvalid: "备份里的 EX 设置无效。",
		transferImportBoardsInvalid: "备份里的自定义棋盘数据无效。",
		transferImportDraftInvalid: "备份里的棋盘草稿数据无效。",
		categoryLabels: {
			posture: "姿势",
			prop: "工具",
			reward: "休息",
			aod: "位移",
			sports: "运动",
			active: "指令池（Z）"
		},
		editableMeta: {
			postureTitle: "新增姿势",
			posturePlaceholder: "输入新的姿势",
			propTitle: "新增工具",
			propPlaceholder: "输入新的工具名称",
			rewardTitle: "新增休息",
			rewardPlaceholder: "示例：休息3分钟（纯文本也可以）",
			sportsTitle: "新增运动",
			sportsPlaceholder: "示例：平板支撑3分钟（纯文本也可以）",
			activeTitle: "新增 Z 指令",
			activePlaceholder: "输入新的 Z 指令",
			defaultTitle: "新增内容",
			defaultPlaceholder: "输入新的内容"
		},
		addAria: "新增 {label}",
		deleteAria: "删除 {name}",
		inputConfirm: "确定",
		inputCancel: "取消",
		confirmDeleteTitle: "删除自定义内容",
		confirmDeleteMessage: "确定删除“{name}”吗？",
		emptyContentTitle: "内容不能为空",
		emptyContentMessage: "请输入内容后再确定。",
		duplicateTitle: "内容重复",
		duplicateMessage: "当前分类里已经有相同内容。",
		sportsTip: "提示：支持中英文数字 + 秒/分钟单位（如“平板支撑3分钟”“plank 30s”）会触发倒计时；纯文本也可正常使用。",
		rewardTip: "提示：支持中英文数字 + 秒/分钟单位（如“休息3分钟”“rest 5s”“rest 10min”）会触发倒计时；纯文本也可正常使用。",
		aodTip: "提示：当前“前进1-3格 / 后退1-3格”仅执行位移，不触发落点格子的额外内容。",
		errorTitle: "错误",
		errorMultipleOfTen: "请输入 5~100 之间且为 5 的倍数的数值！",
		errorMinLessThanMax: "最大值至少要比最小值大 5！"
	},
	createBoards: {
		title: "创建棋盘",
		backSettings: "返回设置",
		loadDraft: "载入草稿",
		clear: "清空",
		heroTitle: "创建棋盘",
		heroSubHtml: "即画即成<br>建议从起点一路拖到终点，脑子会清爽很多。",
		canvasTitle: "画布",
		draw: "绘制",
		erase: "擦除",
		tips: [
			"鼠标/手指按住可连续拖拽",
			"别拖太快，可能漏格",
			"路径应上下左右相连",
			"会自动重排编号，不会留洞"
		],
		stats: {
			count: "格子数",
			start: "起点",
			end: "终点",
			status: "路径状态",
			notStarted: "未开始",
			startOnly: "只有起点",
			valid: "合法",
			broken: "断裂 {count} 处"
		},
		cellUnit: "格",
		infoTitle: "棋盘信息",
		boardName: "棋盘名称",
		boardNamePlaceholder: "例如：回旋长廊",
		boardDesc: "棋盘简介",
		boardDescPlaceholder: "例如：中等长度，转角较多",
		demoName: "示例长廊",
		demoDesc: "外圈回游，长度适中",
		fillDemo: "加载示例",
		copyBoard: "复制 board",
		saveLocal: "保存到本地",
		exportTitle: "导出结果",
		exportHelpFormat: "保存格式：`CUSTOM_BOARDS`",
		exportHelpOutput: "导出格式：只吐出 `board` 二维数组，方便你直接塞进 `Data.js`",
		storageTitle: "本地存档",
		savedEmpty: "还没有自定义棋盘。先画一个再说。",
		defaultBoardName: "未命名棋盘",
		defaultBoardDesc: "无简介",
		localCustomBoard: "本地自定义棋盘",
		load: "载入",
		copyCode: "复制代码",
		delete: "删除",
		toasts: {
			cleared: "已清空棋盘",
			demoLoaded: "已加载示例",
			boardCopied: "board 已复制",
			writeNameFirst: "先写个棋盘名称",
			atLeastTwoCells: "至少得有 2 格，不然太抽象了",
			pathBroken: "路径有断裂，先修一修",
			saved: "已保存到本地",
			loaded: "已载入棋盘",
			savedCodeCopied: "已复制已存档棋盘代码",
			copyFailed: "复制失败",
			deleted: "已删除",
			noDraft: "没有草稿",
			draftLoaded: "已载入草稿"
		}
	},
	game: {
		title: "游戏中...",
		roundInitial: "第 1 回合",
		roundSingle: "第 {round} 回合",
		roundDual: "第 {round} 回合{suffix}",
		roundSuffix: "（已投：{done}）",
		taskMasterTitle: "Z任务",
		taskPassiveTitle: "B任务",
		vetoBadge: "一票否决",
		liveCountDefault: "累计 0",
		liveCount: "累计 {count}",
		statsAria: "查看B任务统计",
		statsTitle: "查看统计",
		roll: {
			masterIdle: "Z投",
			passiveIdle: "B投",
			done: "已投",
			single: "投掷"
		},
		prefix: {
			action: "处理",
			rest: "休息",
			move: "移动",
			sports: "运动",
			end: "终点",
			content: "内容"
		},
		typeMap: {
			action: "⛔️ B：处理项",
			rest: "☕️ B：休息项",
			move: "🚶 B：移动",
			sports: "🏃 B：运动项",
			end: "🏁 终点",
			master: "🎲 Z：本格指令",
			hint: "提示"
		},
		bTaskType: {
			action: "处理项",
			rest: "休息",
			move: "位移",
			sports: "运动",
			unknown: "其他"
		},
		noInstruction: "无可用指令",
		noTool: "无可用工具",
		noRest: "无可用休息项",
		noMove: "无可用移动项",
		noSports: "无可用运动项",
		noType: "无可用类型",
		taskApplied: "已对本回合 B 任务应用 Z 指令",
		taskPrefixApplied: "处理：{text}",
		splitExecution: "；分期执行：先 {first}，中间休息2分钟，再 {second}",
		veto: {
			title: "🛡️ 一票否决",
			granted: "已获得一次一票否决权。下次出现休息弹窗时可选择是否使用。",
			detected: "检测到休息弹窗：{text}<br><br>是否使用“一票否决”使本次休息无效？",
			used: "已使用一次一票否决权，本次休息无效。",
			use: "使用",
			keep: "保留"
		},
		forceRest: "强制休息5分钟",
		countdown: {
			sportsTitle: "🏃 B：运动计时",
			restTitle: "☕️ B：强制休息",
			badge: "倒计时结束后自动继续",
			fallback: "未识别到时长，默认倒计时 {seconds} 秒",
			current: "本次倒计时 {value}",
			hint: "支持：3分钟 / 三分钟 / 20min / 45s（仅分钟和秒）",
			minuteUnit: "分钟",
			secondUnit: "秒"
		},
		stats: {
			title: "B任务统计",
			notReady: "棋盘正在初始化，请稍后再试。",
			reachHelpTitle: "预估说明",
			reachMean: "预估可触达格子（均值）",
			reachRange: "预估可触达格子区间（P10-P90）",
			hitsMean: "预估触达总数（均值）",
			hitsRange: "预估触达总数区间（P10-P90）",
			ci95: "估计精度（95% 置信区间）",
			runs: "模拟次数",
			cellsUnit: "{value} 格",
			note: "算法：基于当前棋盘已生成内容，结合位移规则与骰子 1-6 的随机过程进行蒙特卡洛模拟；双人模式下按本局主任务棋盘实际随机出的数量指令动态修正；“触达总数”表示每次落到处理项时对应次数的累计值。",
			estimateHitsTotal: "预估触达总数",
			estimateHelpAria: "查看预估说明",
			estimateHelpTitle: "查看预估说明",
			hitsRangeWithMean: "{low} - {high}（均值 {mean}）"
		},
		cellInfoTitle: "当前格子",
		moveResolveTitle: "🚶 位移判定",
		moveResolveCurrent: "本次{label}",
		moveLabelForward: "前进 {count} 格",
		moveLabelBackward: "后退 {count} 格",
		endGame: {
			title: "🏁 结束",
			totalHits: "本局真实触达总数",
			actionTriggers: "处理项触发次数",
			restartQuestion: "开始新局？",
			confirm: "确定",
			cancel: "取消"
		},
		tips: {
			masterDone: "Z本回合已投",
			passiveDone: "B本回合已投"
		}
	},
	pwa: {
		install: {
			aria: "安装应用",
			title: "安装应用",
			ios: {
				title: "Safari 安装步骤",
				lead: "iPhone / iPad 推荐直接用 Safari。右上角固定悬浮菜单主要服务于支持直接安装的浏览器；iOS 请走 Safari 分享菜单。",
				steps: [
					"如果你现在不在 Safari，请先切到 Safari 打开当前页面",
					"点浏览器底部或顶部的“分享”按钮",
					"在菜单里选择“添加到主屏幕”",
					"确认后就能像本地 App 一样从桌面打开"
				]
			},
			chromium: {
				title: "浏览器菜单安装步骤",
				lead: "这个浏览器支持安装入口。右上角固定悬浮菜单里的安装按钮会保留；如果没有弹出系统安装窗，请改用浏览器菜单里的“安装”，不要选“快捷方式”。",
				steps: [
					"先点站内右上角固定悬浮菜单里的安装按钮试一次",
					"如果没弹系统安装窗，打开浏览器底部或右上角菜单",
					"在菜单里优先选择“安装 / Install app / 添加到桌面”",
					"如果同时看到“快捷方式”，不要选它，优先选“安装”"
				]
			},
			general: {
				title: "安装步骤",
				lead: "如果右上角固定悬浮菜单里已经出现安装图标，优先点那个最省事。没看到的话，再按下面步骤从浏览器菜单安装。",
				steps: [
					"推荐先用 Chrome 或 Edge 打开当前页面",
					"打开浏览器菜单",
					"找到“安装应用 / Install app / 添加到桌面”之类的选项",
					"确认后就能从桌面或开始菜单直接打开"
				]
			},
			ok: "知道了"
		},
		browserAdvice: {
			title: "浏览器建议",
			lead: "想稳定看到安装入口，优先用支持 PWA 的系统浏览器。",
			steps: [
				"Android / Windows / macOS：优先用 Chrome 或 Edge，这一系浏览器会保留站内安装入口",
				"iPhone / iPad：优先用 Safari",
				"微信、QQ、微博等内置浏览器：先用“在浏览器打开”跳到系统浏览器",
				"如果装机入口没出现，先刷新一次页面，再看右上角固定悬浮菜单里有没有安装图标"
			]
		}
	},
	offline: {
		title: "Dual Protocol | Offline",
		badge: "Offline",
		heading: "当前网络不可用",
		body: "应用的核心页面和静态资源已经缓存。你可以回到首页，或者在网络恢复后重新加载获取最新内容。",
		backHome: "返回首页",
		reload: "重新加载",
		list: [
			"已访问过的页面通常仍可继续打开。",
			"首次离线时，第三方 CDN 资源可能不可用。",
			"恢复网络后刷新一次，缓存会自动更新。"
		]
	},
	devlog: {
		title: "Dual Protocol · 开发日志",
		backHome: "返回主页",
		heroTitle: "Dual Protocol 开发日志",
		heroSub: "这页不整官方话术了，直接记我这一路怎么把它从“能玩”折腾到“更像个产品”。很多地方都是边做边改，踩坑不少，但每一版都更顺手一点。",
		milestonesTitle: "重大节点",
		timeline: [
			{
				title: "体验增强：新增棋盘自定义 + 每局预估与实际累计",
				time: "2026 年 3 月下旬",
				desc: "这一版把可玩性和反馈闭环补上了。支持自定义棋盘，同时新增每局预估触达总数与实时/结算实际累计，玩法和数据反馈都更完整。",
				tags: ["自定义棋盘", "局内预估", "实际累计"]
			},
			{
				title: "结构升级：引擎层与规则层开始分家",
				time: "2026 年 2 月下旬 - 3 月上旬",
				desc: "这是技术上最关键的一次重构。把“移动引擎”和“规则触发”拆开以后，代码终于从“能跑”变成“能继续迭代”。",
				tags: ["引擎层", "规则层", "结构分离"]
			},
			{
				title: "决定部署 Pages，尽可能优化敏感文本",
				time: "2026 年 2 月",
				desc: "准备公开部署的时候，文案必须收敛，不然没法往外发。目标很现实：既要保留玩法核心，也得让外部读起来更友好。",
				tags: ["GitHub Pages", "文本调整", "公开部署"]
			},
			{
				title: "设置系统上线：用户体验 ++",
				time: "2025 年下半年",
				desc: "这一步之后它就不只是“我自己能玩”了。设置页上线后，能自己配规则、调权重、改内容，整个项目才真正活起来。",
				tags: ["设置页", "本地存储", "可配置"]
			},
			{
				title: "数据拆分：任务内容开始模块化",
				time: "2025 年中后期",
				desc: "内容多起来之后，页面还好说，数据是真难管。所以把任务池按模块拆开，后面做权重、开关、自定义都省心很多。",
				tags: ["Data.js", "模块化", "可扩展"]
			},
			{
				title: "双核思路：不止内容，还要有流程",
				time: "2025 年上半年",
				desc: "只加条目已经不够用了，流程感才是关键。所以把回合、骰子、移动、位置状态这些都补齐，玩起来才不散。",
				tags: ["回合制", "骰子逻辑", "流程推进"]
			},
			{
				title: "路线成型：决定做固定路线飞行棋",
				time: "2024 年 10 月",
				desc: "这里是第一个大转弯：不做纯文档页了，直接上棋盘路线。从这一步开始，才有“走格子 + 触发事件 + 推进回合”的游戏味。",
				tags: ["固定路线", "棋盘化", "方向确认"]
			},
			{
				title: "最早期原型：规则列表化",
				time: "2024 年中前后",
				desc: "最开始根本不是棋盘，基本就是个“网页版规则手册”。先把内容塞进去、能展开收起、能看明白，算是把骨架先搭起来。",
				tags: ["规则列表", "前端交互", "最初雏形"]
			}
		],
		thanksTitle: "致谢",
		thanksLines: [
			"首先致谢我的女友兼小圈 partner，一路陪我磨细节、提反馈、和我一起实践测试、顶住我开发时思维的反复横跳。",
			"也感谢一位因为 IT 认识、一路做了很多年朋友的老兄。从技术聊到生活，聊到本项目时，甚至还被我硬生生带着了解了一点小圈。",
			"再谢一路帮我试玩和提意见的朋友们，每次“这块不太好”的提醒都很关键。"
		],
		thanksChatgptPrefix: "最后特别谢",
		thanksChatgptBadge: "狂霸酷炫拽 ChatGPT",
		thanksChatgptSuffix: "，高强度陪我改到半夜。",
		toYouTitle: "To You",
		toYouHtml: "能看到这里，真的谢谢你。<br><br>前路漫漫，与君共勉。"
	},
	bottle: {
		title: "Bottle Studio",
		heroTitle: "Bottle Studio",
		backHome: "Home",
		heroSub: "更整洁的瓶子管理面板，风格与棋盘 UI 对齐。",
		inputPlaceholder: "输入名称，用空格 / 换行 / 逗号分隔。例如：喝水 冥想 英语 俯卧撑",
		build: "生成瓶子",
		maxLevel: "最大等级",
		liquid: "液体",
		paletteAria: "液体颜色预设",
		fillAll: "全部 +1",
		resetAll: "全部清零",
		sort: "按等级排序",
		empty: "输入名称后点击“生成瓶子”。",
		noData: "暂无瓶子。请先输入名称并生成。",
		stats: "共 {count} 个瓶子，总进度 {total}/{maxTotal} ({percent}%)",
		flash: {
			maxLevelRange: "最大等级范围：3 - 20",
			enterNames: "请先输入名称",
			generated: "已生成 {count} 个瓶子",
			reset: "已清空全部进度"
		},
		colorAria: "选择液体颜色 {color}"
	}
};
