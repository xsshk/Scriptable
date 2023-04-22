// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: mobile-alt;
/**
* Author:LSP
* Date:2023-04-20
*/
// -------------------------------------------------------
// 是否是开发环境，配合手机端调试使用，正式发布设置为false
const isDev = false;
const dependencyLSP = '20230420';
console.log(`当前环境 👉👉👉👉👉 ${isDev ? 'DEV' : 'RELEASE'}`);
console.log(`----------------------------------------`);
// 分支
const branch = 'v2';
// 仓库根目录
const remoteRoot = `https://raw.githubusercontent.com/xsshk/Scriptable/${branch}`;
// 依赖包目录
const fm = FileManager.local();
const rootDir = fm.documentsDirectory();
const cacheDir = fm.joinPath(rootDir, 'LSP');
const dependencyFileName = isDev ? "_LSP.js" : `${cacheDir}/_LSP.js`;
// 下载依赖包
await downloadLSPDependency();
// -------------------------------------------------------
if (typeof require === 'undefined') require = importModule
// 引入相关方法
const { BaseWidget } = require(dependencyFileName);

// @定义小组件
class Widget extends BaseWidget {

	defaultPreference = {
		fetchUrl: {
			// 流量API请求地址
			detail: `https://m.client.10010.com/servicequerybusiness/operationservice/queryOcsPackageFlowLeftContentRevisedInJune`
			// detail: `https://m.client.10010.com/mobileserviceimportant/home/queryUserInfoSeven?version=iphone_c@10.0100&desmobiel=********&showType=0`,
		},
		// 初始化插件字体
		titleDayColor: '#000000',
		titleNightColor: '#000000',
		descDayColor: '#000000',
		descNightColor: '#000000',
		refreshTimeDayColor: '#000000',
		refreshTimeNightColor: '#000000',
	};

	// fee = {
	// 	title: '📱 剩余话费：',
	// 	balance: 0,
	// 	unit: '元',
	// };

	// voice = {
	// 	title: '⏳ 剩余语音：',
	// 	balance: 0,
	// 	percent: 0,
	// 	unit: '分钟',
	// };


	privateFreeFlow = {
		title: '🆓 定向流量：',
		balance: 0,
		percent: 0,
		unit: 'MB',
	};

	usedflow = {
		title: '📶 正常流量：',
		balance: 0,
		percent: 0,
		unit: 'MB',
	};

	publicFreeFlow = {
		title: '🏧 公免流量：',
		balance: 0,
		percent: 0,
		unit: 'MB',
	};



	

	
	// 读取组件配置
	getValueByKey = (key) => this.readWidgetSetting()[key] ?? '';
	// 配置颜色
	titleDayColor = () => this.getValueByKey('titleDayColor');
	titleNightColor = () => this.getValueByKey('titleNightColor');

	descDayColor = () => this.getValueByKey('descDayColor');
	descNightColor = () => this.getValueByKey('descNightColor');

	refreshTimeDayColor = () => this.getValueByKey('refreshTimeDayColor');
	refreshTimeNightColor = () => this.getValueByKey('refreshTimeNightColor');

	constructor(scriptName) {
		super(scriptName);
		this.reset = false;
		this.defaultConfig.bgType = '3';
		this.backgroundColor = '#FEFCF3,#0A2647';
		this.cookie = this.getValueByKey('cookie');
	}

