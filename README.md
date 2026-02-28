# meme-error

A VS Code extension that reacts when a terminal command fails and shows a random meme-style response based on your selected output mode.

## Features

- Triggers only when an integrated terminal command exits with non-zero status.
- Supports 3 output modes:
  - `text`: shows a modal popup with a random meme error message.
  - `audio`: plays a random local laugh audio file.
  - `gif`: opens a GIF panel with a Close button.
- Lets users change mode anytime with command:
  - `Meme Error: Select Error Output Mode`
- Stores mode in VS Code setting:
  - `meme-error.outputMode`

## Modes

### Text mode
Shows a modal error popup with a random value from `DIAGNOSTIC_ERROR_MESSAGES`.

### Audio mode
Plays one random file from `media/`:
- `Tom_Laughing.wav`
- `Brahmanandam_Laugh.wav`

Note: direct audio playback is implemented for Windows.

### GIF mode
Shows one random GIF from `media/` in a webview panel with a Close button.

## Commands

- `meme-error.selectOutputMode`

## Extension Settings

- `meme-error.outputMode`
  - Type: `string`
  - Values: `text`, `audio`, `gif`
  - Default: `text`

## Development

### Install and build

```bash
npm install
npm run compile
```

### Run extension

- Press `F5` in VS Code to launch the Extension Development Host.

### Test

```bash
npm test
```

## Project Structure

- `src/extension.ts`: extension logic (activation, mode selection, terminal failure handling)
- `src/test/extension.test.ts`: unit tests
- `media/`: local audio and GIF assets

## Known Notes

- Trigger depends on terminal shell execution end event (integrated terminal).
- Audio playback fallback behavior is shown if audio cannot be played.
