import * as React from "react";
import {
  Button,
  makeStyles,
  Tree,
  TreeItem,
  TreeItemLayout,
  TreeItemValue,
  TreeOpenChangeData,
  TreeOpenChangeEvent,
  // Radio, (use native input radio to guarantee rendering in the harness)
} from "@fluentui/react-components";
import { ITreeItem } from "./dataTransform";

export interface ITreeViewControlProps {
  data: ITreeItem[];
  buttonSize: "small" | "medium" | "large";
  treeSize: "small" | "medium";
  fontSize?: number;
  onSelectionChange?: (updatedData: ITreeItem[], selectedKeys: string, changedRows: string) => void;
}

const useStyles = makeStyles({
  innerWrapper: {
    alignItems: "start",
    columnGap: "15px",
    display: "flex",
  },
  OuterWrapper: {
    display: "flex",
    flexDirection: "column",
    rowGap: "15px",
    minWidth: "min-content",
  },
  childTree: {
    marginLeft: "24px",
  },
  treeContainer: {
    minWidth: "100%",
    width: "max-content",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  treeItemLayout: {
    display: "inline-flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    width: "100%",
    padding: "4px 8px",
  },
  nodeText: {
    display: "inline-flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    gap: "8px",
  },
  key: {
    fontWeight: "bold",
  },
  separator: {
    color: "#666",
  },
  radio: {
    marginRight: "8px",
  },
});

export const TreeViewControl: React.FC<ITreeViewControlProps> = ({
  data,
  buttonSize,
  treeSize,
  fontSize,
  onSelectionChange,
}) => {
  const styles = useStyles();
  const [openItems, setOpenItems] = React.useState<TreeItemValue[]>([]);
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
      allKeysCollected: TreeItemValue[]
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
      const allKeys: TreeItemValue[] = [];
      collectKeys(treeData, allKeys);
      setOpenItems(allKeys);
    } catch (error) {
      console.error("Error in handleExpandAll:", error);
    }
  };

  const handleCollapseAll = (): void => {
    setOpenItems([]);
  };

  const handleOpenChange = (
    event: TreeOpenChangeEvent,
    eventData: TreeOpenChangeData
  ): void => {
    try {
      setOpenItems((curr) =>
        eventData.open
          ? [...curr, eventData.value]
          : curr.filter((item) => item !== eventData.value)
      );
    } catch (error) {
      console.error("Error in handleOpenChange:", error);
    }
  };

  const updateSelection = (key: string): ITreeItem[] => {
    // New behavior requested:
    // 1) Toggle the clicked node's isSelected (flip current state)
    // 2) Clear (set false) all downstream descendants of the clicked node
    // 3) Toggle each upstream ancestor's isSelected (flip each parent in the path)
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

      // clear all descendants of target
      const clearDescendants = (node: ITreeItem) => {
        if (!node.children || node.children.length === 0) return;
        node.children.forEach((c) => {
          c.isSelected = false;
          clearDescendants(c);
        });
      };
      clearDescendants(target);

      // when selecting the target, ensure all ancestors are selected
      // when deselecting the target, leave ancestors unchanged
      if (newSelected) {
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

  const renderTreeItems = (items: ITreeItem[]): React.ReactNode => {
    return items.map((item, index) => {
      if (!item.key || !item.label) {
        console.error(`Invalid item at index ${index}:`, item);
        return null;
      }
      return (
        <TreeItem
          key={item.key}
          value={item.key}
          as="div"
          aria-label={`${item.key} - ${item.label}`}
          itemType={item.children && item.children.length > 0 ? "branch" : "leaf"}
        >
          <TreeItemLayout
            title={item.tooltip ?? `${item.key} - ${item.label}`}
            className={styles.treeItemLayout}
            style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
          >
            <input
              type="radio"
              className={styles.radio}
              checked={item.isSelected ?? false}
              onChange={() => handleCheckboxChange(item.key, false)}
              aria-label={`Select ${item.key}`}
            />
            <span className={styles.nodeText}>
              <span className={styles.key}>{item.key}</span>
              <span className={styles.separator}> - </span>
              <span>{item.label}</span>
            </span>
          </TreeItemLayout>
          {item.children && item.children.length > 0 ? (
            <Tree className={styles.childTree}>
              {renderTreeItems(item.children)}
            </Tree>
          ) : null}
        </TreeItem>
      );
    });
  };

  return (
    <div className={styles.treeContainer}>
      <div className={styles.OuterWrapper}>
        <div className={styles.innerWrapper}>
          <Button size={buttonSize} onClick={handleExpandAll}>
            Expand all
          </Button>
          <Button size={buttonSize} onClick={handleCollapseAll}>
            Collapse all
          </Button>
        </div>
      </div>
      <Tree
        size={treeSize}
        aria-label="Default"
        appearance="subtle"
        openItems={openItems}
        onOpenChange={handleOpenChange}
        className={styles.treeContainer}
      >
        {renderTreeItems(treeData)}
      </Tree>
    </div>
  );
};