import React from 'react';
import PropTypes from 'prop-types';
import { adjustColor } from './utility';

const classNames = require('classnames');

export const ToolbarView = ({ views, onClick }) => (
  <div className="toolbar-pf-action-right">
    <div className="form-group toolbar-pf-view-selector">
      {views.map((view) => (
        // eslint-disable-next-line react/button-has-type
        <button
          key={view.id}
          id={view.id}
          name={view.name}
          title={view.title}
          className={classNames('btn btn-link', { active: view.selected })}
          data-url={view.url}
          data-url_parms={view.url_parms}
          data-send_checked={view.send_checked ? 'true' : ''}
          data-prompt={view.prompt}
          data-popup={view.popup}
          disabled={!view.enabled}
          onClick={() => onClick(view)}
        >
          <i className={view.icon} style={{ color: adjustColor(view.color, view.enabled) }} />
        </button>
      ))}
    </div>
  </div>
);

ToolbarView.propTypes = {
  // eslint-disable-next-line react/require-default-props
  views: PropTypes.arrayOf(PropTypes.any),
  onClick: PropTypes.func.isRequired,
};
