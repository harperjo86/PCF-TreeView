export interface ITreeItem {
  key: string;
  label: string;
  tooltip?: string;
  children?: ITreeItem[];
  isSelected?: boolean;
  sortIndex?: number;
}

export const transformData = (items: any[]): ITreeItem[] => {
  console.log("Raw items:", JSON.stringify(items, null, 2));
  const tree: ITreeItem[] = [];
  const map: { [key: string]: ITreeItem } = {};

  try {
    // First pass: create nodes and map by key
    items.forEach((item) => {
      // support both plain objects and PCF DataSet record objects
      const get = (field: string) => {
        if (!item) return undefined;
        if (typeof item.getValue === "function") {
          try {
            return item.getValue(field);
          } catch {
            return undefined;
          }
        }
        return item[field];
      };

      const rawKey = get("itemKey");
      const rawLabel = get("itemLabel");
      if (!rawKey || !rawLabel) {
        console.error("Invalid item (missing key or label):", item);
        return;
      }

      const node: ITreeItem = {
        key: String(rawKey),
        label: String(rawLabel),
        tooltip: get("itemTooltip") ? String(get("itemTooltip")) : undefined,
        isSelected: (() => {
          const v = get("isSelected");
          if (v === undefined || v === null) return false;
          if (typeof v === "boolean") return v;
          if (typeof v === "object" && "value" in v) return Boolean((v as any).value);
          return Boolean(v);
        })(),
        sortIndex: (() => {
          const s = get("sortIndex");
          if (s === undefined || s === null) return undefined;
          const n = Number(s);
          return Number.isFinite(n) ? n : undefined;
        })(),
        children: [],
      };
      map[node.key] = node;
      // store parent key on the raw item for second pass
      (item as any).__parentKey = get("itemParentKey");
    });

    // Second pass: attach children to parents
    items.forEach((item) => {
      const rawKey = typeof item.getValue === "function" ? item.getValue("itemKey") : item.itemKey;
      if (!rawKey) return;
      const key = String(rawKey);
      const node = map[key];
      if (!node) return;
      const parentKey = item.__parentKey;
      if (!parentKey) {
        tree.push(node);
      } else {
        const parent = map[String(parentKey)];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          console.warn(`Parent not found for key ${parentKey}, placing node at root: ${key}`);
          tree.push(node);
        }
      }
    });

    // Stable sort by sortIndex if provided, applied at each level
    const sortNodes = (nodes: ITreeItem[]) => {
      nodes.sort((a, b) => {
        const ai = typeof a.sortIndex === "number" ? a.sortIndex : undefined;
        const bi = typeof b.sortIndex === "number" ? b.sortIndex : undefined;
        if (ai !== undefined && bi !== undefined) return ai - bi;
        if (ai !== undefined) return -1; // items with sortIndex come first
        if (bi !== undefined) return 1;
        return 0; // preserve original order when no indices
      });
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) sortNodes(n.children);
      });
    };
    sortNodes(tree);

    console.log("Transformed tree:", JSON.stringify(tree, null, 2));
    return tree;
  } catch (error) {
    console.error("Error in transformData:", error);
    return [];
  }
};