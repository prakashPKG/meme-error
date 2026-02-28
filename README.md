# meme-error

A VS Code extension that reacts when a terminal command fails and shows a random meme-style response based on your selected output mode.

## What It Does

- Listens for failed integrated terminal commands (non-zero exit code).
- Shows a random response in the selected mode:
  - `text`: modal popup with meme-style error text
  - `audio`: plays a random laugh audio
  - `gif`: opens a random GIF panel with a Close button

## How To Use

1. Install the extension.
2. Open Command Palette (`Ctrl+Shift+P`).
3. Run `Meme Error: Select Error Output Mode`.
4. Choose one mode: `text`, `audio`, or `gif`.
5. Run a command in the integrated terminal that fails.

The extension will trigger automatically.

## Command

- `meme-error.selectOutputMode`: change output mode anytime.

## Setting

- `meme-error.outputMode`
  - Values: `text`, `audio`, `gif`
  - Default: `text`

## Notes

- Audio mode currently uses Windows playback.
- GIF mode opens a webview panel with a Close button.