	async getAppViewOptions() {
		return {
			widgetProvider: {
				small: true, // 是否提供小号组件
				medium: false, // 是否提供中号组件
				large: false, // 是否提供大号组件
			},
			// 预览界面的组件设置item
			settingItems: [
				// 联通Cookie
				{
					name: 'chinaUnicomCK',
					label: '联通Cookie',
					type: 'cell',
					icon: `${remoteRoot}/img/icon_10010.png`,
					needLoading: true,
					desc: this.getValueByKey('cookie')?.length > 0 ? '已填写' : '未填写'
				},
				{
					name: 'otherSetting',
					label: '组件字体颜色设置',
					type: 'cell',
					icon: `${remoteRoot}/img/setting.gif`,
					needLoading: true,
					childItems: [
						{
							items: [
								{
									name: 'titleDayColor',
									label: '标题浅色颜色',
									type: 'color',
									icon: { name: 'pencil.and.outline', color: '#3a86ff', },
									needLoading: false,
									default: this.titleDayColor(),
								},
								{
									name: 'titleNightColor',
									label: '标题深色颜色',
									type: 'color',
									icon: { name: 'square.and.pencil', color: '#3a0ca3', },
									needLoading: false,
									default: this.titleNightColor(),
								},
							],
						},
						{
							items: [
								{
									name: 'descDayColor',
									label: '内容浅色颜色',
									type: 'color',
									icon: { name: 'pencil.and.outline', color: '#3a86ff', },
									needLoading: false,
									default: this.descDayColor(),
								},
								{
									name: 'descNightColor',
									label: '内容深色颜色',
									type: 'color',
									icon: { name: 'square.and.pencil', color: '#3a0ca3', },
									needLoading: false,
									default: this.descNightColor(),
								},
							],
						},
						{
							items: [
								{
									name: 'refreshTimeDayColor',
									label: '刷新时间浅色颜色',
									type: 'color',
									icon: { name: 'pencil.and.outline', color: '#3a86ff', },
									needLoading: false,
									default: this.refreshTimeDayColor(),
								},
								{
									name: 'refreshTimeNightColor',
									label: '刷新时间深色颜色',
									type: 'color',
									icon: { name: 'square.and.pencil', color: '#3a0ca3', },
									needLoading: false,
									default: this.refreshTimeNightColor(),
								},
							],
						},
					]
				},
			],
			// cell类型的item点击回调
			onItemClick: async (item) => {
				const widgetSetting = this.readWidgetSetting();
				let insertDesc = widgetSetting.phone?.length > 0 && widgetSetting.cookie?.length > 0 ? '已填写' : '未填写';
				switch (item.name) {
					case 'chinaUnicomCK':
						let phone;
						let ck;
						await this.generateInputAlert({
							title: '登录信息填写',
							message: '自己抓取联通客户端app的Cookie填入',
							options: [
								{ hint: '请输入联通号码', value: widgetSetting?.phone ?? '' },
								{ hint: '请输入Cookie', value: widgetSetting?.cookie ?? '' },
							]
						}, async (inputArr) => {
							this.reset = true;
							phone = inputArr[0].value;
							ck = inputArr[1].value;
							// 保存配置
							widgetSetting['phone'] = phone;
							widgetSetting['cookie'] = ck;
						});
						// 设置为组件Cookie
						this.cookie = widgetSetting.cookie;
						// 如果有组件内容和Cookie就已填写
						insertDesc = widgetSetting.phone?.length > 0 && widgetSetting.cookie?.length > 0 ? '已填写' : '未填写';
						// 写入到设置里
						this.writeWidgetSetting({ ...widgetSetting });
						break;
				}
				return {
					desc: { value: insertDesc },
				};
			},
		};
	}

	async render() {
		return await this.provideSmallWidget();
	}

