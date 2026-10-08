import { $ } from "../ui/dom.js";

let active: {
  rows: string[];
  top: number;
  size: number;
  query: string;
  mode: string;
  search: boolean;
} | null = null;
let pane: HTMLElement | undefined;
let text: HTMLElement, status: HTMLElement, search: HTMLInputElement;

function render() {
  if (!active) return;
  active.size = Math.max(1, Math.floor((text.clientHeight - 16) / 23));
  const { rows, top, size, mode } = active;
  text.textContent = rows.slice(top, top + size).join("\n");
  status.textContent = `${mode} · ${rows.length ? top + 1 : 0}–${Math.min(rows.length, top + size)} / ${rows.length} · ${top + size >= rows.length ? "END" : Math.round(((top + size) / rows.length) * 100) + "%"} · Space: page · /: search · q: quit`;
}
function move(delta: number) {
  if (!active) return;
  active.top = Math.max(
    0,
    Math.min(Math.max(0, active.rows.length - active.size), active.top + delta),
  );
  render();
}
function findNext() {
  if (!active || !active.query) return;
  const { rows, query, top } = active;
  for (let offset = 1; offset <= rows.length; offset++) {
    const index = (top + offset) % rows.length;
    if (rows[index].includes(query)) {
      active.top = Math.min(index, Math.max(0, rows.length - active.size));
      render();
      status.textContent += " · match: " + query;
      return;
    }
  }
  status.textContent =
    "Pattern not found: " + query + " · /: search again · q: quit";
}
function startSearch() {
  if (!active) return;
  active.search = true;
  search.hidden = false;
  search.value = active.query;
  search.focus();
}
function endSearch() {
  if (!active) return;
  active.search = false;
  search.hidden = true;
  pane?.focus();
}
export function pagerIsOpen() {
  return active !== null;
}
export function closePager(focus = true) {
  active = null;
  if (pane) pane.hidden = true;
  $("termOutput").hidden = false;
  $("termform").hidden = false;
  if (focus) $("termInput").focus();
}

/** Presentation only. Page navigation never changes cluster resources or persisted progress. */
export function openPager(contents: string, mode: "more" | "less") {
  if (!pane) {
    pane = document.createElement("section");
    pane.id = "terminalPager";
    pane.className = "terminalPager";
    pane.tabIndex = 0;
    pane.setAttribute("aria-label", "Terminal pager");
    pane.innerHTML =
      '<pre class="pagerText"></pre><input class="pagerSearch" aria-label="Search pager" placeholder="Search text · Enter to find · Esc to cancel" hidden><div class="pagerStatus" aria-live="polite"></div><div class="pagerActions"><button type="button" data-page="back">Previous</button><button type="button" data-page="next">Next</button><button type="button" data-page="search">Search</button><button type="button" data-page="quit">Quit (q)</button></div>';
    $("termform").before(pane);
    text = pane.querySelector(".pagerText")!;
    status = pane.querySelector(".pagerStatus")!;
    search = pane.querySelector(".pagerSearch")!;
    pane.addEventListener("keydown", (event) => {
      if (!active) return;
      event.stopPropagation();
      if (active.search) {
        if (event.key === "Escape") {
          event.preventDefault();
          endSearch();
        } else if (event.key === "Enter") {
          event.preventDefault();
          active.query = search.value;
          endSearch();
          findNext();
        }
        return;
      }
      if (event.key === "Tab") return;
      event.preventDefault();
      if (["q", "Escape"].includes(event.key)) closePager();
      else if ([" ", "PageDown", "f"].includes(event.key)) move(active.size);
      else if (["PageUp", "b"].includes(event.key)) move(-active.size);
      else if (["ArrowDown", "Enter", "j"].includes(event.key)) move(1);
      else if (["ArrowUp", "k"].includes(event.key)) move(-1);
      else if (["Home", "g"].includes(event.key)) move(-active.rows.length);
      else if (["End", "G"].includes(event.key)) move(active.rows.length);
      else if (event.key === "/") startSearch();
      else if (event.key === "n") findNext();
    });
    pane.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-page]",
      );
      if (!button || !active) return;
      if (button.dataset.page === "quit") closePager();
      else if (button.dataset.page === "search") startSearch();
      else {
        move((button.dataset.page === "next" ? 1 : -1) * active.size);
        pane?.focus();
      }
    });
  }
  const height = $("termOutput").getBoundingClientRect().height;
  active = {
    rows: contents ? contents.replace(/\n$/, "").split("\n") : [],
    top: 0,
    size: Math.max(3, Math.floor((height - 120) / 23)),
    query: "",
    mode,
    search: false,
  };
  $("termOutput").hidden = true;
  $("termform").hidden = true;
  pane.hidden = false;
  search.hidden = true;
  render();
  // Status can wrap on mobile; measure again after its first layout.
  render();
  pane.focus();
}
