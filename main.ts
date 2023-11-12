import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';


interface PomodoroTimerSettings {
	pomodoroLength: number;
	shortBreakLength: number;
	longBreakLength: number;
	resetPomodoro: boolean;
	endPomodoro: boolean;
}

const DEFAULT_SETTINGS: PomodoroTimerSettings = {
	pomodoroLength: 1,
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
	public pomodoroTimeout: NodeJS.Timeout | null = null;


	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon for pomodoro time.
		const startPomodoroIcon = this.addRibbonIcon('clock', 'Pomodoro Timer', () => {
			this.startPomodoro();
		});

		const stopPomodoroIcon = this.addRibbonIcon('cross', 'Stop Pomodoro', () => {
			this.stopPomodoro();
		});
		
		startPomodoroIcon.addClass('pomodoro-timer-start');
		stopPomodoroIcon.addClass('pomodoro-timer-stop');

		if (this.settings.endPomodoro) {
			this.stopPomodoro();
		}

		// This adds a command to the command palette.
		this.addCommand({
			id: 'start-pomodoro',
			name: 'Start pomodoro',
			callback: () => {
				this.resetPomodoro()
				this.startPomodoro();
				if (this.settings.endPomodoro) {
					this.stopPomodoro();
					new Notice('Pomodoro already ended!');
				}
			}	
		})

		this.addCommand({
			id: 'stop-pomodoro',
			name: 'Stop pomodoro',
			callback: () => {
				this.stopPomodoro();
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

	}

	onunload() {
		// Called when the pomodoro-timer plugin is disabled
		console.log('Unloading pomodoro-timer plugin');
		
	}

	async loadSettings() {

		this.settings = Object.assign({}, 
			DEFAULT_SETTINGS, 
			await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	startPomodoro() {
		if (this.settings.endPomodoro) {
			new Notice('Pomodoro already ended!');
		}

		new Notice('Pomodoro started!');

		this.pomodoroTimeout = setTimeout(() => {
			new Notice('Pomodoro ended!');
			this.settings.endPomodoro = true;
			this.saveSettings();

			this.startBreak();
		}, this.settings.pomodoroLength * 60 * 1000);
	}

	stopPomodoro() {
		if (this.pomodoroTimeout != null) {
			clearTimeout(this.pomodoroTimeout);
			this.settings.endPomodoro = true;
			this.saveSettings();
			new Notice('Pomodoro stopped!');
		}
	}

	startBreak() {
		new Notice('Break started!');
		setTimeout(() => {
			new Notice('Break ended!');
			this.startPomodoro();
		}, this.settings.shortBreakLength * 60 * 1000);
	}


	//create a function that will reset the long break timer
	longBreak() {
		new Notice('Long break started!');
		setTimeout(() => {

			new Notice('Long break ended!');
			if (this.settings.resetPomodoro == true) {
				this.resetPomodoro();
			} else {
				this.startPomodoro();
			}
		}, this.settings.longBreakLength * 60 * 1000);
	}

	resetPomodoro() {
		new Notice('Pomodoro reset!');
		this.settings.resetPomodoro = true;
		setTimeout(() => {
			this.settings.resetPomodoro = false;
			this.startPomodoro();
		}, 5000);
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
