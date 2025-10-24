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
  Checkbox,
} from "@fluentui/react-components";
import { ITreeItem } from "./dataTransform";

export interface ITreeViewControlProps {
  data: ITreeItem[];
  buttonSize: "small" | "medium" | "large";
  treeSize: "small" | "medium";
  fontSize?: number;
  onSelectionChange?: (updatedData: ITreeItem[], selectedKeys: string, selectedState: string) => void;
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
  checkbox: {
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

  const getSelectedState = (items: ITreeItem[]): string => {
    const rows: string[] = [];
    const traverse = (nodes: ITreeItem[]) => {
      nodes.forEach((n) => {
        rows.push(`${n.isSelected ? "true" : "false"},${n.key},`);
        if (n.children && n.children.length > 0) traverse(n.children);
      });
    };
    try {
      traverse(items);
      const result = rows.join("\n");
      console.log("Selected state:", result);
      return result;
    } catch (err) {
      console.error("Error in getSelectedState:", err);
      return "";
    }
  };

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

  const updateSelection = (key: string, isSelected: boolean): ITreeItem[] => {
    // New approach:
    // 1) Deep-clone the tree data
    // 2) Find the target node and set its isSelected to the provided value, and set the same value for all its descendants
    // 3) Recompute parent nodes' isSelected as `item.isSelected || any(child.isSelected)` so parents reflect child selections
    try {
      const cloned: ITreeItem[] = JSON.parse(JSON.stringify(treeData));

      // set target node and all descendants
      const setTargetAndDescendants = (items: ITreeItem[]): boolean => {
        let found = false;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item.key) continue;
          if (item.key === key) {
            // set this node and all descendants to isSelected
            const markAll = (node: ITreeItem) => {
              node.isSelected = isSelected;
              if (node.children && node.children.length > 0) {
                node.children.forEach((c) => markAll(c));
              }
            };
            markAll(item);
            found = true;
            break; // target keys are unique
          }
          if (item.children && item.children.length > 0) {
            const childFound = setTargetAndDescendants(item.children);
            if (childFound) {
              found = true;
              break;
            }
          }
        }
        return found;
      };

      setTargetAndDescendants(cloned);

      // recompute parents: a node isSelected if itself isSelected OR any child isSelected
      const recomputeParents = (items: ITreeItem[]): ITreeItem[] => {
        return items.map((item) => {
          if (item.children && item.children.length > 0) {
            const children = recomputeParents(item.children);
            const anyChildSelected = children.some((c) => c.isSelected);
            return { ...item, children, isSelected: (item.isSelected as boolean) || anyChildSelected };
          }
          return item;
        });
      };

      const updated = recomputeParents(cloned);
      console.log("Updated treeData:", JSON.stringify(updated, null, 2));
      return updated;
    } catch (error) {
      console.error("Error in updateSelection:", error);
      return treeData;
    }
  };

  const handleCheckboxChange = (key: string, checked: boolean): void => {
    try {
      const updatedData = updateSelection(key, checked);
      setTreeData(updatedData);
      if (onSelectionChange) {
        const selectedKeys = getSelectedKeys(updatedData);
        const selectedState = getSelectedState(updatedData);
        onSelectionChange(updatedData, selectedKeys, selectedState);
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
            <Checkbox
              className={styles.checkbox}
              checked={item.isSelected ?? false}
              onChange={(ev, data) => handleCheckboxChange(item.key, data.checked as boolean)}
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