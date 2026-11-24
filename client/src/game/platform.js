// Small helpers for running both as a website and as the Android app.
import { Capacitor } from "@capacitor/core";
import { App as NativeApp } from "@capacitor/app";

export const isNativeApp = Capacitor.isNativePlatform();

// The APK is served by the game's own server (client/public/downloads).
export const APK_URL = "/downloads/red-string.apk";

// Android hardware back button: go back a screen, or leave the app from the home screen.
export function setupNativeBackButton() {
  if (!isNativeApp) return () => {};
  const handle = NativeApp.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack && window.location.pathname !== "/") window.history.back();
    else NativeApp.exitApp();
  });
  return () => handle.then((h) => h.remove());
}
