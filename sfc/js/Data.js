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


const SPANK_COUNT_RANGE = {
    min: 20, 
    max: 50 
};



let GameData = {
    posture: {
        description: '姿势',
        weight: 60,
        items: [
            { name: 'OTK', selected: true },
			{ name: 'OTK(脚离地)', selected: true },
            { name: '平趴', selected: true },
			{ name: '换尿布式', selected: true },
			{ name: 'HEAD AND KNEES', selected: true },
            { name: 'SPANKEE', selected: true },
            { name: '弯腰抱膝', selected: true },
			{ name: '弯腰抱膝(脚离地)', selected: true },
            { name: '站立', selected: true },
            { name: '跪立', selected: true },
            { name: '狗趴式', selected: true },
            { name: '垫脚扶墙', selected: true }
        ]
    },
    prop: {
        description: '道具',
        weight: 80,
        items: [
            { name: '戒尺', selected: true },
            { name: '藤条', selected: true },
            { name: '热熔胶棒', selected: true },
            { name: '木勺', selected: true },
            { name: '皮鞭', selected: true },
            { name: '竹条', selected: true },
            { name: '小绿', selected: true },   
            { name: '小红', selected: true },
            { name: '巴掌', selected: true },
            { name: '数据线', selected: true },
            { name: '皮带', selected: true },
            { name: '猫爪拍', selected: true },
            { name: '树脂棒', selected: true },
            { name: '柳叶鞭', selected: true },
			{ name: '散鞭', selected: true },
			{ name: '硅胶鞭', selected: true }

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
            { name: '免罚一轮', selected: true },
            { name: '免罚两轮', selected: true }
        ]
    },
    aod: {
        description: '特殊移动',
        weight: 5,
        items: [
            { name: '直达终点', selected: true },
            { name: '回到起点', selected: true }
        ]
    },
    sports: {
        description: '额外运动',
        weight: 10,
        items: [
            { name: '跪立五分钟', selected: true },
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
        { name: '下一项减半', selected: true },
        { name: '重复上一轮z指令', selected: true },
        { name: '换道具', selected: true },
        { name: '换体位', selected: true },
        { name: '指定道具', selected: true },
        { name: '指定体位', selected: true },
        { name: '分期执行(中间休2分钟)', selected: true },
        { name: '连击两轮(只重抽数量)', selected: true },
        { name: '无效保护(休息无效重抽)', selected: true },
        { name: '强制休息(5分钟/揉2分钟)', selected: true },
        { name: '罚站/罚跪追加5分钟', selected: true },
        { name: '奖励加码(抱抱/揉+1分钟)', selected: true },
        { name: '情绪校准(喝水/深呼吸/拥抱30秒)', selected: true }
    ]
};