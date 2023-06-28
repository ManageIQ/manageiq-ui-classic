/* eslint-disable no-eval */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Button,
  StructuredListWrapper,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
  Accordion,
  AccordionItem,
  Link,
} from 'carbon-components-react';

import MiqStructuredListHeader from './miq-structured-list-header';
import MiqStructuredListInputs from './miq-structured-list-inputs';
import {
  rowClickEvent, isObject, isArray, isSubItem, hasClickEvents, hasInput,
} from './helpers';
import NotificationMessage from '../notification-message';

const MiqStructuredList = ({
  title, headers, rows, mode, onClick, message,
}) => {
  const clickEvents = hasClickEvents(mode);

  /** Function to render an icon in the cell. */
  const renderIcon = (row) => (
    <div className={classNames('cell icon', row.background ? 'backgrounded-icon' : '')} title={row.title}>
      <i className={row.icon} title={row.title} style={{ background: row.background, color: row.color }} />
    </div>
  );

  /** Function to render an image in the cell. */
  const renderImage = (row) => (
    <div className="cell image" title={row.title}>
      <img src={row.image} alt={row.image} title={row.title} />
    </div>
  );

  /** Function to render a button in the cell. */
  const renderButton = ({ button: { action, name, disabled } }) => (
    <div className="cell button_wrapper">
      <Button
        kind="primary"
        title={name}
        onClick={() => !disabled && eval(action)}
        disabled={disabled}
      >
        {name}
      </Button>
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
    <div className={classNames('content', row.bold ? 'label_header' : '', row.style)}>
      {row.icon && renderIcon(row)}
      {row.image && renderImage(row)}
      {row.button && renderButton(row)}
      {renderValues(row)}
      {row.expandable && renderExpand(row)}
    </div>
  );

  /** Function to render textarea / checkbox / react components */
  const renderInputContent = ({ value }) => <MiqStructuredListInputs value={value} action={(data) => onClick(data)} />;

  /** Function to include content for mode that contains miq summary
   * if only link is passed as props we render Link with href tag
   * if link as well as onclcik is passed as props we render Link with onclick function and without href
  */
  const renderLinkWithHrefOrOnclickForMiqSummary = (row, content) => {
    if (row.link && row.onclick) {
      return <Link to={row.link} onClick={() => eval(row.onclick)} className="cell_link">{content}</Link>;
    } if (row.link) {
      return <Link href={row.link} to={row.link} className="cell_link">{content}</Link>;
    }
    return content;
  };

  const renderMultiContents = (row) => {
    const content = renderContent(row);
    if (clickEvents) {
      return renderLinkWithHrefOrOnclickForMiqSummary(row, content);
    }
    return row.link
      ? <Link href={row.link} to={row.link} onClick={(e) => onClick(row, e)} className="cell_link">{content}</Link>
      : content;
  };

  /** Function render an item with or without a link. */
  const renderRowItem = (row) => (hasInput(row.value) ? renderInputContent(row) : renderMultiContents(row));

  /** Usage eg: Automation / Embeded Automate / Generic Objects / item
   * Properties has no links & Relationships have links */
  const renderObjectItem = (row) => (
    <StructuredListCell
      className={classNames(row.label ? 'content_value' : 'label_header', 'object_item')}
      title={row && row.title !== undefined ? row.title : ''}
    >
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
    const noticeMessage = message || sprintf(__('No entries found for %s'), title.toLowerCase());
    return (
      <div className="miq-structured-list-notification">
        <NotificationMessage type="info" message={noticeMessage} />
      </div>
    );
  };

  /** Function to render the structured list. */
  const renderList = (mode, headers, list) => (
    <StructuredListWrapper
      ariaLabel="Structured list"
      className={classNames('miq-structured-list', mode)}
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

  const simpleList = () => (list && list.length > 0
    ? renderList(mode, headers, list)
    : renderNotification());

  const accordionList = () => (
    <Accordion align="start" className={classNames('miq-structured-list-accordion', mode)}>
      <AccordionItem title={title} open>
        {simpleList()}
      </AccordionItem>
    </Accordion>
  );

  return (
    title && title.length > 1
      ? accordionList()
      : simpleList()
  );
};

export default MiqStructuredList;

MiqStructuredList.propTypes = {
  title: PropTypes.string,
  headers: PropTypes.arrayOf(PropTypes.any),
  rows: PropTypes.arrayOf(PropTypes.any),
  onClick: PropTypes.func,
  mode: PropTypes.string.isRequired,
  message: PropTypes.string,
};

MiqStructuredList.defaultProps = {
  title: '',
  headers: [],
  onClick: undefined,
  message: '' || undefined,
  rows: [],
};
