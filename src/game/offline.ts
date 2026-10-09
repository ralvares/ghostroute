export const offlineStatus = { state: "preparing", error: "" };

function status(state: string, error = "") {
  offlineStatus.state = state;
  offlineStatus.error = error;
  document.documentElement.dataset.offline = state;
}

export async function registerOffline() {
  status("preparing");
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
      { updateViaCache: "none" },
    );
    // Verify the worker actually controlling this page has cached its loaded build.
    // serviceWorker.ready alone can refer to an older active worker during an update.
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          finished = true;
          cleanup();
          reject(
            new Error(
              "Offline cache is incomplete. Reconnect and reload to retry installation.",
            ),
          );
        },
        30000,
      );
      const installing = registration.installing;
      let checking = false;
      let finished = false;
      let retry: ReturnType<typeof setTimeout>;
      const cleanup = () => {
        clearTimeout(timeout);
        clearTimeout(retry);
        installing?.removeEventListener("statechange", changed);
        navigator.serviceWorker.removeEventListener("controllerchange", check);
      };
      const changed = () => {
        if (installing?.state === "redundant") {
          finished = true;
          cleanup();
          reject(
            new Error(
              "Offline asset installation failed. Reconnect and reload to retry.",
            ),
          );
        }
      };
      const check = async () => {
        const controller = navigator.serviceWorker.controller;
        if (finished || checking) return;
        if (!controller || controller.state !== "activated") {
          retry = setTimeout(check, 100);
          return;
        }
        checking = true;
        const ready = await new Promise<boolean>((done) => {
          const channel = new MessageChannel();
          const timer = setTimeout(() => {channel.port1.close(); done(false);}, 1000);
          channel.port1.onmessage = (event) => {clearTimeout(timer); channel.port1.close(); done(event.data?.ready === true);};
          controller.postMessage({type:"offline-readiness",entry:import.meta.url},[channel.port2]);
        });
        checking = false;
        if (finished) return;
        if (ready && navigator.serviceWorker.controller === controller) {
          finished = true; cleanup(); resolve();
        } else retry = setTimeout(check, 100);
      };
      installing?.addEventListener("statechange", changed);
      navigator.serviceWorker.addEventListener("controllerchange", check);
      void check();
      void navigator.serviceWorker.ready.then(check);
    });
    status("ready");
  } catch (error) {
    status("error", (error as Error).message);
  }
}
