# Amazon MiniTV AdBlocker

## Compatibility status

Version 0.2.0 is a fail-open compatibility checkpoint. Amazon MiniTV has moved
into newer Amazon streaming surfaces, and the previous broad network rules could
interfere with normal playback. This version therefore performs no blocking or
playback changes while the current browser player is reverified.

- No permissions or host access
- No background worker or content script
- No analytics, telemetry, or transmitted browsing data
- A local popup that explains the current state

`background.js` is retained as unreferenced migration history. It is not loaded
by `manifest.json` and cannot run in the extension.

## Verify

```sh
npm run check
```

For a manual check, load the repository as an unpacked extension in Chrome,
confirm the extension details show no site access, open the toolbar popup, and
verify normal Amazon playback remains unchanged.

## Build the store artifact

```sh
npm run package
```

The command writes a deterministic ZIP and SHA-256 evidence to the ignored
`.artifacts/` directory. Its hard-coded allowlist contains only the manifest,
popup, tokens, and two icons; it excludes the legacy worker, tests, dotfiles,
private project notes, and repository metadata.

## Re-enabling functionality

Do not add guessed selectors or broad media filters. A functional release needs
a sanitized current-player trace, positive and negative fixtures, exact playback
state restoration, fail-open timeouts, and a Chrome Stable journey test. Never
commit cookies, account identifiers, raw viewing history, or captured tokens.

## Links

- [Chrome Web Store listing](https://chrome.google.com/webstore/detail/amazon-minitv-adblocker/nlkkhdidnadclaajbpmhihbeccellili)
- [Report current player behavior](https://github.com/shmohit2002/Amazon-MiniTV-AdBlocker/issues)
- [Releases](https://github.com/shmohit2002/Amazon-MiniTV-AdBlocker/releases)
