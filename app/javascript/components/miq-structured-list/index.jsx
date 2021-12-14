/* eslint-disable no-eval */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  StructuredListWrapper,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
  Accordion,
  AccordionItem,
} from 'carbon-components-react';
import MiqStructuredListHeader from './miq-structured-list-header';
import {
  rowClickEvent, isObject, isArray, isSubItem, hasClickEvents,
} from './helpers';
import NotificationMessage from '../notification-message';

const MiqStructuredList = ({
  title, headers, rows, mode, onClick, message,
}) => {
  const clickEvents = hasClickEvents(mode);

  const borderedList = ['simple_table', 'multilink_table'];

  const hasBorder = borderedList.includes(mode);

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
  const renderText = (value) => {
    const text = (value === null || value === undefined ? '' : String(value));
    return (
      <div className={classNames(text ? 'expand' : '', 'wrap_text')}>
        {text}
      </div>
    );
  };

  /** Usage eg: Services / Workloads / VMs & Instances / Normal Operating Ranges */
  const renderValueArray = (value) => (
    <div className="multi_row_cell">
      {value.map((item, index) => (
        <div
          className="sub_row_item"
          key={index.toString()}
          title={item.title ? item.title : ''}
        >
          {
            item.icon && renderIcon(item)
          }
          {
            item.label && <div className="sub_label" title={item.label}>{item.label}</div>
          }
          <div className="sub_value">{renderText(item.value)}</div>
        </div>
      ))}
    </div>
  );

  /** Function to print array of label text or just a text. */
  const renderValues = ({ value }) => (isArray(value) ? renderValueArray(value) : renderText(value));

  /** Function to render an expansion right arrow which toggles to down arrow on its click event. */
  /** Usage eg: Compute / Container / Container Builds */
  const renderExpand = () => <div className="pull-right" />;

  /** Function to render the items of cell */
  const renderContent = (row) => (
    <div className={classNames('content', row.bold ? 'label_header' : '')}>
      {row.icon && renderIcon(row)}
      {row.image && renderImage(row)}
      {renderValues(row)}
      {row.expandable && renderExpand(row)}
    </div>
  );

  /** Function render an item with or without a link. */
  const renderRowItem = (row) => {
    const content = renderContent(row);
    return row.link
      ? <a href={row.link} onClick={(e) => onClick(row, e)} className="cell_link">{content}</a>
      : content;
  };

  /** Usage eg: Automation / Embeded Automate / Generic Objects / item
   * Properties has no links & Relationships have links */
  const renderObjectItem = (row) => (
    <StructuredListCell className={classNames(row.label ? 'content_value' : 'label_header', 'object_item')}>
      {renderRowItem(row)}
    </StructuredListCell>
  );

  /** Function to render a list item inside a cell */
  /** Usage eg: Control / Policies / Events */
  const listCellValue = (value) => (
    <div
      className={classNames('list_cell', value.onclick ? 'clickable' : '')}
      onClick={() => value.onclick && eval(value.onclick)}
      role="button"
      tabIndex={0}
      onKeyDown={() => value.onclick && eval(value.onclick)}
      title={value.title ? value.title : ''}
    >
      {renderContent(value)}
    </div>
  );

  /** Function to render a list inside a cell */
  /** Usage eg: Control / Policies */
  const renderListItems = (item) => {
    if (isArray(item)) {
      return item.map((i, index) => (
        <div key={index.toString()}>
          {
            i.label && <div><b>{i.label}</b></div>
          }
          {
            isObject(i.value) ? listCellValue(i.value) : renderText(i.value)
          }
        </div>
      ));
    }
    return renderText(item);
  };

  /** Usage eg: Network / Security Groups / summary / Firewall rules */
  const renderArrayItems = (items) => (
    items.map((i, index) => (
      <StructuredListCell
        key={index.toString()}
        onClick={() => i.onclick && eval(i.onclick)}
        className={classNames('content_value array_item', i && i.onclick && 'clickable')}
        title={i && i.title !== undefined ? i.title : ''}
      >
        {
          isObject(i) ? renderRowItem(i) : renderListItems(i)
        }
      </StructuredListCell>
    ))
  );

  /** Function to render additional columns. */
  const renderSubItems = (subItems) => (
    subItems.map((item, index) => (
      <StructuredListCell className="content_value sub_items" key={index.toString()}>
        {renderRowItem(item)}
      </StructuredListCell>
    ))
  );

  /** Function to render the label (left hand side of list) */
  const renderLabel = (label) => (
    <StructuredListCell className="label_header">
      {label}
    </StructuredListCell>
  );

  const renderRow = (row, index) => {
    const canClick = !!(rows[index] && rows[index].onclick);
    return (
      <StructuredListRow
        tabIndex={index}
        key={index}
        onClick={() => canClick && rowClickEvent(rows, index, mode)}
        className={classNames(canClick ? 'clickable' : '')}
        title={canClick ? rows[index].title : ''}
      >
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
  };

  /** Table object with key named 'cells' are extracted */
  const list = (clickEvents ? rows.map((item) => item.cells) : rows);

  /** Function to render the info notification message */
  const renderNotification = () => {
    const noticeMessage = message || __(`No entries found for ${title.toLowerCase()}`);
    return (
      <NotificationMessage type="info" message={noticeMessage} />
    );
  };

  /** Function to render the structured list. */
  const renderList = (mode, headers, list) => {
    const border = hasBorder ? 'bordered-list' : '';
    return (
      <StructuredListWrapper
        ariaLabel="Structured list"
        className={classNames('miq-structured-list', border, mode)}
      >
        {
          headers && headers.length > 0 && <MiqStructuredListHeader headers={headers} />
        }
        <StructuredListBody>
          {
            list && list.length > 0 && list.map((row, index) => renderRow(row, index))
          }
        </StructuredListBody>
      </StructuredListWrapper>
    );
  };

  return (
    <Accordion align="start" className={classNames('miq-structured-list-accordion', mode)}>
      <AccordionItem title={title} open>
        {
          list && list.length > 0
            ? renderList(mode, headers, list)
            : renderNotification()
        }
      </AccordionItem>
    </Accordion>
  );
};

export default MiqStructuredList;

MiqStructuredList.propTypes = {
  title: PropTypes.string.isRequired,
  headers: PropTypes.arrayOf(PropTypes.any),
  rows: PropTypes.arrayOf(PropTypes.any).isRequired,
  onClick: PropTypes.func,
  mode: PropTypes.string.isRequired,
  message: PropTypes.string,
};

MiqStructuredList.defaultProps = {
  headers: [],
  onClick: undefined,
  message: '' || undefined,
};
