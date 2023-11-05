import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';



interface PomodoroTimerSettings {
	pomodoroLength: number;
	shortBreakLength: number;
	longBreakLength: number;
	resetPomodoro: boolean;
	endPomodoro: boolean;
}

const DEFAULT_SETTINGS: PomodoroTimerSettings = {
	pomodoroLength: 25,
	shortBreakLength: 5,
	longBreakLength: 15,
	resetPomodoro: false,
	endPomodoro: false,
}

export default class PomodoroTimerPlugin extends Plugin {
	settings: PomodoroTimerSettings;
	public pomodoroLength: number;
	public shortBreakLength: number;
	public longBreakLength: number;

	public pomodoroTImeout: null;


	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon for pomodoro time.
		const pomodoroIconEl = this.addRibbonIcon('clock', 'Pomodoro Timer', () => {
			new Notice('The pomdomoro timer has been started!');
			this.startPomodoro();
		});

		// Perform additional things with the ribbon
		pomodoroIconEl.addClass('my-ribbon-icon');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'start-pomodoro',
			name: 'Start pomodoro',
			callback: () => {
				this.resetPomodoro()
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

		this.addCommand({
			id: 'long-break',
			name: 'Start long break',
			callback: () => {
				this.longBreak();
			}
		})

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

	resetPomodoro() {
		new Notice('Pomodoro reset!');
		this.settings.resetPomodoro = true;
		setTimeout(() => {
			this.settings.resetPomodoro = false;
			this.startPomodoro();
		}, 5000);
	}

	//create a function that will reset the long break timer
	longBreak() {
		new Notice('Long break started!');
		setTimeout(() => {

			new Notice('Long break ended!');
			if (this.settings.resetPomodoro == true) {
				this.resetPomodoro();
			} else {
				this.startPomodoro
			}
		}, this.settings.longBreakLength * 60 * 1000);
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
