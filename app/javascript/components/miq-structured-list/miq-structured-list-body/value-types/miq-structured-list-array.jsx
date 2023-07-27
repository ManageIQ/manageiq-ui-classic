/* eslint-disable no-eval */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { StructuredListCell } from 'carbon-components-react';
import { isObject, isArray } from '../../helpers';
import MiqStructuredListText from '../value-tags/miq-structured-list-text';
import MiqStructuredListContent from '../miq-structured-list-content';
import MiqStructuredListConditionalTag from '../value-tags/miq-structured-list-conditional-tag';

/** Usage eg: Network / Security Groups / summary / Firewall rules */
const MiqStructuredListArray = ({ row, onClick, clickEvents }) => {
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
      <MiqStructuredListContent row={value} />
    </div>
  );

  /** Usage eg: Control / Policies */
  const renderListItems = (row) => {
    if (isArray(row)) {
      return row.map((row, index) => (
        <div key={index.toString()}>
          {
            row.label && <div><b>{row.label}</b></div>
          }
          {
            isObject(row.value) ? listCellValue(row.value) : <MiqStructuredListText value={row.value} />
          }
        </div>
      ));
    }
    return <MiqStructuredListText value={row} />;
  };

  return row.map((row, index) => (
    <StructuredListCell
      key={index.toString()}
      onClick={() => row.onclick && eval(row.onclick)}
      className={classNames('content_value array_item', row && row.onclick && 'clickable')}
      title={row && row.title !== undefined ? row.title : ''}
    >
      {
        isObject(row)
          ? <MiqStructuredListConditionalTag row={row} onClick={onClick} clickEvents={clickEvents} />
          : renderListItems(row)
      }
    </StructuredListCell>
  ));
};

export default MiqStructuredListArray;

MiqStructuredListArray.propTypes = {
  row: PropTypes.arrayOf(PropTypes.any).isRequired,
  clickEvents: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

MiqStructuredListArray.defaultProps = {
  onClick: undefined,
};
