/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
var pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./TreeView/TreeViewControl.tsx":
/*!**************************************!*\
  !*** ./TreeView/TreeViewControl.tsx ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   TreeViewControl: () => (/* binding */ TreeViewControl)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _fluentui_react_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @fluentui/react-components */ \"@fluentui/react-components\");\n/* harmony import */ var _fluentui_react_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_fluentui_react_components__WEBPACK_IMPORTED_MODULE_1__);\n\n\n// Styles for layout and indentation\nvar useStyles = (0,_fluentui_react_components__WEBPACK_IMPORTED_MODULE_1__.makeStyles)({\n  innerWrapper: {\n    alignItems: \"start\",\n    columnGap: \"15px\",\n    display: \"flex\"\n  },\n  OuterWrapper: {\n    display: \"flex\",\n    flexDirection: \"column\",\n    rowGap: \"15px\",\n    minWidth: \"min-content\"\n  },\n  childTree: {\n    marginLeft: \"24px\" // Indentation for child nodes\n  }\n});\n// TreeViewControl renders a hierarchical tree with expand/collapse and configurable font size\nvar TreeViewControl = _ref => {\n  var {\n    data,\n    buttonSize,\n    treeSize,\n    fontSize\n  } = _ref;\n  var styles = useStyles();\n  // State to track which tree nodes are open\n  var [openItems, setOpenItems] = react__WEBPACK_IMPORTED_MODULE_0__.useState([]);\n  // Expands all nodes in the tree\n  var handleExpandAll = () => {\n    var collectKeys = (items, allKeysCollected) => {\n      items.forEach(item => {\n        allKeysCollected.push(item.key);\n        if (item.children && item.children.length > 0) {\n          collectKeys(item.children, allKeysCollected);\n        }\n      });\n    };\n    var allKeys = [];\n    collectKeys(data, allKeys);\n    setOpenItems(allKeys);\n  };\n  // Collapses all nodes in the tree\n  var handleCollapseAll = () => {\n    setOpenItems([]);\n  };\n  // Handles node open/close events\n  var handleOpenChange = (event, eventData) => {\n    setOpenItems(curr => eventData.open ? [...curr, eventData.value] : curr.filter(item => item !== eventData.value));\n  };\n  // Recursively renders tree items and their children\n  var renderTreeItems = items => {\n    return items.map(item => {\n      var _a;\n      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_fluentui_react_components__WEBPACK_IMPORTED_MODULE_1__.TreeItem, {\n        key: item.key,\n        value: item.key,\n        as: \"div\",\n        \"aria-label\": item.label,\n        itemType: item.children && item.children.length > 0 ? \"branch\" : \"leaf\"\n      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_fluentui_react_components__WEBPACK_IMPORTED_MODULE_1__.TreeItemLayout, {\n        title: (_a = item.tooltip) !== null && _a !== void 0 ? _a : undefined,\n        style: fontSize ? {\n          fontSize\n        } : undefined\n      }, item.label), item.children && item.children.length > 0 ? (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_fluentui_react_components__WEBPACK_IMPORTED_MODULE_1__.Tree, {\n        className: styles.childTree\n      }, renderTreeItems(item.children))) : null);\n    });\n  };\n  // Main render\n  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", {\n    className: styles.OuterWrapper\n  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"div\", {\n    className: styles.innerWrapper\n  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_fluentui_react_components__WEBPACK_IMPORTED_MODULE_1__.Button, {\n    size: buttonSize,\n    onClick: handleExpandAll\n  }, \"Expand all\"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_fluentui_react_components__WEBPACK_IMPORTED_MODULE_1__.Button, {\n    size: buttonSize,\n    onClick: handleCollapseAll\n  }, \"Collapse all\"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_fluentui_react_components__WEBPACK_IMPORTED_MODULE_1__.Tree, {\n    size: treeSize,\n    \"aria-label\": \"Default\",\n    appearance: \"subtle\",\n    openItems: openItems,\n    onOpenChange: handleOpenChange\n  }, renderTreeItems(data)));\n};\n\n//# sourceURL=webpack://pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad/./TreeView/TreeViewControl.tsx?\n}");

/***/ }),

