# Watchparty prototype

A small Manifest V3 browser-extension UI prototype for a friends watch-party app. The popup is built with TypeScript, Vite, and SCSS, and works on Windows and macOS wherever Chrome is available.

## Run locally

```sh
npm install
npm run dev
```

The Vite preview uses browser local storage as a fallback. Build the extension with:

```sh
npm run build
```

Then open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the `dist` directory.

## Current scope

- Polished popup UI for creating/joining a room and copying an invite code.
- Local room state and a demo playback control.
- No account credentials, video streams, or DRM access.

**This is a UI prototype only.** Room codes are not shared across browsers or devices, participants are not actually connected, and playback buttons do not control a streaming service. Real multi-user rooms require a small WebSocket backend; player integration needs separate compatibility and service-policy review.
