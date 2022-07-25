import React from 'react';
import PropTypes from 'prop-types';
import { Button, TableCell } from 'carbon-components-react';
import classNames from 'classnames';
import {
  CellAction, hasIcon, hasImage, hasButton, isObject, isArray, isNumber, decimalCount,
} from './helper';

const MiqTableCell = ({
  cell, onCellClick, row,
}) => {
  const truncateText = <span title={cell.value} className="bx--front-line">{cell.value}</span>;
  const truncateClass = ((cell.value).length > 40) ? 'truncate_cell' : '';
  const cellClass = classNames('cell', truncateClass, cell.data.style_class);
  const cellText = () => (
    <div className={cellClass}>
      {truncateText}
    </div>
  );

  /** Function to print a number with decimal. */
  const renderArrayListItem = (item) => {
    if (isNumber(item)) {
      return decimalCount(item) >= 2 ? item : parseFloat(item).toFixed(1);
    }
    return item;
  };

  /** Function to render a list within a table cell.
   * Usage eg: Overview / Chargeback / Rates / Item (Summary)
  */
  const cellArrayList = (data) => (
    data && data.text && (
      <div className="cell">
        <div className="array_list">
          {
            data.text.map((item, index) => (
              <div className={classNames('list_row')} key={index.toString()}>
                {renderArrayListItem(item)}
              </div>
            ))
          }
        </div>
      </div>
    )
  );

  /** Function to render an image in cell. */
  const cellImage = (item) => (
    <div className={cellClass}>
      <img src={item.image} alt={item.image} className="image" />
      {truncateText}
    </div>
  );

  /** Fuction to render icon(s) in cell. */
  const renderIcon = (icon, style, showText) => (
    <div className={cellClass}>
      {
        typeof (icon) === 'string'
          ? <i className={classNames('fa-lg', 'icon', icon)} style={style} />
          : icon.map((i, index) => <i className={classNames('fa-lg', 'icon', i)} key={index.toString()} />)
      }
      {showText && truncateText}
    </div>
  );

  /** Fuction to render an icon in cell based on the 'type' in 'item'. */
  const cellIcon = (item, showText) => {
    if (showText) {
      const color = item.props ? item.props.style : {};
      const iconStyle = item.background ? { background: item.background, color: '#FFF' } : color;
      return renderIcon(item.icon, iconStyle, showText);
    }
    const { className, style } = item.props ? item.props : { className: item.icon, style: { color: '#000' } };
    return renderIcon(className, style, showText);
  };

  /** Function to render a Button inside cell. */
  /** Button was used only for 'Services / Catalogs' & the miqOrderService() was directely called on its click event. */
  /* eslint-disable no-eval */
  const cellButton = (item) => (
    <div className={cellClass}>
      <Button
        onClick={() => (item.onclick ? eval(item.onclick) : undefined)}
        disabled={item.disabled}
        onKeyPress={() => (item.onclick ? eval(item.onclick) : undefined)}
        tabIndex={0}
      >
        {truncateText}
      </Button>
    </div>
  );

  /** Determines which component has to be rendered inside a cell.
   * Also to determine if a click event necesseary for a cell or its component . */
  const cellComponent = () => {
    const { data } = cell;
    const keys = Object.keys(data);
    const content = { component: '', cellClick: !!onCellClick, showText: true };
    if (isObject(data)) {
      if (isArray(data.text)) return { ...content, component: cellArrayList(data), cellClick: false };

      if (data.text && hasImage(keys, data)) return { ...content, component: cellImage(data) };

      const { showIcon, showText } = hasIcon(keys, data);
      if (showIcon) return { ...content, component: cellIcon(data, showText), showText };

      if (hasButton(keys)) return { ...content, component: cellButton(data), cellClick: false };

      return { ...content, component: cellText() };
    }
    return { ...content, component: cellText() };
  };

  const { component, cellClick, showText } = cellComponent();

  return (
    <TableCell
      key={cell.id}
      onClick={(event) => cellClick && onCellClick(row, CellAction.itemClick, event)}
      className={classNames(showText ? '' : 'no_text')}
    >
      {component}
    </TableCell>
  );
};

export default MiqTableCell;

MiqTableCell.propTypes = {
  onCellClick: PropTypes.func,
  row: PropTypes.shape({}),
  cell: PropTypes.shape({
    id: PropTypes.string,
    value: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.any,
    clickable: PropTypes.bool,
  }),
};

MiqTableCell.defaultProps = {
  onCellClick: undefined,
  row: {},
  cell: {},
};