	async provideSmallWidget() {
		// ========================================
		await this.loadDetailInfo();
		// ========================================
		const widget = new ListWidget();
		widget.setPadding(0, 0, 0, 0);
		// ========================================
		const widgetSize = this.getWidgetSize('小号');
		let stack = widget.addStack();
		stack.setPadding(4, 12, 0, 12);
		// 删除背景图片
		let image = await this.getImageByUrl(`${remoteRoot}/img/bg_doraemon_1.png`);
		stack.backgroundImage = image;
		stack.size = new Size(widgetSize.width, widgetSize.height);
		stack.layoutVertically();
		stack.addSpacer();
		// ========================================
		// 组件文字title 细体13号
		const titleFont = Font.lightSystemFont(13);
		// 组件文字Info 正常体16号
		const infoFont = Font.mediumSystemFont(16);
		// 关于背景颜色的七七七八八
		const titleTextColor = Color.dynamic(new Color(this.titleDayColor()), new Color(this.titleNightColor()));
		const descTextColor = Color.dynamic(new Color(this.descDayColor()), new Color(this.descNightColor()));
		const refreshTimeTextColor = Color.dynamic(new Color(this.refreshTimeDayColor()), new Color(this.refreshTimeNightColor()));
		const descSpacer = 3;
		const lineSpacer = 4;
		const descLeftSpacer = 22;

		// 示例使用流量
		// ========================================
		let textSpan = stack.addText(`${this.usedflow.title}`);
		textSpan.textColor = titleTextColor
		textSpan.font = titleFont;
		stack.addSpacer(descSpacer);
		let displayStack = stack.addStack();
		displayStack.centerAlignContent();
		displayStack.addSpacer(descLeftSpacer);
		textSpan = displayStack.addText(`${this.usedflow.balance}${this.usedflow.unit}`);
		textSpan.textColor = descTextColor
		textSpan.font = infoFont
		displayStack.addSpacer();

		// 走包内免流 指定向包的
		// ========================================
		stack.addSpacer(lineSpacer);
		textSpan = stack.addText(`${this.privateFreeFlow.title}`);
		textSpan.textColor = titleTextColor
		textSpan.font = titleFont;
		stack.addSpacer(descSpacer);
		displayStack = stack.addStack();
		displayStack.centerAlignContent();
		displayStack.addSpacer(descLeftSpacer);
		textSpan = displayStack.addText(`${this.privateFreeFlow.balance}${this.privateFreeFlow.unit}`);
		textSpan.textColor = descTextColor
		textSpan.font = infoFont
		displayStack.addSpacer();

		// 走公域免流 指掌厅/彩铃/手机电视的免流
		// ========================================
		stack.addSpacer(lineSpacer);
		textSpan = stack.addText(`${this.publicFreeFlow.title}`);
		textSpan.textColor = titleTextColor
		textSpan.font = titleFont;
		stack.addSpacer(descSpacer);
		displayStack = stack.addStack();
		displayStack.centerAlignContent();
		displayStack.addSpacer(descLeftSpacer);
		textSpan = displayStack.addText(`${this.publicFreeFlow.balance}${this.publicFreeFlow.unit}`);
		textSpan.textColor = descTextColor
		textSpan.font = infoFont
		displayStack.addSpacer();
		// ========================================

		// 最下侧刷新时间与联通角标
		// ========================================
		stack.addSpacer(6);
		let btStack = stack.addStack();
		btStack.centerAlignContent();
		btStack.addSpacer(6);
		image = this.getSFSymbol('goforward');
		let imgSpan = btStack.addImage(image);
		imgSpan.imageSize = new Size(9, 9);
		imgSpan.tintColor = refreshTimeTextColor
		btStack.addSpacer(4);
		if (this.success) {
			this.lastUpdate = this.getDateStr(new Date(), 'HH:mm');
		}
		textSpan = btStack.addText(`${this.getDateStr(new Date(), 'HH:mm')}`);
		textSpan.textColor = refreshTimeTextColor
		textSpan.font = Font.lightSystemFont(10);
		btStack.addSpacer();
		// 设置联通角标,大小14*14
		image = await this.getImageByUrl(`${remoteRoot}/img/ic_logo_10010.png`);
		imgSpan = btStack.addImage(image);
		imgSpan.imageSize = new Size(14, 14);
		stack.addSpacer();
		//=================================
		return widget;
	}

	// --------------------------NET START--------------------------
	/**
	 * 流量格式化
	 * @param {*} flow 
	 * @returns 
	 */
	formatFlow = (flow) => {
		// 重构,支持最大TB级别

		// 流量达到TB级别,解锁尊贵的3位小数点显示
		if (flow/1048576 >= 1){
			return { num: (flow / 1048576).toFixed(3), unit: 'TB' };
		}
		// GB级别
		if (flow/1024 >= 1) {
			return { num: (flow / 1024).toFixed(2), unit: 'GB' };
		}
		
		// MB
		return { num: (flow / 1).toFixed(2), unit: 'MB' };
	}

	/**
	 * 加载明细
	 * @returns 
	 */
	loadDetailInfo = async () => {
		this.httpGet.logable = true;
		const response = await this.httpGet(
			this.defaultPreference.fetchUrl.detail,
			{
				useCache: this.reset ?? false,
				dataSuccess: (res) => res.code == '0000',
				headers: {
					'Host': 'm.client.10010.com',
					'User-Agent': 'ChinaUnicom.x CFNetwork iOS/16.3 unicom{version:iphone_c@10.0100}',
					'cookie': this.cookie,
				}
			}
		);
		if (response?.code == '0000') {
			// 取结果中的这些字段
			// const { feeResource, voiceResource, flowResource } = response;
			const {packageName,summary,MlResources} = response
			
			// 公免流量
			let publicFreeFlowFormat = this.formatFlow(MlResources.userResource)
			this.publicFreeFlow.balance = publicFreeFlowFormat.num
			this.publicFreeFlow.unit = publicFreeFlowFormat.unit
			// 私免流量
			let privateFreeFlowNum= summary.freeFlow - MlResources.userResource
			let privateFreeFlowFormat = this.formatFlow(privateFreeFlowNum)
			this.privateFreeFlow.balance = privateFreeFlowFormat.num
			this.privateFreeFlow.unit = privateFreeFlowFormat.unit
			// 已用流量
			let usedflowFlowNum = summary.sum - summary.freeFlow
			let usedflowFormat = this.formatFlow(usedflowFlowNum)
			this.usedflow.balance = usedflowFormat.num
			this.usedflow.unit = usedflowFormat.unit
			

			console.log(`正常流量：`);
			console.log(JSON.stringify(this.usedflow, null, 2));
			console.log(`包免流量：`);
			console.log(JSON.stringify(this.privateFreeFlow, null, 2));
			console.log(`公免流量：`);
			console.log(JSON.stringify(this.publicFreeFlow, null, 2));
		} else {
			// Cookie失效通知
			this.notify('联通小组件', `Cookie失效了~`);
		}
	}