/***/ "./TreeView/dataTransform.ts":
/*!***********************************!*\
  !*** ./TreeView/dataTransform.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getItemsArrayFromDataSet: () => (/* binding */ getItemsArrayFromDataSet)\n/* harmony export */ });\nfunction getItemsArrayFromDataSet(data) {\n  var itemMap = {};\n  var allItems = [];\n  // First, create all items and store in a map\n  Object.values(data.records).forEach(record => {\n    var keyVal = record.getFormattedValue(\"itemKey\");\n    var labelVal = record.getFormattedValue(\"itemLabel\");\n    var parentKeyVal = record.getFormattedValue(\"itemParentKey\");\n    var tooltipVal = record.getFormattedValue(\"itemTooltip\");\n    var item = {\n      key: keyVal,\n      label: labelVal,\n      parentKey: parentKeyVal,\n      tooltip: tooltipVal,\n      children: []\n    };\n    itemMap[item.key] = item;\n    allItems.push(item);\n  });\n  // Then, assign children to their parents\n  allItems.forEach(item => {\n    if (item.parentKey && itemMap[item.parentKey]) {\n      itemMap[item.parentKey].children.push(item);\n    }\n  });\n  // Return only root items (no parentKey)\n  return allItems.filter(item => !item.parentKey);\n}\n\n//# sourceURL=webpack://pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad/./TreeView/dataTransform.ts?\n}");

/***/ }),

/***/ "./TreeView/index.ts":
/*!***************************!*\
  !*** ./TreeView/index.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   TreeView: () => (/* binding */ TreeView)\n/* harmony export */ });\n/* harmony import */ var _TreeViewControl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TreeViewControl */ \"./TreeView/TreeViewControl.tsx\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _dataTransform__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dataTransform */ \"./TreeView/dataTransform.ts\");\n\n\n\nclass TreeView {\n  /**\n   * Empty constructor.\n   */\n  constructor() {\n    // Empty\n  }\n  /**\n   * Initializes the control instance. Called once when the control is created.\n   * @param context The property bag with all control properties and utilities.\n   * @param notifyOutputChanged Callback to notify framework of output changes.\n   * @param state Persistent state for the control instance.\n   */\n  init(context, notifyOutputChanged, state) {\n    this.notifyOutputChanged = notifyOutputChanged;\n  }\n  /**\n   * Called whenever the control needs to be re-rendered (property/data changes, resize, etc).\n   * Transforms the dataset and passes all properties to the React TreeViewControl.\n   * @param context The property bag with all control properties and utilities.\n   * @returns The root React element for rendering.\n   */\n  updateView(context) {\n    // Prepare props for the React TreeViewControl\n    var props = {\n      buttonSize: context.parameters.buttonSize.raw,\n      // Button size (small, medium, large)\n      data: (0,_dataTransform__WEBPACK_IMPORTED_MODULE_2__.getItemsArrayFromDataSet)(context.parameters.items),\n      // Hierarchical tree data\n      treeSize: context.parameters.treeSize.raw,\n      // Tree size (small, medium)\n      fontSize: context.parameters.fontSize.raw ? parseInt(context.parameters.fontSize.raw) : undefined // Font size for tree nodes\n    };\n    // Render the React component\n    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_TreeViewControl__WEBPACK_IMPORTED_MODULE_0__.TreeViewControl, props);\n  }\n  /**\n   * Returns outputs to the framework. Not used in this control.\n   */\n  getOutputs() {\n    return {};\n  }\n  /**\n   * Cleanup logic when the control is removed from the DOM.\n   */\n  destroy() {\n    // Cleanup if necessary\n  }\n}\n\n//# sourceURL=webpack://pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad/./TreeView/index.ts?\n}");

/***/ }),

/***/ "@fluentui/react-components":
/*!************************************!*\
  !*** external "FluentUIReactv940" ***!
  \************************************/
/***/ ((module) => {

module.exports = FluentUIReactv940;

/***/ }),

/***/ "react":
/*!***************************!*\
  !*** external "Reactv16" ***!
  \***************************/
/***/ ((module) => {

module.exports = Reactv16;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./TreeView/index.ts");
/******/ 	pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad = __webpack_exports__;
/******/ 	
/******/ })()
;
if (window.ComponentFramework && window.ComponentFramework.registerControl) {
	ComponentFramework.registerControl('PowerApps.PCF.Controls.TreeView', pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad.TreeView);
} else {
	var PowerApps = PowerApps || {};
	PowerApps.PCF = PowerApps.PCF || {};
	PowerApps.PCF.Controls = PowerApps.PCF.Controls || {};
	PowerApps.PCF.Controls.TreeView = pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad.TreeView;
	pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad = undefined;
}