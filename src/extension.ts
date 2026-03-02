import * as vscode from 'vscode';
import { spawn, spawnSync } from 'child_process';
import { existsSync } from 'fs';

type OutputMode = 'text' | 'audio' | 'gif';

const OUTPUT_MODE_SETTING_KEY = 'outputMode';
const INITIAL_MODE_SELECTED_KEY = 'meme-error.initialModeSelected';

const DIAGNOSTIC_ERROR_MESSAGES = [
	'Code broke again. The bugs are unionized now.',
	'Undefined variable spotted. The compiler is judging silently.',
	'Error found. Your code and reality are in different branches.',
	'Exception energy detected. Please offer a semicolon sacrifice.',
	'Your hotfix introduced three new features: panic, confusion, and rollback.',
	'Stack trace says your code took a shortcut through a minefield.',
	'The code compiled, but only emotionally. Runtime disagrees.',
	'Your function returned chaos with a side of technical debt.',
	'Debugger opened the file and immediately asked for paid leave.',
	'You shipped confidence to production, not correctness.',
	'This bug is not a bug anymore. It is part of team leadership.',
	'Your refactor removed complexity by moving it to everyone else.',
	'Even the linter stopped complaining and started laughing.',
	'Production called. It wants a restraining order against this commit.',
	'Your code review was approved by hope, not by humans.',
	'This commit has strong \"works on my machine\" energy and zero evidence.',
	'Your variable names read like a password reset attempt.',
	'You turned edge cases into the main feature.',
	'The CPU is working hard just to misunderstand your intent.',
	'Unit tests passed because they were too scared to fail.',
	'Your rollback plan is currently \"close laptop and relocate.\"',
	'This code is a distributed denial-of-service attack on maintainability.',
	'Your branch strategy is \"merge and pray.\"',
	'The bug tracker just filed a complaint against your coding style.',
	'Your dependency graph now qualifies as abstract art.',
	'You optimized the wrong thing with impressive confidence.',
	'This error is just your architecture giving live feedback.',
	'Your code has excellent job security for future developers.',
	'The runtime saw your commit and chose violence.',
	'You solved one bug and promoted four interns to critical incidents.',
	'This line should come with a warning label and legal disclaimer.',
	'Your fix was so temporary it expired before deployment.',
	'If confusion were a framework, you just shipped v2.0.',
	'You wrote clean code in spirit. Syntax had other plans.',
	'Your app is now event-driven by pure panic.',
	'This feature is held together by comments and courage.',
	'Your exception handling strategy is \"manifest destiny.\"',
	'You achieved full-stack failure with admirable consistency.',
	'The compiler understood your code. It just did not respect it.',
	'Your architecture diagram is now legally classified as fiction.',
	'This release has all the stability of a Jenga tower in an earthquake.',
	'You did not break production. You redecorated its ruins.',
	'This bug reproduces faster than your sprint velocity.',
	'Your log messages are poetry, unfortunately written in riddles.',
	'Your API contract is now a verbal agreement with no witnesses.',
	'The debugger found your bug and requested hazard pay.',
	'Your code is technically running, morally questionable, spiritually lost.',
	'This stack trace is basically your autobiography.',
	'Build gods are unhappy. Try snacks and a restart.'
];

const AUDIO_FILES = [
	'audio/aa-with-reverb.wav',
	'audio/aayein-meme.wav',
	'audio/Bhai Yaha Pe Kya Ho Raha Hai.wav',
	'audio/Brahmanandam_Laugh.wav',
	'audio/bruh-sound.wav',
	'audio/bulla.wav',
	'audio/faaa.wav',
	'audio/fart-4.wav',
	'audio/fart-5.wav',
	'audio/indian-donkay-songa.wav',
	'audio/indian-guy-laughing.wav',
	'audio/indian-guy-singing.wav',
	'audio/indian-sorry.wav',
	'audio/jaldi_waha_se_hato.wav',
	'audio/kya-cheda-bhosdi.wav',
	'audio/laughing-man.wav',
	'audio/maa-ka-bhosda-aag.wav',
	'audio/mmm-mremememew-memew-indian.wav',
	'audio/modi-ji-bhojyam.wav',
	'audio/modi-ji-bkl.wav',
	'audio/mummy-re.wav',
	'audio/oh-my-god.wav',
	'audio/scammer-wtf-are-you-doing-joker.wav',
	'audio/sinister-laugh.wav',
	'audio/Speaking Italian.wav',
	'audio/thud-sound.wav',
	'audio/Tom_Laughing.wav',
	'audio/very-infectious-laughter.wav',
	'audio/wait-a-minute-who-are-you.wav',
	'audio/yeah-boy.wav'
];

