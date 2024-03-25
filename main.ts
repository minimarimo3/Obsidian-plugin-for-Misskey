import {Plugin, Notice, RequestUrlParam, requestUrl, PluginSettingTab, Setting, App, TFile} from "obsidian";

import i18n from 'i18next';

import enTranslation from './locales/en.json';
import jaTranslation from './locales/ja.json';


interface MisskeyPluginSettings {
	selectedAccount: number;
	language: "ja" | "en";
	accounts:
		{
			memo: string,
			domain: string
			prevText: string,
			postText: string,
			isFileNameHidden: boolean,
			visibility: "public" | "home" | "followers",
			uploadAllowedList: string[],
			embedFormat: "markdown" | "html",
			accountToken: string | null
		}[]
}

const DEFAULT_SETTINGS: Partial<MisskeyPluginSettings> = {
	selectedAccount: 0,
	language: "ja",
	accounts: [
		// ファイル名はObsidianに埋め込み可能なフォーマット(https://publish.obsidian.md/help-ja/%E3%82%AC%E3%82%A4%E3%83%89/%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E5%9F%8B%E3%82%81%E8%BE%BC%E3%82%80)からPDFを省いたもの
		{memo: "", domain: "", prevText: "", postText: "", isFileNameHidden: false, visibility: "public", uploadAllowedList:["png", "jpg", "jpeg", "gif", "bmp", "svg", "mp3", "webm", "wav", "m4a", "ogg", "3gp", "flac", "mp4", "webm", "ogv"], embedFormat: "html", accountToken: null},
		{memo: "", domain: "", prevText: "", postText: "", isFileNameHidden: false, visibility: "public", uploadAllowedList:["png", "jpg", "jpeg", "gif", "bmp", "svg", "mp3", "webm", "wav", "m4a", "ogg", "3gp", "flac", "mp4", "webm", "ogv"], embedFormat: "html", accountToken: null},
		{memo: "", domain: "", prevText: "", postText: "", isFileNameHidden: false, visibility: "public", uploadAllowedList:["png", "jpg", "jpeg", "gif", "bmp", "svg", "mp3", "webm", "wav", "m4a", "ogg", "3gp", "flac", "mp4", "webm", "ogv"], embedFormat: "html", accountToken: null},
		{memo: "", domain: "", prevText: "", postText: "", isFileNameHidden: false, visibility: "public", uploadAllowedList:["png", "jpg", "jpeg", "gif", "bmp", "svg", "mp3", "webm", "wav", "m4a", "ogg", "3gp", "flac", "mp4", "webm", "ogv"], embedFormat: "html", accountToken: null},
		{memo: "", domain: "", prevText: "", postText: "", isFileNameHidden: false, visibility: "public", uploadAllowedList:["png", "jpg", "jpeg", "gif", "bmp", "svg", "mp3", "webm", "wav", "m4a", "ogg", "3gp", "flac", "mp4", "webm", "ogv"], embedFormat: "html", accountToken: null},
	]
}


export class MisskeyPluginSettingsTab extends PluginSettingTab {
	plugin: MisskeyPlugin;

