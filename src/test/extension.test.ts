import * as assert from 'assert';

import { getRandomDiagnosticErrorMessage } from '../extension';

suite('Extension Test Suite', () => {
	test('getRandomDiagnosticErrorMessage picks deterministic first item', () => {
		const message = getRandomDiagnosticErrorMessage(() => 0);
		assert.strictEqual(message, 'Code broke again. The bugs are unionized now.');
	});

	test('getRandomDiagnosticErrorMessage picks deterministic last item', () => {
		const message = getRandomDiagnosticErrorMessage(() => 0.9999);
		assert.strictEqual(message, 'Build gods are unhappy. Try snacks and a restart.');
	});
});