const GIF_FILES = [
	'gif/gif-1.gif',
	'gif/gif-2.gif',
	'gif/gif-3.gif'
];

export function activate(context: vscode.ExtensionContext) {
	let gifPanel: vscode.WebviewPanel | undefined;

	const selectModeDisposable = vscode.commands.registerCommand('meme-error.selectOutputMode', async () => {
		await promptAndSaveModeSelection(context, true);
	});

	const terminalExecutionDisposable = vscode.window.onDidEndTerminalShellExecution((event) => {
		if (event.exitCode === 0) {
			return;
		}
		const mode = getConfiguredOutputMode();
		void showModeBasedError(mode, context.extensionUri, () => {
			if (!gifPanel) {
				gifPanel = vscode.window.createWebviewPanel(
					'memeErrorGif',
					'Meme Error GIF',
					vscode.ViewColumn.Beside,
					{
						enableScripts: true,
						localResourceRoots: [
							vscode.Uri.joinPath(context.extensionUri, 'media'),
							vscode.Uri.joinPath(context.extensionUri, 'media', 'gif')
						]
					}
				);

				gifPanel.webview.onDidReceiveMessage((message) => {
					if (message && message.command === 'close') {
						gifPanel?.dispose();
					}
				});

				gifPanel.onDidDispose(() => {
					gifPanel = undefined;
				});
			}

			return gifPanel;
		});
	});

	void promptAndSaveModeSelection(context, false);

	context.subscriptions.push(selectModeDisposable);
	context.subscriptions.push(terminalExecutionDisposable);
}

export function getRandomDiagnosticErrorMessage(randomFn: () => number = Math.random): string {
	const index = Math.floor(randomFn() * DIAGNOSTIC_ERROR_MESSAGES.length);
	return DIAGNOSTIC_ERROR_MESSAGES[index] ?? DIAGNOSTIC_ERROR_MESSAGES[0];
}

function getConfiguredOutputMode(): OutputMode {
	const configuredMode = vscode.workspace
		.getConfiguration('meme-error')
		.get<string>(OUTPUT_MODE_SETTING_KEY, 'text');

	if (configuredMode === 'audio' || configuredMode === 'gif' || configuredMode === 'text') {
		return configuredMode;
	}

	return 'text';
}

async function promptAndSaveModeSelection(
	context: vscode.ExtensionContext,
	alwaysPrompt: boolean
): Promise<void> {
	const hasSelectedBefore = context.globalState.get<boolean>(INITIAL_MODE_SELECTED_KEY, false);
	if (!alwaysPrompt && hasSelectedBefore) {
		return;
	}

	const selected = await vscode.window.showQuickPick(
		[
			{ label: 'text', description: 'Show random text error message in popup' },
			{ label: 'audio', description: 'Play random error sound' },
			{ label: 'gif', description: 'Show random gif popup' }
		],
		{
			placeHolder: 'Select meme-error mode (you can change this anytime)'
		}
	);

	if (!selected) {
		return;
	}

	await vscode.workspace
		.getConfiguration('meme-error')
		.update(OUTPUT_MODE_SETTING_KEY, selected.label, vscode.ConfigurationTarget.Global);
	await context.globalState.update(INITIAL_MODE_SELECTED_KEY, true);
	void vscode.window.showInformationMessage(`meme-error mode set to "${selected.label}".`);
}

