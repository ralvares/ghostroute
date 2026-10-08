import type { ResourceTable } from "../simulation/resource-table.js";
import { formatLabels } from "../simulation/resource-table.js";
export interface TableOptions {
  wide?: boolean;
  namespace?: boolean;
  noHeaders?: boolean;
  showLabels?: boolean;
  labelColumns?: string[];
  preserveHeaders?: boolean;
  minWidth?: number;
}
/** cli-runtime TablePrinter decoration and tabwriter alignment (minwidth=6, padding=3). */
export function printResourceTable(
  table: ResourceTable,
  options: TableOptions = {},
): string {
  if (!table.rows.length) return "";
  const indices = table.columnDefinitions.flatMap((column, index) =>
    !options.wide && column.priority ? [] : [index],
  );
  const labelColumns = options.labelColumns ?? [];
  const heads = [
    ...(options.namespace ? ["NAMESPACE"] : []),
    ...indices.map((i) =>
      options.preserveHeaders
        ? table.columnDefinitions[i].name
        : table.columnDefinitions[i].name.toUpperCase(),
    ),
    ...labelColumns.map((label) => label.split("/").at(-1)!.toUpperCase()),
    ...(options.showLabels ? ["LABELS"] : []),
  ];
  const rows = table.rows.map((row) => [
    ...(options.namespace ? [row.object.metadata.namespace ?? ""] : []),
    ...indices.map((i) => row.cells[i]),
    ...labelColumns.map((key) => row.object.metadata.labels?.[key] ?? ""),
    ...(options.showLabels ? [formatLabels(row.object.metadata.labels)] : []),
  ]);
  const lines = [...(options.noHeaders ? [] : [heads]), ...rows].map((row) =>
    row.map((cell) => {
      const text = cell == null ? "" : String(cell);
      const breakAt = text.search(/[\f\n\r]/);
      const escaped = (breakAt < 0 ? text : text.slice(0, breakAt) + "...")
        .replace(/\x1b/g, "^[")
        .replace(/\r/g, "\\r");
      return escaped;
    }),
  );
  const widths = heads.map((_, i) =>
    Math.max(
      options.minWidth ?? 6,
      ...lines.map((line) => [...line[i]].length + 3),
    ),
  );
  return (
    lines
      .map((line) =>
        line
          .map((value, i) =>
            i === line.length - 1
              ? value
              : value + " ".repeat(Math.max(0, widths[i] - [...value].length)),
          )
          .join(""),
      )
      .join("\n") + "\n"
  );
}
