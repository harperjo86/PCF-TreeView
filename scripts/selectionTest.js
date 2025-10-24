// Simple test harness for TreeView selection scenarios (Scenario 1 and 2)
// This is plain Node JS so you can run: node scripts/selectionTest.js

function transformData(items) {
  const tree = [];
  const map = {};

  // first pass: create nodes and map
  items.forEach((item) => {
    const rawKey = item.itemKey;
    const rawLabel = item.itemLabel;
    if (!rawKey || !rawLabel) {
      console.error('Invalid item', item);
      return;
    }
    const node = {
      key: String(rawKey),
      label: String(rawLabel),
      tooltip: item.itemTooltip || undefined,
      isSelected: Boolean(item.isSelected) || false,
      children: [],
    };
    map[node.key] = node;
    item.__parentKey = item.itemParentKey;
  });

  // second pass: attach
  items.forEach((item) => {
    const rawKey = item.itemKey;
    if (!rawKey) return;
    const node = map[String(rawKey)];
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
        // missing parent -> root
        tree.push(node);
      }
    }
  });

  return tree;
}

function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function updateSelection(treeData, key) {
  const cloned = cloneDeep(treeData);

  // find path
  const findPath = (items, targetKey, path = []) => {
    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      if (!node.key) continue;
      const newPath = [...path, node];
      if (node.key === targetKey) return newPath;
      if (node.children && node.children.length > 0) {
        const res = findPath(node.children, targetKey, newPath);
        if (res) return res;
      }
    }
    return null;
  };

  const path = findPath(cloned, key);
  if (!path) return cloned;

  const target = path[path.length - 1];
  const current = !!target.isSelected;
  const newSelected = !current;

  // toggle target
  target.isSelected = newSelected;

  // clear descendants
  const clearDescendants = (node) => {
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

  return cloned;
}

function getSelectedKeys(items) {
  const keys = [];
  const traverse = (nodes) => {
    nodes.forEach((n) => {
      if (n.isSelected) keys.push(n.key);
      if (n.children && n.children.length > 0) traverse(n.children);
    });
  };
  traverse(items);
  return keys.join(',');
}

function getSelectedState(items) {
  const rows = [];
  const traverse = (nodes) => {
    nodes.forEach((n) => {
      rows.push(`${n.isSelected ? 'true' : 'false'},${n.key},`);
      if (n.children && n.children.length > 0) traverse(n.children);
    });
  };
  traverse(items);
  return rows.join('\n');
}

function getChangedRows(oldTree, newTree) {
  const changes = [];
  const mapByKey = (nodes, map = {}) => {
    nodes.forEach((n) => {
      map[n.key] = n;
      if (n.children && n.children.length > 0) mapByKey(n.children, map);
    });
    return map;
  };
  const oldMap = mapByKey(oldTree || []);
  const newMap = mapByKey(newTree || []);
  Object.keys(newMap).forEach((k) => {
    const oldVal = oldMap[k] ? !!oldMap[k].isSelected : undefined;
    const newVal = !!newMap[k].isSelected;
    if (oldVal === undefined || oldVal !== newVal) {
      changes.push(`${k}|${newVal ? 'true' : 'false'}`);
    }
  });
  return changes.join('\n');
}

// Sample data for scenarios
const items = [
  { itemKey: '1', itemLabel: '1', itemParentKey: null },
  { itemKey: '1-1', itemLabel: '1-1', itemParentKey: '1' },
  { itemKey: '1-1-1', itemLabel: '1-1-1', itemParentKey: '1-1' },
  { itemKey: '1-1-1-1', itemLabel: '1-1-1-1', itemParentKey: '1-1-1' },
  { itemKey: '1-1-1-1-1', itemLabel: '1-1-1-1-1', itemParentKey: '1-1-1-1' },
  { itemKey: '1-1-1-1-1-1', itemLabel: '1-1-1-1-1-1', itemParentKey: '1-1-1-1-1' },
];

console.log('--- Building initial tree ---');
let tree = transformData(items);
console.log(JSON.stringify(tree, null, 2));

console.log('\n--- Scenario 1: select 1-1-1-1 ---');
{
  const old = cloneDeep(tree);
  tree = updateSelection(tree, '1-1-1-1');
  const changedRows = getChangedRows(old, tree);
  console.log('\nChanged Rows:\n' + changedRows);
  console.log('\nSelected State:');
  console.log(getSelectedState(tree));
  console.log('\nSelected Keys:');
  console.log(getSelectedKeys(tree));
}

console.log('\n--- Scenario 2: deselect 1-1-1 ---');
{
  const old = cloneDeep(tree);
  tree = updateSelection(tree, '1-1-1');
  const changedRows = getChangedRows(old, tree);
  console.log('\nChanged Rows:\n' + changedRows);
  console.log('\nSelected State:');
  console.log(getSelectedState(tree));
  console.log('\nSelected Keys:');
  console.log(getSelectedKeys(tree));
}

// No exports — this script is intended to run directly with `node`.
