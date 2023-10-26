import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { StructuredListBody, StructuredListRow } from 'carbon-components-react';
import { rowClickEvent } from '../helpers';
import MiqStructuredListBodyLabel from './miq-structured-list-body-label';
import MiqStructuredListBodyValue from './miq-structured-list-body-value';

const MiqStructuredListBody = ({
  rows, mode, onClick, clickEvents,
}) => {
  const list = (clickEvents ? rows.map((item) => item.cells) : rows);

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
          row.label && <MiqStructuredListBodyLabel label={row.label} />
        }
        <MiqStructuredListBodyValue row={row} onClick={onClick} clickEvents={clickEvents} />
      </StructuredListRow>
    );
  };

  return (
    <StructuredListBody>
      {
        list && list.length > 0 && list.map((row, index) => renderRow(row, index))
      }
    </StructuredListBody>
  );
};

export default MiqStructuredListBody;

MiqStructuredListBody.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.any),
  mode: PropTypes.string.isRequired,
  clickEvents: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

MiqStructuredListBody.defaultProps = {
  rows: undefined,
  onClick: undefined,
};
