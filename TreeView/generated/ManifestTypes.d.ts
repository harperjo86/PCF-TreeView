/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    buttonSize: ComponentFramework.PropertyTypes.EnumProperty<"small" | "medium" | "large">;
    treeSize: ComponentFramework.PropertyTypes.EnumProperty<"small" | "medium">;
    fontSize: ComponentFramework.PropertyTypes.WholeNumberProperty;
    items: ComponentFramework.PropertyTypes.DataSet;
}
export interface IOutputs {
    selectedKeys?: string;
    changedRows?: string;
}
