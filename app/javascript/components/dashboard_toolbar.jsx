/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, OverflowMenu, OverflowMenuItem,
} from '@carbon/react';
import { Add, ChevronDown, Reply } from '@carbon/react/icons';
import { carbonizeIcon } from '../menu/icon';

const addClick = (item) =>
  window.miqJqueryRequest(`/dashboard/widget_add?widget=${item.id}`, { beforeSend: true, complete: true });

const resetClick = () => {
  /* eslint no-alert: off */
  if (window.confirm(__("Are you sure you want to reset this Dashboard's Widgets to the defaults?"))) {
    window.miqJqueryRequest('/dashboard/reset_widgets', { beforeSend: true });
  }
};

const resetButton = () => (
  <Button
    id="reset-dashboard-button"
    kind="ghost"
    hasIconOnly
    iconDescription={__('Reset Dashboard Widgets to the default')}
    onClick={resetClick}
    size="md"
    renderIcon={() => <Reply size={18} />}
  />
);

const closeFunc = () => {
  document.getElementById('dashboard-add-widget-menu').focus();
};

const MenuIcon = (props) => {
  const icon = props.image;
  const IconElement = carbonizeIcon(icon, 24);
  if (icon) {
    return (
      <div className="dashboard-toolbar-option-with-icon">
        <div className="option-icon">
          <IconElement aria-label={icon} />
        </div>
        <div className="option-text">
          {props.text}
        </div>
      </div>
    );
  }
  return (
    <div>
      <span>{props.text}</span>
    </div>
  );
};

MenuIcon.propTypes = {
  image: PropTypes.string,
  text: PropTypes.string,
};

MenuIcon.defaultProps = {
  image: undefined,
  text: undefined,
};

const addMenu = (items, locked) => {
  const title = locked
    ? __('Cannot add a Widget, this Dashboard has been locked by the Administrator')
    : __('Add widget');
  const buttonName = __('Add widget');

  return (
    <OverflowMenu
      aria-label={title}
      id="dashboard-add-widget-menu"
      floatingmenu="true"
      disabled={locked}
      title={title}
      onClose={closeFunc}
      menuOptionsClass="scrollable-options"
      renderIcon={(props) => (
        <div className="toolbar-dashboard">
          <span>{buttonName}</span>
          <ChevronDown size={20} {...props} />
        </div>
      )}
    >
      { items.map((item) => (
        <OverflowMenuItem
          className="scrollable-menu"
          key={item.id}
          aria-label={item.title}
          hasDivider={(item.type === 'separator')}
          disabled={(item.type === 'separator')}
          itemText={<MenuIcon image={item.image} text={item.text} />}
          title={item.title ? item.title : null}
          requireTitle
          onClick={(item.type !== 'separator') ? (() => addClick(item)) : null}
        />

      )) }
    </OverflowMenu>
  );
};

const renderDisabled = () => (
  <div className="disabled-button" title={__('No Widgets available to add')}>
    <Button
      size="sm"
      hasIconOnly
      disabled
      iconDescription={__('Add')}
      renderIcon={() => <Add size={20} />}
    />
  </div>
);

const DashboardToolbar = (props) => {
  const {
    items, allowAdd, allowReset, locked,
  } = props;

  const renderContent = () => (
    <>
      { allowAdd && addMenu(items, locked) }
      { allowReset && resetButton() }
    </>
  );

  return (
    <div className="toolbar-pf-actions miq-toolbar-actions">
      <div className="miq-toolbar-group form-group">
        { items.length === 0 ? renderDisabled() : renderContent() }
      </div>
    </div>
  );
};

DashboardToolbar.propTypes = {
  allowAdd: PropTypes.bool.isRequired,
  allowReset: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    type: PropTypes.string,
    image: PropTypes.string,
    text: PropTypes.string,
  })).isRequired,
  locked: PropTypes.bool.isRequired,
};

export default DashboardToolbar;
