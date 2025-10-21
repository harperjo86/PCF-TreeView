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
} from "@fluentui/react-components";
import { ITreeItem } from "./dataTransform";

// Props for the TreeViewControl React component
export interface ITreeViewControlProps {
  data: ITreeItem[]; // Hierarchical tree data
  buttonSize: "small" | "medium" | "large"; // Button size for expand/collapse
  treeSize: "small" | "medium"; // Tree size (affects node spacing)
  fontSize?: number; // Font size for tree node labels (in px)
}

// Styles for layout and indentation
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
    marginLeft: "24px", // Indentation for child nodes
  },
});

// TreeViewControl renders a hierarchical tree with expand/collapse and configurable font size
export const TreeViewControl: React.FC<ITreeViewControlProps> = ({
  data,
  buttonSize,
  treeSize,
  fontSize,
}) => {
  const styles = useStyles();
  // State to track which tree nodes are open
  const [openItems, setOpenItems] = React.useState<TreeItemValue[]>([]);

  // Expands all nodes in the tree
  const handleExpandAll = (): void => {
    const collectKeys = (
      items: ITreeItem[],
      allKeysCollected: TreeItemValue[]
    ) => {
      items.forEach((item) => {
        allKeysCollected.push(item.key);
        if (item.children && item.children.length > 0) {
          collectKeys(item.children, allKeysCollected);
        }
      });
    };
    const allKeys: TreeItemValue[] = [];
    collectKeys(data, allKeys);
    setOpenItems(allKeys);
  };

  // Collapses all nodes in the tree
  const handleCollapseAll = (): void => {
    setOpenItems([]);
  };

  // Handles node open/close events
  const handleOpenChange = (
    event: TreeOpenChangeEvent,
    eventData: TreeOpenChangeData
  ): void => {
    setOpenItems((curr) =>
      eventData.open
        ? [...curr, eventData.value]
        : curr.filter((item) => item !== eventData.value)
    );
  };

  // Recursively renders tree items and their children
  const renderTreeItems = (items: ITreeItem[]): React.ReactNode => {
    return items.map((item) => (
      <TreeItem
        key={item.key}
        value={item.key}
        as="div"
        aria-label={item.label}
        itemType={item.children && item.children.length > 0 ? "branch" : "leaf"}
      >
        {/* Tree node label with tooltip and font size */}
        <TreeItemLayout
          title={item.tooltip ?? undefined}
          style={fontSize ? { fontSize } : undefined}
        >
          {item.label}
        </TreeItemLayout>
        {/* Render children with indentation if present */}
        {item.children && item.children.length > 0 ? (
          <Tree className={styles.childTree}>
            {renderTreeItems(item.children)}
          </Tree>
        ) : null}
      </TreeItem>
    ));
  };

  // Main render
  return (
    <div>
      {/* Expand/Collapse buttons */}
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
      {/* Tree structure */}
      <Tree
        size={treeSize}
        aria-label="Default"
        appearance="subtle"
        openItems={openItems}
        onOpenChange={handleOpenChange}
      >
        {renderTreeItems(data)}
      </Tree>
    </div>
  );
};