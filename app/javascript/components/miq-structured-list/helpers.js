/* eslint-disable no-eval */
import PropTypes from 'prop-types';
import { TreeViewRedux } from '../tree-view';
import CatalogResource from '../data-tables/catalog-resource';
import MiqDataTable from '../miq-data-table';

export const InputTypes = {
  TEXTAREA: 'text_area',
  CHECKBOX: 'checkbox',
  COMPONENT: 'component',
  DROPDOWN: 'dropdown',
};

export const DynamicReactComponents = {
  TREE_VIEW_REDUX: TreeViewRedux,
  CATALOG_RESOURCE: CatalogResource,
  MIQ_DATA_TABLE: MiqDataTable,
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

export const valueProps = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.array,
  PropTypes.bool,
  PropTypes.shape({}),
]);

export const rowProps = PropTypes.shape({
  icon: PropTypes.string,
  image: PropTypes.string,
  button: PropTypes.string,
  expandable: PropTypes.bool,
  bold: PropTypes.bool,
  style: PropTypes.string,
  link: PropTypes.string,
  value: valueProps,
  label: PropTypes.string,
  sub_items: PropTypes.arrayOf(PropTypes.any),
});