	constructor(app: App, plugin: MisskeyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const selectedAccount = this.plugin.settings.selectedAccount;

		new Setting(containerEl)
			.setName("Language")
			.addDropdown(dropdown => dropdown
				.addOptions(
					{
						"ja": "日本語",
						"en": "English"
					},
				).onChange(
					async (value) => {
						if (value !== "ja" && value !== "en"){
							new Notice("ValueError: " + value + " is not a valid value.")
							return;
						}
						this.plugin.settings.language = value;
						await this.plugin.saveSettings();
						await i18n.changeLanguage(value);
						this.display();
					}
				).setValue(
					`${this.plugin.settings.language}`
				)
			);

		new Setting(containerEl)
			.setName(i18n.t("selectAccount.name"))
			.setDesc(i18n.t("selectAccount.desc"))
			.addDropdown(dropdown => dropdown
				.addOptions(
					{
						0: i18n.t("account") + "1",
						1: i18n.t("account") + "2",
						2: i18n.t("account") + "3",
						3: i18n.t("account") + "4",
						4: i18n.t("account") + "5"
					},
				).onChange(
					async (value) => {
						this.plugin.settings.selectedAccount = parseInt(value);
						await this.plugin.saveSettings();
						this.display();
					}
				).setValue(
					`${selectedAccount}`
				)
			);
		generateAccountSettings(selectedAccount, this.plugin);

		/**
		 * 個々のアカウントの設定を生成する
		 * @param selectedAccount 選択されたアカウント
		 * @param plugin 設定を保存するプラグイン
		 */
		function generateAccountSettings(selectedAccount: number, plugin: MisskeyPlugin){
			const selectedAccountSetting = plugin.settings.accounts[selectedAccount];
			new Setting(containerEl)
				.setHeading()
				.setName(i18n.t("account") + `${selectedAccount + 1}`)

			new Setting(containerEl)
				.setName(i18n.t("memo.name"))
				.setDesc(i18n.t("memo.desc"))
				.addTextArea(text => text
					.setPlaceholder(i18n.t("memo.placeholder"))
					.setValue(selectedAccountSetting.memo)
					.onChange(async (value) => {
						selectedAccountSetting.memo = value;
						await plugin.saveSettings();
					}));
			new Setting(containerEl)
				.setName(i18n.t("domain.name"))
				.setDesc(i18n.t("domain.desc"))
				.addText(text => text
					.setPlaceholder(i18n.t("domain.placeholder"))
					.setValue(selectedAccountSetting.domain)
					.onChange(async (value) => {
						selectedAccountSetting.domain = value;
						await plugin.saveSettings();
					}));
			new Setting(containerEl)
				.setName(i18n.t("prevText.name"))
				.setDesc(i18n.t("prevText.desc"))
				.addTextArea(text => text
					.setPlaceholder(i18n.t("prevText.placeholder"))
					.setValue(selectedAccountSetting.prevText)
					.onChange(async (value) => {
						selectedAccountSetting.prevText = value;
						await plugin.saveSettings();
					}));
			new Setting(containerEl)
				.setName(i18n.t("postText.name"))
				.setDesc(i18n.t("postText.desc"))
				.addTextArea(text => text
					.setPlaceholder(i18n.t("postText.placeholder"))
					.setValue(selectedAccountSetting.postText)
					.onChange(async (value) => {
						selectedAccountSetting.postText = value;
						await plugin.saveSettings();
					}));

			// 俺にはこれが必要なのか分からないけどMisskeyプラグインがあるので作っておく
			// プラグイン: https://misskey.io/notes/9d7mdepqx3
			new Setting(containerEl)
				.setName(i18n.t("isFileNameHidden.name"))
				.setDesc(i18n.t("isFileNameHidden.desc"))
				.addToggle(toggle => toggle
					.setValue(selectedAccountSetting.isFileNameHidden)
					.onChange(async (value) => {
						selectedAccountSetting.isFileNameHidden = value;
						await plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName(i18n.t("visibility.name"))
				.setDesc(i18n.t("visibility.desc"))
				.addDropdown(dropdown => dropdown
					.addOptions(
						{
							"public": "public",
							"home": "home",
							"followers": "followers"
						},
					).onChange(
						async (value) => {
							if (value !== "public" && value !== "home" && value !== "followers"){
								new Notice(i18n.t("visibility.valueError"))
								return;
							}
							selectedAccountSetting.visibility = value;
							await plugin.saveSettings();
						}
					).setValue(
						selectedAccountSetting.visibility
					)
				);

			new Setting(containerEl)
				.setName(i18n.t("uploadAllowedList.name"))
				.setDesc(i18n.t("uploadAllowedList.desc"))
				.addTextArea(text => text
					.setPlaceholder(i18n.t("uploadAllowedList.placeholder"))
					.setValue(
						selectedAccountSetting.uploadAllowedList.length === 0 ?
							"" : selectedAccountSetting.uploadAllowedList.join(", ")
					)
					.onChange(async (value) => {
						selectedAccountSetting.uploadAllowedList = value.split(",").map((item) => item.trim());
						await plugin.saveSettings();
					}));

			new Setting(containerEl)
				.setName(i18n.t("embedFormat.name"))
				.setDesc(i18n.t("embedFormat.desc"))
				.addDropdown(dropdown => dropdown
					.addOptions(
						{
							"markdown": "Markdown",
							"html": "HTML"
						},
					).onChange(
						async (value) => {
							if (value !== "markdown" && value !== "html"){
								new Notice(i18n.t("embedFormat.valueError"))
								return;
							}
							selectedAccountSetting.embedFormat = value;
							await plugin.saveSettings();
						}
					).setValue(
						selectedAccountSetting.embedFormat
					)
				);

			new Setting(containerEl)
				.setName(i18n.t("tokenSetting.name"))
				.setDesc(i18n.t("tokenSetting.desc"))
				.addButton(button => button
					.setButtonText(i18n.t("tokenSetting.buttonText"))
					.onClick(async () => {
						// MiAuthを使用してアクセストークンを取得します
						const domain = selectedAccountSetting.domain;

						if (domain === "") {
							new Notice(i18n.t("tokenSetting.domainNotSet"))
							return;
						}

						// MiAuthのセッションIDを生成
						const array = new Uint8Array(32);
						window.crypto.getRandomValues(array);
						const sessionId = Array.from(array, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');

						const appName = "obsidian-plugin-for-misskey"
						const iconURL = "https://raw.githubusercontent.com/minimarimo3/Obsidian-plugin-for-Misskey/master/documents/icon_ki.png"
						const authURL = `https://${domain}/miauth/${sessionId}?name=${appName}&icon=${iconURL}&permission=write:notes,write:drive`
						const checkURL = `https://${domain}/api/miauth/${sessionId}/check`

						window.open(`${authURL}`)
						let intervalCount = 0;
						const maxIntervalCount = 60 * 2 / 5;
						const intervalId = setInterval(async () => {
							if (intervalCount >= maxIntervalCount) {
								clearInterval(intervalId);
								new Notice(i18n.t("tokenSetting.timeOut"))
								return;
							}
							// FIXME: テスト
							const data = await requestUrl({
								"url": checkURL,
								"method": "POST"
							}).then((response) => response.json).catch((error) => {
								new Notice(error);
								clearInterval(intervalId);
							})
							if (data.ok) {
								new Notice(i18n.t("tokenSetting.tokenSettingsComplete"))
								clearInterval(intervalId);
								selectedAccountSetting.accountToken = data.token;
								await plugin.saveSettings();
							}
							intervalCount++;
						}, 5000)
					}));
		}
	}
}


/**
 * - 現在のカーソルにある文章とメディアをMisskeyへ投稿するコマンド(`Misskeyへ現在の行を投稿する`)
 * - Misskeyのノートを引用形式で埋め込めるコマンド(`Misskeyのノート(note)を埋め込む`)
 */
export default class MisskeyPlugin extends Plugin {
	settings: MisskeyPluginSettings;

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * noteから画像をアップロードし、その画像のIDを返す
	 * @param note 投稿内容
	 * @private
	 */
	private async uploadFileToMisskey(note: string): Promise<string[]> {
		// ![[path]]をすべて検索する
		const matches = note.matchAll(/!\[\[(.*?)]]/g);

		const imageIDList: string[] = [];

		await Promise.all(Array.from(matches).map(async match => {
			// data:やhttp(s)://で始まるURLはアップロードしない
			// 別にdataはサポートしてもよさそうだけど使ってる人いるかな。リクエスト来るまではとりあえず無効にしとく
			const fileName = match[1];
			if (/^(data:|https?:\/\/)/.test(fileName)) {
				return
			}
			const selectedAccount = this.settings.accounts[this.settings.selectedAccount];

			let targetFile = null; // 探しているファイルへの参照を保持するための変数

			// もし![[fileName]]がファイルパスそのものをさしていた場合
			const file = this.app.vault.getAbstractFileByPath(fileName);
			if (file instanceof TFile) {
				targetFile = file;
			} else {
				// NOTE: Avoid iterating all files to find a file by its path
				//  https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Avoid+iterating+all+files+to+find+a+file+by+its+path
				//  pathからファイルを探すならこの方法は避けるように書いてある。ただ`![[filePath]]`記法があった時に、ファイルはディレクトリの下にあるがfilePathはフルパスでない場合がある。
				//  そのため、`filePath`がファイルの場所を直接指していない場合、この方法でしかファイルを探せないと自分は理解している。
				for (const file of this.app.vault.getFiles()) {
					if (file.name === fileName) {
						targetFile = file;
						break;
					}
				}
				if (targetFile === null) {
					new Notice(i18n.t("fileNotFound") + fileName);
					return;
				}
			}

			// ファイルの拡張子を取得
			const extension = targetFile.extension;
			// アップロードが許可されている拡張子かチェック
			if (!selectedAccount.uploadAllowedList.includes(extension)) {
				new Notice(i18n.t("thisFileTypeIsNotAllowed") + fileName);
				return;
			}

			// ファイルを読み込んで、Misskeyにアップロードする
			new Notice(i18n.t("uploadingImage"))
			const fileContent = await this.app.vault.readBinary(targetFile);
			const domain = selectedAccount.domain;
			const token = selectedAccount.accountToken;
			if (token === null) {
				new Notice("アクセストークンが設定されていません。設定画面から設定してください。");
				return;
			}

			const blob = new Blob([fileContent], {type: "application/octet-stream"});
			const formData = new FormData();
			formData.append('i', token);
			formData.append('file', blob, selectedAccount.isFileNameHidden ? fileName : new Date().toISOString());

			// 画像をアップロード
			try{
				const data = await (await fetch(`https://${domain}/api/drive/files/create`, {
					method: "POST",
					body: formData
				})).json();
				new Notice(data.error ? ("Error:" + data.error.message) : ("画像をアップロードしました。"));
				imageIDList.push(data.id);
			} catch (error) {
				new Notice(i18n.t("imageCannotBeUploaded") + error);
				return;
			}
		}));

		return imageIDList;
	}

	/**
	 * Misskeyへノートを投稿する。
	 * @param note 投稿内容
	 * @param noteVisibility 投稿の公開範囲。ただし"specified"はサポートしない
	 * @param fileIds 添付ファイルのドライブにあるID。省略可能
	 * @private
	 */
	private async postToMisskey(note: string, noteVisibility: "public" | "home" | "followers",
								fileIds: string[] = []): Promise<void> {
		const domain = this.settings.accounts[this.settings.selectedAccount].domain;
		const token = this.settings.accounts[this.settings.selectedAccount].accountToken;
		if (token === null) {
			new Notice("アクセストークンが設定されていません。設定画面から設定してください。");
			return;
		}

		// 投稿の前部分と後部分を取得
		const prevText = this.settings.accounts[this.settings.selectedAccount].prevText;
		const postText = this.settings.accounts[this.settings.selectedAccount].postText;
		let bodyObject: object = {
			i: token,
			text: prevText.replace("\\n", "\n") + note + postText.replace("\\n", "\n"),
			visibility: noteVisibility
		};

		// fileIdsに空配列を渡すとエラーが出るので、空の場合は省略
		if (fileIds.length > 0) {
			bodyObject = {
				...bodyObject,
				fileIds: fileIds
			}
		}

		const urlParams: RequestUrlParam = {
			"url": `https://${domain}/api/notes/create`,
			"method": "POST",
			"headers": {
				"Content-Type": "application/json"
			},
			"body": JSON.stringify(bodyObject)
		};

		try {
			const data = (await requestUrl(urlParams)).json;
			new Notice(data.error ? ("Error:" + data.error.message) : ("ノートを送信しました。"));
			return data;
		} catch (error) {
			new Notice(i18n.t("noteCannotBeSend") + error);
		}
	}

	/**
	 * Misskeyのノートを取得し、引用形式で返す
	 * @param urls ノートのURL。複数指定可能
	 */
	private async quoteFromMisskeyNote(urls: string[] | string): Promise<string[][]> {
		const embedFormat = this.settings.accounts[this.settings.selectedAccount].embedFormat;
		if (typeof urls === "string") {
			urls = [urls];
		}

		const notes: string[][] = [];
		for (const url of urls) {
			// URLの形式が正しいかチェック
			const regex = /https?:\/\/([a-zA-Z0-9.-]+)\/notes\/([a-zA-Z0-9]+)(?=[^a-zA-Z0-9]|$)/g;
			let match;
			if ((match = regex.exec(url)) === null) {
				new Notice(i18n.t("urlIsNotCorrect") + url);
				continue;
			}
			const misskeyDomain = match[1];
			const noteId = match[2];

			let bodyObject: object = {
				noteId: noteId
			};

			// URLが現在のプロフィールのドメインと一緒だった場合、アクセストークンを送る。
			// これは公開範囲が限定されたノートを取得するため
			if (this.settings.accounts[this.settings.selectedAccount].domain === misskeyDomain) {
				bodyObject = {
					...bodyObject,
					"i": this.settings.accounts[this.settings.selectedAccount].accountToken
				};
			}

			const urlParams: RequestUrlParam = {
				"url": `https://${misskeyDomain}/api/notes/show`,
				"method": "POST",
				"headers": {
					"Content-Type": "application/json"
				},
				"body": JSON.stringify(bodyObject)
			};

			const response = await requestUrl(urlParams);
			// Misskeyのドメインを網羅することはできないので200が帰ってきたらMisskeyのノートとみなす
			if (response.status !== 200) {
				new Notice(i18n.t("noteCannotBeQuoted") + url);
				continue;
			}
			const data = await response.json;
			// ノートには本文がなく、画像だけが添付されている場合がある。
			let note = data.text ? data.text + "\n" : "";

			// 添付ファイルがある場合は対象のURLを取得し、メディアとして埋め込む
			for (const file of (data.files || [])) {
				if (embedFormat === "markdown") {
					note += `![${file.name}](${file.url})\n`
				} else if (file.type.startsWith("image")){
					note += `<img src="${file.url}" alt="${file.name}">\n`;
				} else if (file.type.startsWith("video")) {
					note += `<video controls><source src="${file.url}"></video>\n`;
				} else if (file.type.startsWith("audio")) {
					note += `<audio controls src="${file.url}"></audio>\n`;
				} else {
					note += `[${file.name}](${file.url})\n`
				}
			}

			// 引用元のユーザー情報を表示するための処理
			note += "\n";

			// 初期アイコンはidenticon(一度移動する必要がある)なので、それ以外の場合のみアイコンを埋め込む
			if (new URL(data.user.avatarUrl).pathname.split('/')[1] !== 'identicon') {
				const iconSize = 20;
				if (embedFormat === "markdown") {
					note += `![${data.user.username}|${iconSize}](${data.user.avatarUrl})`;
				} else if (embedFormat === "html") {
					note += `<img src="${data.user.avatarUrl}" alt="${data.user.username}" width="${iconSize}">`;
				}
			}
			// data.user.nameはバージョンによってはnullの場合がある。少なくともv2023.11ではnull。空文字にしとく
			note += ` ${data.user.name || ""}[`+ i18n.t("openOriginalNote", { username: data.user.username}) +`](${url})`;
			note = note.split("\n").map((line) => "> " + line).join("\n");

			const pattern = /:(\w+):/g;

			// 絵文字を走査する。ユーザー名に絵文字が含まれている場合があるためこの位置になる
			while ((match = pattern.exec(note)) !== null) {
				const emojiName = match[1];
				const url = `https://${misskeyDomain}/api/emoji?name=${emojiName}`;
				const response = await requestUrl({
					"url": url,
					"method": "GET"
				}).catch((error) => {
					new Notice(i18n.t("emojiCannotBeFetched") + emojiName);
					return;
				});
				if (response?.status != 200){
					new Notice(i18n.t("emojiCannotBeFetched") + emojiName);
					continue;
				}
				const data = await response.json;

				const emojiSize = 20;
				if (embedFormat === "markdown") {
					note = note.replace(`:${emojiName}:`, `![${emojiName}|${emojiSize}](${data.url})`);
				} else if (embedFormat === "html") {
					note = note.replace(`:${emojiName}:`, `<img src="${data.url}" alt="${emojiName}" width="${emojiSize}">`);
				}
			}
			note = "\n" + note + "\n";
			notes.push([url, note]);
		}
		// 複数個ノートがある場合、それらは別々の引用として表示されるべき
		for (let i = 0; i < notes.length - 1; i++) {
			notes[i][1] += "\n";
		}
		return notes;
	}

	private isSettingsValid(): boolean {
		if (this.settings.selectedAccount >= this.settings.accounts.length) {
			new Notice(i18n.t("selectedAccountNotFoundError"))
			return false;
		}

		const currentAccount = this.settings.accounts[this.settings.selectedAccount];
		if (currentAccount.domain === "") {
			new Notice(i18n.t("domainNotSetError"))
			return false;
		}
		if (currentAccount.accountToken === null) {
			new Notice(i18n.t("accountTokenNotSetError"))
			return false;
		}
		if (currentAccount.embedFormat !== "markdown" && currentAccount.embedFormat !== "html") {
			new Notice(i18n.t("embedFormatValueError"))
			return false;
		}
		if (currentAccount.visibility !== "public" && currentAccount.visibility !== "home" && currentAccount.visibility !== "followers") {
			new Notice(i18n.t("visibilityValueError"))
			return false;
		}
		return true;
	}


	async onload() {
		await this.loadSettings();
		await i18n.init({
			// リソースとなる言語と翻訳を設定
			resources: {
				ja: { translation: jaTranslation },
				en: { translation: enTranslation },
			},
			// デフォルト言語を設定
			lng: this.settings.language,
			fallbackLng: "ja",
		});

		this.addSettingTab(new MisskeyPluginSettingsTab(this.app, this));

		this.addCommand({
			id: "post-to-misskey",
			name: "Post the current line to Misskey",
			editorCallback: async (editor) => {
				if (!this.isSettingsValid()) { return; }

				new Notice(i18n.t("postingToMisskey"))
				const text = editor.getLine(editor.getCursor().line);
				const imageIDs = await this.uploadFileToMisskey(text);
				// ![[path]]を削除。拡張子による除外などでアップロードされていないファイルがある可能性があるものの
				// この記法はObsidianの独自記法なので削除しても問題ないと判断
				const pattern = /!\[\[.*?]]/g;
				await this.postToMisskey(text.replace(pattern, ''),
					this.settings.accounts[this.settings.selectedAccount].visibility, imageIDs);
			},
		});

		this.addCommand({
			id: "embed-misskey-note",
			name: "Embed a Misskey note",
			editorCallback: async (editor) => {
				if (!this.isSettingsValid()) { return; }

				new Notice(i18n.t("collectingNotes"))
				const text = editor.getLine(editor.getCursor().line);
				// URLを見つけるための正規表現パターン
				const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
				// テキストからURLを抽出
				const urls = text.match(urlPattern);
				if (!urls) { return; }
				// URLからMisskeyのノートを取得
				const notes = await this.quoteFromMisskeyNote(urls);
				for (const [url, note] of notes) {
					const replacedText = editor.getLine(editor.getCursor().line).replace(url, note);
					editor.setLine(editor.getCursor().line, replacedText);
				}
				new Notice(i18n.t("noteQuoted"))
			},
		});
	}
}
