import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';



interface PomodoroTimerSettings {
	pomodoroLength: number;
	shortBreakLength: number;
	longBreakLength: number;
}

const DEFAULT_SETTINGS: PomodoroTimerSettings = {
	pomodoroLength: 25,
	shortBreakLength: 5,
	longBreakLength: 15
}

export default class PomodoroTimerPlugin extends Plugin {
	settings: PomodoroTimerSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon for pomodoro time.
		const ribbonIconEl = this.addRibbonIcon('timer', 'Pomodoro Timer', () => {
			new Notice('This is from pomodoro timer!');
		});

		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});

		this.addCommand({
			id: 'start-pomodoro',
			name: 'Start pomodoro',
			callback: () => {
				this.startPomodoro();
			}	
		})

		this.addCommand({
			id: 'start-break',
			name: 'Start break',
			callback: () => {
				this.startBreak();
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new PomodoroSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		// Called when the pomodoro-timer plugin is disabled
		console.log('Unloading pomodoro-timer plugin');
		

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	startPomodoro() {
		new Notice('Pomodoro started!');
		setTimeout(() => {
			new Notice('Pomodoro ended!');
			this.startBreak();
		}, this.settings.pomodoroLength * 60 * 1000);
	}

	startBreak() {
		new Notice('Break started!');
		setTimeout(() => {
			new Notice('Break ended!');
			this.startPomodoro();
		}, this.settings.shortBreakLength * 60 * 1000);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class PomodoroSettingTab extends PluginSettingTab {
	plugin: PomodoroTimerPlugin;

	constructor(app: App, plugin: PomodoroTimerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Pomodoro Timer Settings'});

		new Setting(containerEl)
			.setName('Pomodoro Length')
			.setDesc('The length of a pomodoro in minutes')
			.addText(text => text
				.setPlaceholder('Enter the length of a pomodoro')
				.setValue(this.plugin.settings.pomodoroLength.toString())
				.onChange(async (value) => {
					this.plugin.settings.pomodoroLength = parseInt(value);
					await this.plugin.saveSettings();
				}));

	}
}
