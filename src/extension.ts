import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { existsSync } from 'fs';

type OutputMode = 'text' | 'audio' | 'gif';

const OUTPUT_MODE_SETTING_KEY = 'outputMode';
const INITIAL_MODE_SELECTED_KEY = 'meme-error.initialModeSelected';

const DIAGNOSTIC_ERROR_MESSAGES = [
	'Code broke again. The bugs are unionized now.',
	'Undefined variable spotted. The compiler is judging silently.',
	'Error found. Your code and reality are in different branches.',
	'Exception energy detected. Please offer a semicolon sacrifice.',
	'Build gods are unhappy. Try snacks and a restart.'
];

const AUDIO_FILES = [
	'Tom_Laughing.wav',
	'Brahmanandam_Laugh.wav'
];

const GIF_FILES = [
	'gif-1.gif',
	'gif-2.gif',
	'gif-3.gif'
];

export function activate(context: vscode.ExtensionContext) {
	let gifPanel: vscode.WebviewPanel | undefined;

	const disposable = vscode.commands.registerCommand('meme-error.generateMemeError', async () => {
		const categories = [
			{ label: 'Build', detail: 'Compilation and CI failures' },
			{ label: 'Runtime', detail: 'Crashes and execution issues' },
			{ label: 'Network', detail: 'Timeouts and unreachable services' },
			{ label: 'Database', detail: 'Query and migration errors' }
		];

		const selected = await vscode.window.showQuickPick(categories, {
			placeHolder: 'Pick an error category'
		});

		if (!selected) {
			return;
		}

		const contextInput = await vscode.window.showInputBox({
			prompt: 'Optional: add short context (service, endpoint, file, etc.)',
			placeHolder: 'orders-api /login src/app.ts:42'
		});

		const memeError = createMemeErrorMessage(selected.label, contextInput);
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			await editor.edit((editBuilder) => {
				editBuilder.insert(editor.selection.active, memeError);
			});
			void vscode.window.showInformationMessage('Meme error inserted at cursor.');
			return;
		}

		await vscode.env.clipboard.writeText(memeError);
		void vscode.window.showInformationMessage('No active editor. Meme error copied to clipboard.');
	});

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
						localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
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

	context.subscriptions.push(disposable);
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
			void vscode.window.showWarningMessage('Audio mode is supported on Windows only. Falling back to popup.');
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
	if (process.platform !== 'win32') {
		return false;
	}

	const escapedPath = audioPath.replaceAll("'", "''");
	const command = `(New-Object System.Media.SoundPlayer '${escapedPath}').PlaySync()`;
	const child = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', command], {
		windowsHide: true,
		stdio: 'ignore'
	});
	child.unref();
	return true;
}

export function createMemeErrorMessage(category: string, context?: string): string {
	const templates: Record<string, string[]> = {
		Build: [
			'Build failed: TypeScript says "absolutely not" to your last commit.',
			'CI pipeline stopped. Your semicolon took a personal day.',
			'Webpack bundled everything except success.'
		],
		Runtime: [
			'Runtime error: app entered witness protection mode.',
			'Unhandled exception: code chose chaos over logic.',
			'Process crashed politely, then left no stack trace.'
		],
		Network: [
			'Network timeout: packet is still on a spiritual journey.',
			'Request failed: server responded with pure silence.',
			'Connection dropped: internet blinked and forgot us.'
		],
		Database: [
			'Database error: query went in, regrets came out.',
			'Migration failed: schema evolution rejected by natural selection.',
			'DB connection lost: credentials and reality disagree.'
		]
	};

	const options = templates[category] ?? ['Unknown error: vibes are unstable.'];
	const line = options[Math.floor(Math.random() * options.length)];
	const extra = context?.trim() ? ` Context: ${context.trim()}.` : '';
	return `[${category}] ${line}${extra}\n`;
}

export function deactivate() {}
