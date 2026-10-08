import { $ } from "../ui/dom.js";
import { G } from "../game/runtime.js";

export function esc(s: unknown) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}

export function toast(s: string) {
  const el = $("toast");
  el.textContent = s;
  el.classList.add("show");
  clearTimeout(G.toastTimer);
  G.toastTimer = setTimeout(() => el.classList.remove("show"), 2700);
}
