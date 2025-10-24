export interface ITreeItem {
  key: string;
  label: string;
  tooltip?: string;
  children?: ITreeItem[];
  isSelected?: boolean;
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

    console.log("Transformed tree:", JSON.stringify(tree, null, 2));
    return tree;
  } catch (error) {
    console.error("Error in transformData:", error);
    return [];
  }
};