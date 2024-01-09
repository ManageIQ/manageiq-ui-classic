/* eslint-disable no-eval */
import { TreeViewRedux } from '../tree-view';
import CatalogResource from '../data-tables/catalog-resource';
import MiqDataTable from '../miq-data-table';
import XmlHolder from '../XmlHolder';

export const InputTypes = {
  TEXTAREA: 'text_area',
  CHECKBOX: 'checkbox',
  COMPONENT: 'component',
  DROPDOWN: 'dropdown',
  CODEMIRROR: 'code_mirror',
  MARKDOWN: 'markdown',
};

export const DynamicReactComponents = {
  TREE_VIEW_REDUX: TreeViewRedux,
  CATALOG_RESOURCE: CatalogResource,
  MIQ_DATA_TABLE: MiqDataTable,
  XML_HOLDER: XmlHolder,
};

const dataType = (data) => (data ? data.constructor.name.toString() : undefined);

export const isObject = (item) => dataType(item) === 'Object';

export const isArray = (item) => dataType(item) === 'Array';

export const isSubItem = (item) => item.sub_items && item.sub_items.length > 0;

/** When the props named mode includes 'miq_summary', then then summary contains row/cell click events. */
export const hasClickEvents = (mode) => mode.includes('miq_summary');

export const hasInput = (item) => item && Object.keys(item).includes('input');

export const rowClickEvent = (rows, index) => {
  const item = rows[index];
  if (item && item.onclick) {
    miqSparkleOn();
    eval(item.onclick);
    miqSparkleOff();
  }
};
