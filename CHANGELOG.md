# Change Log

All notable changes to the `meme-error` extension are documented in this file.

## [Unreleased]

- No unreleased changes.

## [0.0.2] - 2026-03-02

- Added cross-platform audio playback support:
  - Windows: PowerShell `System.Media.SoundPlayer`
  - macOS: `afplay`
  - Linux: `paplay` / `aplay` / `ffplay` fallback chain
- Added and enabled full random audio selection from `media/audio/`:
  - `aa-with-reverb.wav`
  - `aayein-meme.wav`
  - `Bhai Yaha Pe Kya Ho Raha Hai.wav`
  - `Brahmanandam_Laugh.wav`
  - `bruh-sound.wav`
  - `bulla.wav`
  - `faaa.wav`
  - `fart-4.wav`
  - `fart-5.wav`
  - `indian-donkay-songa.wav`
  - `indian-guy-laughing.wav`
  - `indian-guy-singing.wav`
  - `indian-sorry.wav`
  - `jaldi_waha_se_hato.wav`
  - `kya-cheda-bhosdi.wav`
  - `laughing-man.wav`
  - `maa-ka-bhosda-aag.wav`
  - `mmm-mremememew-memew-indian.wav`
  - `modi-ji-bhojyam.wav`
  - `modi-ji-bkl.wav`
  - `mummy-re.wav`
  - `oh-my-god.wav`
  - `scammer-wtf-are-you-doing-joker.wav`
  - `sinister-laugh.wav`
  - `Speaking Italian.wav`
  - `thud-sound.wav`
  - `Tom_Laughing.wav`
  - `very-infectious-laughter.wav`
  - `wait-a-minute-who-are-you.wav`
  - `yeah-boy.wav`
- Expanded text mode with a much larger pool of witty, funny, and sarcastic developer-focused messages.
- Updated media layout:
  - audio files moved to `media/audio/`
  - GIF files moved to `media/gif/`
- Updated random GIF selection to the current `media/gif/` set:
  - `chat-pouce.gif`
  - `crying-cat-blink.gif`
  - `gog-the-alien-dog-gog-the-alien.gif`
  - `joks.gif`
  - `laughing-cat.gif`
  - `monkey-laught.gif`
  - `sad-vince.gif`
  - `shrek-rizz-shrek-meme.gif`
  - `yapapa-cat.gif`
- Added one-click VSIX packaging task (`Package VSIX`) via VS Code Tasks.
- Added marketplace metadata and publishing quality improvements:
  - updated publisher id
  - extension icon path and custom icon asset
  - homepage, bugs URL, keywords
  - license owner update
- Updated README to be user-facing for marketplace details view.
- Fixed npm audit vulnerabilities using safe dependency overrides (`mocha`, `diff`, `serialize-javascript`).

## [0.0.1] - 2026-02-28

- Added terminal-failure-based trigger for meme responses.
- Added selectable output mode setting: `text`, `audio`, `gif`.
- Added command `Meme Error: Select Error Output Mode`.
- Added random text modal messages from shared diagnostic message list.
- Added initial local audio playback support with bundled files:
  - `Tom_Laughing.wav`
  - `Brahmanandam_Laugh.wav`
- Added local GIF panel mode with Close button.
- Cleaned unused scaffold command/template code and simplified tests.