async function showModeBasedError(
	mode: OutputMode,
	extensionUri: vscode.Uri,
	getOrCreateGifPanel: () => vscode.WebviewPanel
): Promise<void> {
	if (mode === 'audio') {
		const audioFile = getRandomAudioFile();
		const audioPath = vscode.Uri.joinPath(extensionUri, 'media', audioFile).fsPath;
		if (!existsSync(audioPath)) {
			void vscode.window.showWarningMessage(`Audio file not found: ${audioFile}. Falling back to popup.`);
			const memeMessage = getRandomDiagnosticErrorMessage();
			void vscode.window.showErrorMessage(memeMessage, { modal: true });
			return;
		}
		const played = playAudioInBackground(audioPath);
		if (!played) {
			void vscode.window.showWarningMessage('No supported system audio player found. Falling back to popup.');
			const memeMessage = getRandomDiagnosticErrorMessage();
			void vscode.window.showErrorMessage(memeMessage, { modal: true });
		}
		return;
	}

	if (mode === 'gif') {
		const panel = getOrCreateGifPanel();
		const gifUri = getLocalMediaUri(panel.webview, extensionUri, getRandomGifFile());
		panel.webview.html = buildGifHtml(panel.webview.cspSource, gifUri.toString());
		return;
	}

	if (mode === 'text') {
		const memeMessage = getRandomDiagnosticErrorMessage();
		void vscode.window.showErrorMessage(memeMessage, { modal: true });
		return;
	}
}

function getRandomAudioFile(randomFn: () => number = Math.random): string {
	const index = Math.floor(randomFn() * AUDIO_FILES.length);
	return AUDIO_FILES[index] ?? AUDIO_FILES[0];
}

function getRandomGifFile(randomFn: () => number = Math.random): string {
	const index = Math.floor(randomFn() * GIF_FILES.length);
	return GIF_FILES[index] ?? GIF_FILES[0];
}

function getLocalMediaUri(webview: vscode.Webview, extensionUri: vscode.Uri, fileName: string): vscode.Uri {
	const fileUri = vscode.Uri.joinPath(extensionUri, 'media', fileName);
	return webview.asWebviewUri(fileUri);
}

function buildGifHtml(cspSource: string, gifUrl: string): string {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource}; style-src 'unsafe-inline'; script-src 'unsafe-inline';" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<style>
		body { margin: 0; background: #111; color: #fff; font-family: sans-serif; }
		.wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 12px; }
		img { max-width: 100%; max-height: calc(100vh - 80px); object-fit: contain; border-radius: 8px; }
		button { background: #e74c3c; color: #fff; border: 0; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-weight: 600; }
	</style>
</head>
<body>
	<div class="wrap">
		<img src="${gifUrl}" alt="error gif" />
		<button id="close-btn" type="button">Close</button>
	</div>
	<script>
		const vscode = acquireVsCodeApi();
		const btn = document.getElementById('close-btn');
		if (btn) {
			btn.addEventListener('click', () => vscode.postMessage({ command: 'close' }));
		}
	</script>
</body>
</html>`;
}

function playAudioInBackground(audioPath: string): boolean {
	if (process.platform === 'win32') {
		const escapedPath = audioPath.replaceAll("'", "''");
		const command = `(New-Object System.Media.SoundPlayer '${escapedPath}').PlaySync()`;
		const child = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', command], {
			windowsHide: true,
			stdio: 'ignore'
		});
		child.unref();
		return true;
	}

	if (process.platform === 'darwin') {
		if (!hasCommand('afplay')) {
			return false;
		}
		const child = spawn('afplay', [audioPath], {
			detached: true,
			stdio: 'ignore'
		});
		child.unref();
		return true;
	}

	if (process.platform === 'linux') {
		const player = getLinuxAudioPlayer();
		if (!player) {
			return false;
		}
		const escapedPath = audioPath.replaceAll("'", "'\\''");
		const command = player === 'ffplay'
			? `ffplay -nodisp -autoexit -loglevel quiet '${escapedPath}'`
			: `${player} '${escapedPath}'`;
		const child = spawn('sh', ['-c', command], {
			detached: true,
			stdio: 'ignore'
		});
		child.unref();
		return true;
	}

	return false;
}

function hasCommand(command: string): boolean {
	const result = spawnSync('sh', ['-c', `command -v ${command}`], { stdio: 'ignore' });
	return result.status === 0;
}

function getLinuxAudioPlayer(): 'paplay' | 'aplay' | 'ffplay' | undefined {
	if (hasCommand('paplay')) {
		return 'paplay';
	}
	if (hasCommand('aplay')) {
		return 'aplay';
	}
	if (hasCommand('ffplay')) {
		return 'ffplay';
	}
	return undefined;
}

export function deactivate() {}
