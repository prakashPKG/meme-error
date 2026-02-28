# meme-error Developer Notes

This repository started from the VS Code extension scaffold and is now customized.

## Current Behavior

- Extension activates on startup (`onStartupFinished`).
- On terminal command failure (non-zero exit code), it reacts using selected mode:
  - `text`: modal popup with random meme message.
  - `audio`: plays random local laugh audio.
  - `gif`: opens random local GIF panel.

## Primary Command

- `Meme Error: Select Error Output Mode`

Use this command to switch mode at any time.

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Compile:

```bash
npm run compile
```

3. Start extension dev host:

- Press `F5` in VS Code.

## Tests

```bash
npm test
```

## Important Files

- `src/extension.ts` - core extension logic
- `src/test/extension.test.ts` - test suite
- `media/` - audio and GIF assets
- `package.json` - extension manifest, command contributions, setting contributions

## Packaging

- `.vscodeignore` excludes development files from extension package.
- `npm run vscode:prepublish` compiles TypeScript before packaging.
