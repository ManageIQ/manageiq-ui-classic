import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
} from 'carbon-components-react';

const MiqStructuredList = ({
  title, headers, rows, mode, onClick,
}) => {
  const dataType = (data) => (data ? data.constructor.name.toString() : undefined);
  const isObject = (item) => dataType(item) === 'Object';
  const isArray = (item) => dataType(item) === 'Array';
  const isSubItem = (item) => item.sub_items && item.sub_items.length > 0;

  /** Function to render a header cell. */
  const renderHeaderItem = (header, index) => (
    <StructuredListCell head key={index} className="list_header">
      {header}
    </StructuredListCell>
  );

  /** Function to render the headers. */
  const renderHeader = () => (
    <StructuredListHead>
      <StructuredListRow head tabIndex={0}>
        {
          headers.map((header, index) => renderHeaderItem(header, index))
        }
      </StructuredListRow>
    </StructuredListHead>
  );

  /** Function to render an icon in the cell. */
  const renderIcon = (row) => (
    <div className={classNames('cell icon', row.background ? 'backgrounded-icon' : '')} title={row.title}>
      <i className={row.icon} title={row.title} style={{ background: row.background }} />
    </div>
  );

  /** Function to render an image in the cell. */
  const renderImage = (row) => (
    <div className="cell image" title={row.title}>
      <img src={row.image} alt={row.image} title={row.title} />
    </div>
  );

  /** Function to print the text value inside a cell. */
  const cellText = (value) => (value ? value.toString() : '');

  /** Usage eg: Services / Workloads / VMs & Instances / Normal Operating Ranges */
  const renderValueArray = (value) => {
    console.log('renderValueArray=', title, value);
    return (
      <div className="multi_row_cell">
        {value.map((item, index) => (
          <div className="sub_row_item" key={index.toString()}>
            {
              item.icon && renderIcon(item)
            }
            {
              item.label && <div className="sub_label">{item.label}</div>
            }
            <div className="sub_value">{cellText(item.value)}</div>
          </div>
        ))}
      </div>
    );
  };

  /** Function to print array of label text or just a text. */
  const renderValues = ({ value }) => (isArray(value) ? renderValueArray(value) : cellText(value));

  /** Function to render the items of cell */
  const renderContent = (row) => (
    <div className="content">
      {row.icon && renderIcon(row)}
      {row.image && renderImage(row)}
      {row.value && renderValues(row)}
    </div>
  );

  /** Function render an item with or without a link. */
  const renderRowItem = (row) => {
    const content = renderContent(row);
    return row.link
      ? <a href={row.link} onClick={(e) => onClick(row, e)} className="cell_link">{content}</a>
      : content;
  };

  /** Usage eg: Automation / Automate / Generic Objects / item
   * Properties has no links & Relationships have links */
  const renderObjectItem = (row) => {
    console.log('renderObjectRow=', title, row);
    return (
      <StructuredListCell className={classNames(row.label ? 'content_value' : 'label_header')}>
        {renderRowItem(row)}
      </StructuredListCell>
    );
  };

  /** Usage eg: Network / Security Groups / summary / Firewall rules */
  const renderArrayItems = (items) => {
    console.log('renderArrayRows=', items);
    return (
      items.map((i, index) => (
        <StructuredListCell className="content_value" key={index.toString()}>
          {
            isObject(i) ? renderRowItem(i) : cellText(i)
          }
        </StructuredListCell>
      ))
    );
  };

  const renderSubItems = (subItems) => {
    console.log('renderSubitems=', title, subItems);
    return (
      subItems.map((item) => (
        <StructuredListCell className="content_value sub_items">
          {renderRowItem(item)}
        </StructuredListCell>
      ))
    );
  };

  /** Function to render the label (left hand side of list) */
  const renderLabel = (label) => (
    <StructuredListCell className="label_header">
      {label}
    </StructuredListCell>
  );

  const renderRow = (row, index) => (
    <StructuredListRow tabIndex={index} key={index}>
      {
        row.label && renderLabel(row.label)
      }
      {
        isObject(row) && renderObjectItem(row)
      }
      {
        isArray(row) && renderArrayItems(row)
      }
      {
        isSubItem(row) && renderSubItems(row.sub_items)
      }
    </StructuredListRow>
  );

  return (
    <>
      <h3>{title}</h3>
      <StructuredListWrapper ariaLabel="Structured list" className={classNames('miq-structured-list', mode)}>
        {
          headers && headers.length > 0 && renderHeader()
        }
        <StructuredListBody>
          {
            rows && rows.length > 0 && rows.map((row, index) => renderRow(row, index))
          }
        </StructuredListBody>
      </StructuredListWrapper>
    </>
  );
};

export default MiqStructuredList;

MiqStructuredList.propTypes = {
  title: PropTypes.string.isRequired,
  headers: PropTypes.arrayOf(PropTypes.any),
  rows: PropTypes.arrayOf(PropTypes.any).isRequired,
  onClick: PropTypes.func,
  mode: PropTypes.string.isRequired,
};

MiqStructuredList.defaultProps = {
  headers: [],
  onClick: undefined,
};
