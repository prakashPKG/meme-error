import * as assert from 'assert';

import * as vscode from 'vscode';
import { createMemeErrorMessage, getRandomDiagnosticErrorMessage } from '../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('createMemeErrorMessage includes category and context', () => {
		const message = createMemeErrorMessage('Build', 'src/app.ts:42');
		assert.ok(message.includes('[Build]'));
		assert.ok(message.includes('Context: src/app.ts:42.'));
	});

	test('createMemeErrorMessage falls back for unknown category', () => {
		const message = createMemeErrorMessage('UnknownCategory');
		assert.ok(message.includes('[UnknownCategory]'));
		assert.ok(message.includes('Unknown error: vibes are unstable.'));
	});

	test('getRandomDiagnosticErrorMessage picks deterministic first item', () => {
		const message = getRandomDiagnosticErrorMessage(() => 0);
		assert.strictEqual(message, 'Code broke again. The bugs are unionized now.');
	});
});
