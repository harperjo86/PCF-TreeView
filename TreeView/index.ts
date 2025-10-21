// PCF control entry point for the TreeView React component
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { TreeViewControl, ITreeViewControlProps } from "./TreeViewControl";
import * as React from "react";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import { getItemsArrayFromDataSet } from "./dataTransform";
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class TreeView
  implements ComponentFramework.ReactControl<IInputs, IOutputs>
{
  private notifyOutputChanged: () => void;

  /**
   * Empty constructor.
   */
  constructor() {
    // Empty
  }

  /**
   * Initializes the control instance. Called once when the control is created.
   * @param context The property bag with all control properties and utilities.
   * @param notifyOutputChanged Callback to notify framework of output changes.
   * @param state Persistent state for the control instance.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
  }

  /**
   * Called whenever the control needs to be re-rendered (property/data changes, resize, etc).
   * Transforms the dataset and passes all properties to the React TreeViewControl.
   * @param context The property bag with all control properties and utilities.
   * @returns The root React element for rendering.
   */
  public updateView(
    context: ComponentFramework.Context<IInputs>
  ): React.ReactElement {
    // Prepare props for the React TreeViewControl
    const props: ITreeViewControlProps = {
      buttonSize: context.parameters.buttonSize.raw, // Button size (small, medium, large)
      data: getItemsArrayFromDataSet(context.parameters.items), // Hierarchical tree data
      treeSize: context.parameters.treeSize.raw, // Tree size (small, medium)
      fontSize: context.parameters.fontSize.raw
        ? parseInt(context.parameters.fontSize.raw)
        : undefined, // Font size for tree nodes
    };
    // Render the React component
    return React.createElement(TreeViewControl, props);
  }

  /**
   * Returns outputs to the framework. Not used in this control.
   */
  public getOutputs(): IOutputs {
    return {};
  }

  /**
   * Cleanup logic when the control is removed from the DOM.
   */
  public destroy(): void {
    // Cleanup if necessary
  }
}