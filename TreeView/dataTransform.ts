export interface ITreeItem {
  key: string;
  label: string;
  parentKey?: string | null;
  tooltip?: string | null;
  children?: ITreeItem[];
}

export function getItemsArrayFromDataSet(
  data: ComponentFramework.PropertyTypes.DataSet
): ITreeItem[] {
  const itemMap: Record<string, ITreeItem> = {};
  const allItems: ITreeItem[] = [];

  // First, create all items and store in a map
  Object.values(data.records).forEach((record) => {
    const keyVal = record.getFormattedValue("itemKey");
    const labelVal = record.getFormattedValue("itemLabel");
    const parentKeyVal = record.getFormattedValue("itemParentKey");
    const tooltipVal = record.getFormattedValue("itemTooltip");
    const item: ITreeItem = {
      key: keyVal,
      label: labelVal,
      parentKey: parentKeyVal,
      tooltip: tooltipVal,
      children: [],
    };
    itemMap[item.key] = item;
    allItems.push(item);
  });

  // Then, assign children to their parents
  allItems.forEach((item) => {
    if (item.parentKey && itemMap[item.parentKey]) {
      itemMap[item.parentKey].children!.push(item);
    }
  });

  // Return only root items (no parentKey)
  return allItems.filter((item) => !item.parentKey);
}