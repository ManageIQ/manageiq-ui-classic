import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'patternfly-react';

const addClick = item =>
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
    className="btn btn-default"
    title={__('Reset Dashboard Widgets to the defaults')}
    onClick={resetClick}
  >
    <i className="fa fa-reply fa-lg" />
  </button>
);

const addMenu = (items, locked) => {
  const title = locked
    ? __('Cannot add a Widget, this Dashboard has been locked by the Administrator')
    : __('Add a widget');

  return (
    <Dropdown id="dropdown-custom-2" disabled={locked}>
      <Dropdown.Toggle title={title}>
        <span className="fa fa-plus fa-lg" />
      </Dropdown.Toggle>
      <Dropdown.Menu className="scrollable-menu">
        { items.map(item => (
          item.type === 'separator'
            ? <MenuItem key={item.id} eventKey={item.id} divider />
            : (
              <MenuItem key={item.id} onClick={() => addClick(item)}>
                <i className={item.image} />
                &nbsp;
                {item.text}
              </MenuItem>
            )
        ))}
      </Dropdown.Menu>
    </Dropdown>
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
    <React.Fragment>
      { allowAdd && addMenu(items, locked) }
      { allowReset && resetButton() }
    </React.Fragment>
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
