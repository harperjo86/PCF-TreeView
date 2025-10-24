import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { TreeViewControl } from "./TreeViewControl";
import { ITreeItem, transformData } from "./dataTransform";

export class TreeView implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _context!: ComponentFramework.Context<IInputs>;
  private _notifyOutputChanged!: () => void;
  private _container!: HTMLDivElement;
  private _treeData: ITreeItem[] = [];
  private _selectedKeys: string = "";
  private _selectedState: string = "";

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this._context = context;
    this._notifyOutputChanged = notifyOutputChanged;
    this._container = container;
    this._treeData = transformData(Object.values(this._context.parameters.items.records || {}));
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this._context = context;
    this._treeData = transformData(Object.values(context.parameters.items.records || {}));

    ReactDOM.render(
      React.createElement(TreeViewControl, {
        data: this._treeData,
        buttonSize: (context.parameters.buttonSize.raw ?? 'medium') as 'small' | 'medium' | 'large',
        treeSize: (context.parameters.treeSize.raw ?? 'medium') as 'small' | 'medium',
        fontSize: context.parameters.fontSize.raw ?? undefined,
            onSelectionChange: (updatedData: ITreeItem[], selectedKeys: string, selectedState: string) => {
              this._treeData = updatedData;
              this._selectedKeys = selectedKeys;
              this._selectedState = selectedState;
              this._notifyOutputChanged();
            }
      }),
      this._container
    );
  }

  public getOutputs(): IOutputs {
    return {
      selectedKeys: this._selectedKeys,
      selectedState: this._selectedState,
      // only selectedKeys is returned as an output
    };
  }

  public destroy(): void {
    ReactDOM.unmountComponentAtNode(this._container);
  }
}
