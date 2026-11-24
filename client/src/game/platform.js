// Small helpers for running both as a website and as the Android app.
import { Capacitor } from "@capacitor/core";
import { App as NativeApp } from "@capacitor/app";

export const isNativeApp = Capacitor.isNativePlatform();

// Stable link to the newest APK attached to a GitHub release named "red-string.apk".
export const APK_URL = "https://github.com/Rahul022-rj/RED-STRING/releases/latest/download/red-string.apk";

// Android hardware back button: go back a screen, or leave the app from the home screen.
export function setupNativeBackButton() {
  if (!isNativeApp) return () => {};
  const handle = NativeApp.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack && window.location.pathname !== "/") window.history.back();
    else NativeApp.exitApp();
  });
  return () => handle.then((h) => h.remove());
}
