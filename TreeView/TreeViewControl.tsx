import * as React from "react";
import { ITreeItem } from "./dataTransform";

export interface ITreeViewControlProps {
  data: ITreeItem[];
  buttonSize: "small" | "medium" | "large";
  treeSize: "small" | "medium";
  fontSize?: number;
  onSelectionChange?: (updatedData: ITreeItem[], selectedKeys: string, changedRows: string) => void;
}

// Simple inline style objects to avoid external UI libs
const styles = {
  innerWrapper: {
    alignItems: "start" as const,
    columnGap: "8px",
    display: "flex" as const,
  },
  outerWrapper: {
    display: "flex" as const,
    flexDirection: "column" as const,
    rowGap: "15px",
    minWidth: "min-content",
  },
  treeContainer: {
    display: "flex" as const,
    flexDirection: "column" as const,
    height: "100%",
    width: "100%",
    minWidth: 0,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
  },
  treeContent: {
    flex: 1,
    overflow: "auto" as const,
    minHeight: 0,
    minWidth: 0,
  },
  itemRow: {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    whiteSpace: "nowrap" as const,
    width: "100%",
    padding: 0,
    justifyContent: "flex-start" as const,
  },
  nodeText: {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    whiteSpace: "nowrap" as const,
    gap: "8px",
  },
  key: { fontWeight: "bold" as const },
  separator: { color: "#666" },
  radio: { marginRight: "8px", marginLeft: 0 },
  chevron: {
    cursor: "pointer" as const,
    display: "inline-block" as const,
    width: "16px",
    textAlign: "center" as const,
    userSelect: "none" as const,
  },
};

