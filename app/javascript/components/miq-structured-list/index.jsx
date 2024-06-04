import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { StructuredListWrapper, Accordion, AccordionItem } from 'carbon-components-react';
import MiqStructuredListMessage from './miq-structured-list-message';
import MiqStructuredListHeader from './miq-structured-list-header';
import MiqStructuredListBody from './miq-structured-list-body/miq-structured-list-body';

import { hasClickEvents } from './helpers';

/** Component to render the items in summary pages */
const MiqStructuredList = ({
  title, headers, rows, mode, onClick, message, className = '',
}) => {
  const clickEvents = hasClickEvents(mode);

  /** Function to render the structured list. */
  const renderList = (mode, headers) => (
    <StructuredListWrapper
      ariaLabel="Structured list"
      className={classNames('miq-structured-list', mode)}
    >
      {
        headers && headers.length > 0 && <MiqStructuredListHeader headers={headers} />
      }
      <MiqStructuredListBody mode={mode} rows={rows} onClick={onClick} clickEvents={clickEvents} />
    </StructuredListWrapper>
  );

  const simpleList = () => {
    const list = (clickEvents ? rows.map((item) => item.cells) : rows);
    return (list && list.length > 0
      ? renderList(mode, headers)
      : <MiqStructuredListMessage title={title} message={message} />);
  };

  const accordionList = () => (
    <Accordion align="start" className={classNames('miq-structured-list-accordion', mode, className)}>
      <AccordionItem title={title} open>
        {simpleList()}
      </AccordionItem>
    </Accordion>
  );

  return (title && title.length > 1 ? accordionList() : simpleList());
};

export default MiqStructuredList;

MiqStructuredList.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
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
