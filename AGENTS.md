# Project guide

Manifest V3 compatibility checkpoint for the retired Amazon MiniTV surface.
`manifest.json` opens the local `popup.html`; `popup.css` consumes
`tokens.css`; `files/` holds icons. `background.js` is inert migration history.
Stay permission-free and fail open until a sanitized current-player trace proves
a safe behavior. Run `npm test`, then verify the unpacked extension and normal
playback in Chrome.