export const TreeViewControl: React.FC<ITreeViewControlProps> = ({
  data,
  buttonSize,
  treeSize,
  fontSize,
  onSelectionChange,
}) => {
  const [openItems, setOpenItems] = React.useState<string[]>([]);
  const [treeData, setTreeData] = React.useState<ITreeItem[]>(data);

  React.useEffect(() => {
    console.log("Input data:", JSON.stringify(data, null, 2));
    setTreeData(data);
  }, [data]);

  const getSelectedKeys = (items: ITreeItem[]): string => {
    const selected: string[] = [];
    const collectSelected = (nodes: ITreeItem[]) => {
      nodes.forEach((item) => {
        if (item.isSelected) {
          selected.push(item.key);
        }
        if (item.children) {
          collectSelected(item.children);
        }
      });
    };
    try {
      collectSelected(items);
      const result = selected.join(",");
      console.log("Selected keys:", result);
      return result;
    } catch (error) {
      console.error("Error in getSelectedKeys:", error);
      return "";
    }
  };

  // NOTE: selectedState output removed; keep internal state only and expose changedRows delta

  const handleExpandAll = (): void => {
    const collectKeys = (
      items: ITreeItem[],
      allKeysCollected: string[]
    ) => {
      items.forEach((item) => {
        if (!item.key) {
          console.error("Missing key in item:", item);
          return;
        }
        allKeysCollected.push(item.key);
        if (item.children && item.children.length > 0) {
          collectKeys(item.children, allKeysCollected);
        }
      });
    };
    try {
      const allKeys: string[] = [];
      collectKeys(treeData, allKeys);
      setOpenItems(allKeys);
    } catch (error) {
      console.error("Error in handleExpandAll:", error);
    }
  };

  const handleCollapseAll = (): void => {
    setOpenItems([]);
  };

  const toggleOpen = (key: string): void => {
    try {
      setOpenItems((curr) =>
        curr.includes(key) ? curr.filter((k) => k !== key) : [...curr, key]
      );
    } catch (error) {
      console.error("Error in toggleOpen:", error);
    }
  };

  const updateSelection = (key: string): ITreeItem[] => {
    // Selection behavior:
    // 1) Toggle the clicked node's isSelected (flip current state)
    // 2) Clear (set false) all downstream descendants of the clicked node
    // 3) When selecting: ensure all ancestors are selected
    // 4) When deselecting: update ancestors based on whether they have other selected children
    try {
      const cloned: ITreeItem[] = JSON.parse(JSON.stringify(treeData));

      // find path from root to target; returns array of nodes (references into cloned)
      const findPath = (items: ITreeItem[], targetKey: string, path: ITreeItem[] = []): ITreeItem[] | null => {
        for (let i = 0; i < items.length; i++) {
          const node = items[i];
          if (!node.key) continue;
          const newPath = [...path, node];
          if (node.key === targetKey) {
            return newPath;
          }
          if (node.children && node.children.length > 0) {
            const res = findPath(node.children, targetKey, newPath);
            if (res) return res;
          }
        }
        return null;
      };

      // check if a node has any selected children (recursive)
      const hasSelectedChildren = (node: ITreeItem): boolean => {
        if (!node.children || node.children.length === 0) return false;
        return node.children.some((c) => c.isSelected || hasSelectedChildren(c));
      };

      const path = findPath(cloned, key);
      if (!path || path.length === 0) {
        console.warn("updateSelection: key not found", key);
        return cloned;
      }

      const target = path[path.length - 1];
      const current = !!target.isSelected;
      const newSelected = !current;

      // set target to toggled value
      target.isSelected = newSelected;

      // clear all descendants of target (always clear when toggling)
      const clearDescendants = (node: ITreeItem) => {
        if (!node.children || node.children.length === 0) return;
        node.children.forEach((c) => {
          c.isSelected = false;
          clearDescendants(c);
        });
      };
      clearDescendants(target);

      // update ancestors
      if (newSelected) {
        // when selecting: ensure all ancestors are selected
        for (let a = 0; a < path.length - 1; a++) {
          const ancestor = path[a];
          ancestor.isSelected = true;
        }
      }

      console.log("Updated treeData:", JSON.stringify(cloned, null, 2));
      return cloned;
    } catch (error) {
      console.error("Error in updateSelection:", error);
      return treeData;
    }
  };

  const handleCheckboxChange = (key: string, _checked: boolean): void => {
    try {
      const previous = treeData;
      const updatedData = updateSelection(key);
      setTreeData(updatedData);
      if (onSelectionChange) {
        const selectedKeys = getSelectedKeys(updatedData);
        // compute changed rows: nodes where isSelected differs between previous and updated
        const changed: string[] = [];
        const collectChanged = (prevNodes: ITreeItem[] | undefined, newNodes: ITreeItem[] | undefined) => {
          if (!newNodes) return;
          newNodes.forEach((n) => {
            const prev = (prevNodes || []).find((p) => p.key === n.key);
            if (!prev) {
              // treat as changed
              changed.push(`${n.key}|${n.isSelected ? 'true' : 'false'}`);
            } else if ((prev.isSelected ?? false) !== (n.isSelected ?? false)) {
              changed.push(`${n.key}|${n.isSelected ? 'true' : 'false'}`);
            }
            if (n.children && n.children.length > 0) {
              const prevChildren = prev ? prev.children : undefined;
              collectChanged(prevChildren, n.children);
            }
          });
        };
        collectChanged(previous, updatedData);
        const changedRows = changed.join('\n');
        onSelectionChange(updatedData, selectedKeys, changedRows);
      }
    } catch (error) {
      console.error("Error in handleCheckboxChange:", error);
    }
  };

  const renderTreeItems = (items: ITreeItem[], level: number = 0): React.ReactNode => {
    return items.map((item, index) => {
      if (!item.key || !item.label) {
        console.error(`Invalid item at index ${index}:`, item);
        return null;
      }
      // inline style for node content: shift the radio+text block by level*20px
      const nodeContentStyle: React.CSSProperties = {
        marginLeft: `${level * 20}px`,
        display: "inline-flex",
        alignItems: "center",
      };

      const hasChildren = !!(item.children && item.children.length > 0);
      const isOpen = hasChildren ? openItems.includes(item.key) : false;

      return (
        <div key={item.key} role="treeitem" aria-expanded={hasChildren ? isOpen : undefined}>
          <div
            title={item.tooltip ?? `${item.key} - ${item.label}`}
            style={{ ...styles.itemRow, ...(fontSize ? { fontSize: `${fontSize}px` } : {}) }}
          >
            <span style={nodeContentStyle}>
              {hasChildren ? (
                <span
                  style={styles.chevron}
                  onClick={(e) => { e.stopPropagation(); toggleOpen(item.key); }}
                  aria-label={isOpen ? "Collapse" : "Expand"}
                >
                  {isOpen ? "▾" : "▸"}
                </span>
              ) : (
                <span style={{ ...styles.chevron, opacity: 0.4 }}>•</span>
              )}
              <input
                type="checkbox"
                style={styles.radio as React.CSSProperties}
                checked={item.isSelected ?? false}
                onClick={(e) => { e.stopPropagation(); }}
                onChange={(e) => { e.stopPropagation(); handleCheckboxChange(item.key, (e.target as HTMLInputElement).checked); }}
                aria-label={`Toggle ${item.key}`}
              />
              <span style={styles.nodeText as React.CSSProperties}>
                <span style={styles.key as React.CSSProperties}>{item.key}</span>
                <span style={styles.separator as React.CSSProperties}> - </span>
                <span>{item.label}</span>
              </span>
            </span>
          </div>
          {hasChildren && isOpen ? (
            <div role="group">
              {renderTreeItems(item.children!, level + 1)}
            </div>
          ) : null}
        </div>
      );
    });
  };

  return (
    <div style={styles.treeContainer}>
      <div style={styles.outerWrapper}>
        <div style={styles.innerWrapper}>
          <button onClick={handleExpandAll}>Expand all</button>
          <button onClick={handleCollapseAll} style={{ marginLeft: 8 }}>Collapse all</button>
        </div>
      </div>
      <div role="tree" aria-label="TreeView" style={styles.treeContent as React.CSSProperties}>
        {renderTreeItems(treeData)}
      </div>
    </div>
  );
};