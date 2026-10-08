export const offlineStatus = { state: "preparing", error: "" };

function status(state: string, error = "") {
  offlineStatus.state = state;
  offlineStatus.error = error;
  document.documentElement.dataset.offline = state;
}

export async function registerOffline() {
  if (import.meta.env.DEV) {
    status("development");
    return;
  }
  if (!("serviceWorker" in navigator)) {
    status(
      "unavailable",
      "Offline installation needs a browser with service-worker support.",
    );
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
    );
    // An activated worker has finished caching every asset, including unused WASM tools.
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () =>
          reject(
            new Error(
              "Offline cache is incomplete. Reconnect and reload to retry installation.",
            ),
          ),
        30000,
      );
      const installing = registration.installing;
      const changed = () => {
        if (installing?.state === "redundant") {
          clearTimeout(timeout);
          reject(
            new Error(
              "Offline asset installation failed. Reconnect and reload to retry.",
            ),
          );
        }
      };
      installing?.addEventListener("statechange", changed);
      navigator.serviceWorker.ready.then(() => {
        clearTimeout(timeout);
        installing?.removeEventListener("statechange", changed);
        resolve();
      });
    });
    status("ready");
  } catch (error) {
    status("error", (error as Error).message);
  }
}