	// --------------------------NET END--------------------------
}

await new Widget(Script.name()).run();


// =================================================================================
// =================================================================================
async function downloadLSPDependency() {
	let fm = FileManager.local();
	const dependencyURL = `${remoteRoot}/_LSP.js`;
	const update = needUpdateDependency();
	if (isDev) {
		const iCloudPath = FileManager.iCloud().documentsDirectory();
		const localIcloudDependencyExit = fm.isFileStoredIniCloud(`${iCloudPath}/_LSP.js`);
		const localDependencyExit = fm.fileExists(`${rootDir}/_LSP.js`);
		const fileExist = localIcloudDependencyExit || localDependencyExit;
		console.log(`🚀 DEV开发依赖文件${fileExist ? '已存在 ✅' : '不存在 🚫'}`);
		if (!fileExist || update) {
			console.log(`🤖 DEV 开始${update ? '更新' + dependencyLSP : '下载'}依赖~`);
			keySave('VERSION', dependencyLSP);
			await downloadFile2Scriptable('_LSP', dependencyURL);
		}
		return
	}

	//////////////////////////////////////////////////////////
	console.log(`----------------------------------------`);
	const remoteDependencyExit = fm.fileExists(`${cacheDir}/_LSP.js`);
	console.log(`🚀 RELEASE依赖文件${remoteDependencyExit ? '已存在 ✅' : '不存在 🚫'}`);
	// ------------------------------
	if (!remoteDependencyExit || update) { // 下载依赖
		// 创建根目录
		if (!fm.fileExists(cacheDir)) {
			fm.createDirectory(cacheDir, true);
		}
		// 下载
		console.log(`🤖 RELEASE开始${update ? '更新' : '下载'}依赖~`);
		console.log(`----------------------------------------`);
		const req = new Request(dependencyURL);
		const moduleJs = await req.load();
		if (moduleJs) {
			fm.write(fm.joinPath(cacheDir, '/_LSP.js'), moduleJs);
			keySave('VERSION', dependencyLSP);
			console.log('✅ LSP远程依赖环境下载成功！');
			console.log(`----------------------------------------`);
		} else {
			console.error('🚫 获取依赖环境脚本失败，请重试！');
			console.log(`----------------------------------------`);
		}
	}
}

/**
 * 获取保存的文件名
 * @param {*} fileName 
 * @returns 
 */
function getSaveFileName(fileName) {
	const hasSuffix = fileName.lastIndexOf(".") + 1;
	return !hasSuffix ? `${fileName}.js` : fileName;
};

/**
 * 保存文件到Scriptable软件目录，app可看到
 * @param {*} fileName 
 * @param {*} content 
 * @returns 
 */
function saveFile2Scriptable(fileName, content) {
	try {
		const fm = FileManager.iCloud();
		let fileSimpleName = getSaveFileName(fileName);
		const filePath = fm.joinPath(fm.documentsDirectory(), fileSimpleName);
		fm.writeString(filePath, content);
		return true;
	} catch (error) {
		return false;
	}
};

/**
 * 下载js文件到Scriptable软件目录
 * @param {*} moduleName 名称 
 * @param {*} url 在线地址 
 * @returns 
 */
async function downloadFile2Scriptable(moduleName, url) {
	const req = new Request(url);
	const content = await req.loadString();
	return saveFile2Scriptable(`${moduleName}`, content);
};

/**
 * 是否需要更新依赖版本
 */
function needUpdateDependency() {
	return dependencyLSP != keyGet('VERSION');
};

function keySave(cacheKey, cache) {
	if (cache) {
		Keychain.set(Script.name() + cacheKey, cache);
	}
}

function keyGet(cacheKey, defaultValue = '') {
	if (Keychain.contains(Script.name() + cacheKey)) {
		return Keychain.get(Script.name() + cacheKey);
	} else {
		return defaultValue;
	}
}
// =================================================================================
// =================================================================================
