import React from 'react';
import PropTypes from 'prop-types';
import { OverflowMenu, OverflowMenuItem } from 'carbon-components-react';
import { ChevronDown20 } from '@carbon/icons-react';

const addClick = (item) =>
  window.miqJqueryRequest(`widget_add?widget=${item.id}`, { beforeSend: true, complete: true });

const resetClick = () => {
  /* eslint no-alert: off */
  if (window.confirm(__("Are you sure you want to reset this Dashboard's Widgets to the defaults?"))) {
    window.miqJqueryRequest('reset_widgets', { beforeSend: true });
  }
};

const resetButton = () => (
  <button
    type="button"
    className="btn btn-default refresh_button"
    title={__('Reset Dashboard Widgets to the defaults')}
    onClick={resetClick}
  >
    <i className="fa fa-reply fa-lg" />
  </button>
);

const closeFunc = () => {
  document.getElementById('dropdown-custom-2').focus();
};

const MenuIcon = (props) => (
  <div>
    { props.image && <i className={props.image} /> }
    &nbsp;
    <span>{ props.text }</span>
  </div>
);

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
    : __('Add a widget');
  const buttonName = __('Add widget');

  return (
    <OverflowMenu
      ariaLabel={title}
      id="dropdown-custom-2"
      floatingmenu="true"
      disabled={locked}
      title={title}
      onClose={closeFunc}
      menuOptionsClass="scrollable-options"
      renderIcon={() => (
        <div className="toolbar-dashboard">
          <span>{buttonName}</span>
          <ChevronDown20 />
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
  <div className="btn-group.dropdown">
    <button
      type="button"
      className="disabled btn btn-default dropdown-toggle"
      title={__('No Widgets available to add')}
    >
      <i className="fa fa-plus fa-lg" />
      <span className="caret" />
    </button>
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
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  locked: PropTypes.bool.isRequired,
};

export default DashboardToolbar;
