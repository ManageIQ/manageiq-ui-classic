/* eslint-disable no-eval */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, TableCell, TextInput, Toggle, Link,
} from 'carbon-components-react';
import classNames from 'classnames';
import {
  CellAction, hasIcon, hasImage, hasButton, hasTextInput, hasToggle, hasLink, isObject, isArray, isNumber, decimalCount,
} from './helper';

const MiqTableCell = ({
  cell, onCellClick, row, truncate,
}) => {
  const longText = truncate && ((cell.value).length > 40);
  const veryLongText = truncate && ((cell.value).length > 300);

  const truncateClass = longText ? 'truncate_cell' : '';
  const wrapClass = longText ? 'white_space_normal' : '';
  const alignClass = longText ? 'vertical_align_top' : '';
  const longerTextClass = veryLongText ? 'truncate_longer_text' : '';

  const truncateText = (
    <span title={cell.value} className={classNames('bx--front-line', wrapClass, longerTextClass)}>
      {cell.value}
    </span>
  );
  const cellClass = classNames('cell', truncateClass, alignClass, cell.data.style_class);
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
  const cellImage = ({ image }) => {
    const altText = image.split('/').pop().split('.')[0];
    return (
      <div className={cellClass}>
        <img src={image} alt={altText} className="image" />
        {truncateText}
      </div>
    );
  };

  /** Fuction to render icon(s) in cell. */
  const renderIcon = (icon, style, showText) => {
    const hasBackground = Object.keys(style).includes('background');
    const styledIconClass = hasBackground ? 'styled_icon' : '';
    const longerTextClass = hasBackground && veryLongText ? 'styled_icon_margin' : '';
    return (
      <div className={cellClass}>
        {
          typeof (icon) === 'string'
            ? <i className={classNames('fa-lg', 'icon', icon, styledIconClass, longerTextClass)} style={style} />
            : icon.map((i, index) => <i className={classNames('fa-lg', 'icon', i)} key={index.toString()} />)
        }
        {showText && truncateText}
      </div>
    );
  };

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

  /** Function to execute a button click event
   * 'callbackAction' is added to row so that, the event can be executed within the parent component. eg: SettingsCompanyTags
   * the onClick property executes a javascript function. Eg: "miqOrderService(#{record.id}); in catalogs_helper.rb"
   * ToDo: 'onClick' can be removed and make use of the 'callbackAction', so that we can avoid the 'eval' feature.
  */
  const cellButtonEvent = (item, event) => {
    if (item.callback) {
      onCellClick({ ...row, callbackAction: item.callback }, CellAction.buttonCallback, event);
    } else {
      // eslint-disable-next-line no-unused-expressions
      (item.onclick ? eval(item.onclick) : undefined);
    }
  };

  /** Function to render a Button inside cell. */
  /** Button was used only for 'Services / Catalogs' & the miqOrderService() was directely called on its click event. */
  const cellButton = (item) => (
    <div className={cellClass}>
      <Button
        onClick={(e) => cellButtonEvent(item, e)}
        disabled={item.disabled}
        onKeyPress={(e) => cellButtonEvent(item, e)}
        tabIndex={0}
        size={item.size ? item.size : 'default'}
        title={item.title ? item.title : truncateText}
        kind={item.kind ? item.kind : 'primary'}
        className={classNames('miq-data-table-button', item.buttonClassName)}
      >
        {truncateText}
      </Button>
    </div>
  );

  /** Function to render a Text Box inside cell. */
  const cellTextInput = (item, id) => (
    <div className={cellClass}>
      <TextInput
        id={id}
        className={item.className}
        labelText={truncateText}
        placeholder={item.placeholder}
        defaultValue={item.value}
        invalid={item.invalid}
        invalidText={item.invalidText}
        type={item.type}
        readOnly={item.readonly}
        disabled={item.disabled}
        tabIndex={0}
        onChange={item.onchange}
      />
    </div>
  );

  /** Function to render a Toggle inside cell. */
  const cellToggle = (item, id) => (
    <div className={cellClass}>
      <Toggle
        id={id}
        labelText={truncateText}
        labelA={item.labelA}
        labelB={item.labelB}
        toggled={item.toggled}
        onToggle={() => (item.ontoggle() ? item.ontoggle() : undefined)}
        disabled={item.disabled}
        tabIndex={0}
      />
    </div>
  );

  /** Function to render a Link inside cell. */
  const cellLink = (item, _id) => (
    <div className={cellClass}>
      <Link href={item.href}>
        {item.label}
      </Link>
    </div>
  );

  /** Determines which component has to be rendered inside a cell.
   * Also to determine if a click event necesseary for a cell or its component . */
  const cellComponent = () => {
    const { data, id } = cell;
    const keys = Object.keys(data);
    const content = { component: '', cellClick: !!onCellClick, showText: true };
    if (isObject(data)) {
      if (isArray(data.text)) return { ...content, component: cellArrayList(data), cellClick: false };

      if (data.text && hasImage(keys, data)) return { ...content, component: cellImage(data) };

      const { showIcon, showText } = hasIcon(keys, data);
      if (showIcon) return { ...content, component: cellIcon(data, showText), showText };

      if (hasButton(keys)) return { ...content, component: cellButton(data), cellClick: false };

      if (hasToggle(keys)) return { ...content, component: cellToggle(data, id), cellClick: false };

      if (hasTextInput(keys)) return { ...content, component: cellTextInput(data, id), cellClick: false };

      if (hasLink(keys)) return { ...content, component: cellLink(data, id), cellClick: false };

      return { ...content, component: cellText() };
    }
    return { ...content, component: cellText() };
  };

  const { component, cellClick, showText } = cellComponent();

  return (
    <TableCell
      key={cell.id}
      onClick={(event) => cellClick && onCellClick(row, CellAction.itemClick, event)}
      className={classNames(showText ? '' : 'no_text', wrapClass ? 'vertical_align_top' : '')}
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
  truncate: PropTypes.bool,
};

MiqTableCell.defaultProps = {
  onCellClick: undefined,
  row: {},
  cell: {},
  truncate: true,
};
