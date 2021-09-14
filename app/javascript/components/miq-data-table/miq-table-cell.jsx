import React from 'react';
import PropTypes from 'prop-types';
import { Button, TableCell } from 'carbon-components-react';
import classNames from 'classnames';
import {
  CellAction, hasIcon, hasImage, hasButton, isObject,
} from './helper';

const MiqTableCell = ({
  cell, onCellClick, row,
}) => {
  const truncateText = <span title={cell.value} className="bx--front-line">{cell.value}</span>;
  const truncateClass = ((cell.value).length > 40) ? 'truncate_cell' : '';
  const cellClass = classNames('cell', truncateClass);

  const cellText = () => (
    <div className={cellClass}>
      {truncateText}
    </div>
  );

  /** Function to render an image in cell. */
  const cellImage = (item) => (
    <div className={cellClass}>
      <img src={item.image} alt={item.image} className="image" />
      {truncateText}
    </div>
  );

  /** Fuction to render an icon in cell. */
  const renderIcon = (icon, style, showText) => (
    <div className={classNames(cellClass, (!showText ? 'only_icon' : ''))}>
      <i className={classNames('fa-lg', 'icon', icon)} style={style} />
      {showText && truncateText}
    </div>
  );

  /** Fuction to render an icon in cell based on the 'type' in 'item'. */
  const cellIcon = (item, showText) => {
    if (showText) {
      const iconStyle = item.background ? { background: item.background, color: '#FFF' } : { color: '#000' };
      return renderIcon(item.icon, iconStyle, showText);
    }
    const { className, style } = item.props;
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
    if (isObject(data)) {
      if (hasImage(keys, data)) {
        return { component: cellImage(data), cellClick: true };
      }
      const { showIcon, showText } = hasIcon(keys, data);
      if (showIcon) {
        return { component: cellIcon(data, showText), cellClick: true };
      }
      if (hasButton(keys)) {
        return { component: cellButton(data), cellClick: false };
      }
      return { component: cellText(), cellClick: true };
    }

    return { component: cellText(), cellClick: true };
  };

  const { component, cellClick } = cellComponent();

  return (
    <TableCell
      key={cell.id}
      onClick={(event) => cellClick && onCellClick(row, CellAction.itemClick, event)}
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
