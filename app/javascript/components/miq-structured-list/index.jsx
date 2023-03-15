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
import SummaryValue from './summary-value/summary-value';
import { rowClickEvent, hasClickEvents } from './helpers';
import NotificationMessage from '../notification-message';

const MiqStructuredList = ({
  title, headers, rows, mode, onClick, message,
}) => {
  const clickEvents = hasClickEvents(mode);
  const borderedList = ['simple_table', 'multilink_table'];
  const hasBorder = borderedList.includes(mode);

  /** Table object with key named 'cells' are extracted */
  const list = (clickEvents ? rows.map((item) => item.cells) : rows);

  const summaryLabel = (label) => <StructuredListCell className="label_header">{label}</StructuredListCell>;

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
        {row.label && summaryLabel(row.label)}
        <SummaryValue row={row} onClick={(event) => onClick(row, event)} />
      </StructuredListRow>
    );
  };

  /** Function to render the info notification message */
  const renderNotification = () => {
    const noticeMessage = message || sprintf(__('No entries found for %s'), title.toLowerCase());
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

  return (title && title.length > 1 ? accordionList() : simpleList());
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
