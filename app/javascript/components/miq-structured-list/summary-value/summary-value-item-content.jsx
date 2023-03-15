import React from 'react';
import classNames from 'classnames';
import CellButton from '../cell-items/cell-button';
import CellIcon from '../cell-items/cell-icon';
import CellText from '../cell-items/cell-text';
import CellImage from '../cell-items/cell-image';
import { isArray, rowProps } from '../helpers';

const SummaryValueItemContent = ({ row }) => {
  /** Function to render an expansion right arrow which toggles to down arrow on its click event. */
  /** Usage eg: Compute / Container / Container Builds */
  const renderExpand = () => <div className="pull-right" />;

  /** Usage eg: Services / Workloads / VMs & Instances / Normal Operating Ranges */
  const renderValueArray = (value) => (
    <div className="multi_row_cell">
      {value.map((item, index) => (
        <div
          className="sub_row_item"
          key={index.toString()}
          title={item.title ? item.title : ''}
        >
          { item.icon && <CellIcon row={item} />}
          { item.label && <div className="sub_label" title={item.label}>{item.label}</div> }
          { item.value && <div className="sub_value"><CellText value={item.value} /></div> }
        </div>
      ))}
    </div>
  );

  /** Function to print array of label text or just a text. */
  const renderValues = ({ value }) => (isArray(value)
    ? renderValueArray(value)
    : <CellText value={value} />);

  return (
    <div className={classNames('content', row.bold ? 'label_header' : '', row.style)}>
      {row.icon && <CellIcon row={row} />}
      {row.image && <CellImage row={row} />}
      {row.button && <CellButton row={row} />}
      {renderValues(row)}
      {row.expandable && renderExpand(row)}
    </div>
  );
};

export default SummaryValueItemContent;

SummaryValueItemContent.propTypes = {
  row: rowProps,
};

SummaryValueItemContent.defaultProps = {
  row: {
    icon: undefined,
    image: undefined,
    button: undefined,
    expandable: undefined,
    bold: undefined,
    style: undefined,
    link: undefined,
    value: undefined,
    label: undefined,
    sub_items: undefined,
  },
};
