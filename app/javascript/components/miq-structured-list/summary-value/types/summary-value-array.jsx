/* eslint-disable no-eval */
import React from 'react';
import PropTypes from 'prop-types';
import { StructuredListCell } from 'carbon-components-react';
import classNames from 'classnames';
import SummaryValueItem from '../summary-value-item';
import SummaryValueItemContent from '../summary-value-item-content';
import CellText from '../../cell-items/cell-text';
import { isArray, isObject } from '../../helpers';

/** Component to render a list row value from Array. */
const SummaryValueArray = ({ row, onClick }) => {
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
      <SummaryValueItemContent row={value} />
    </div>
  );

  /** Function to render a list inside a cell */
  /** Usage eg: Control / Policies */
  const renderListItems = (item) => {
    if (isArray(item)) {
      return item.map((i, index) => (
        <div key={index.toString()}>
          { i.label && <div><b>{i.label}</b></div> }
          { isObject(i.value) ? listCellValue(i.value) : <CellText value={i.value} /> }
        </div>
      ));
    }
    return <CellText value={item} />;
  };

  return (
    row.map((i, index) => (
      <StructuredListCell
        key={index.toString()}
        onClick={() => i.onclick && eval(i.onclick)}
        className={classNames('content_value array_item', i && i.onclick && 'clickable')}
        title={i && i.title !== undefined ? i.title : ''}
      >
        {
          isObject(i) ? <SummaryValueItem row={i} onClick={(event) => onClick(event)} /> : renderListItems(i)
        }
      </StructuredListCell>
    ))
  );
};

export default SummaryValueArray;

SummaryValueArray.propTypes = {
  row: PropTypes.oneOfType([
    PropTypes.shape(PropTypes.any),
    PropTypes.array,
  ]).isRequired,
  onClick: PropTypes.func,
};

SummaryValueArray.defaultProps = {
  onClick: undefined,
};
