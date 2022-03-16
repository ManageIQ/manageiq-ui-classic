/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { OverflowMenu } from 'carbon-components-react';
import debouncePromise from '../../helpers/promise-debounce';
import { getOverflowButtons, getWidget } from './helper';

const WidgetWrapper = ({
  widgetId, widgetType, widgetButtons, widgetLastRun, widgetNextRun, widgetTitle,
}) => {
  const [{ widgetModel, isLoading, error }, setState] = useState({ isLoading: true, error: false });

  const widgetUrl = () => {
    const widgetTypeUrl = {
      menu: '/dashboard/widget_menu_data/',
      report: '/dashboard/widget_report_data/',
      chart: '/dashboard/widget_chart_data/',
    };

    if (widgetTypeUrl[widgetType]) {
      return [widgetTypeUrl[widgetType], widgetId].join('/');
    }
    return null;
  };

  const getWidgetData = () => {
    http.get(widgetUrl())
      .then((response) => {
        setState({
          widgetModel: response.content,
          isLoading: false,
        });
      });
  };

  useEffect(() => {
    // Handles the closing of the overflow menu when the page is scrolled
    if (document.getElementById('main-content')) {
      document.getElementById('main-content').addEventListener('scroll', () => {
        if (document.getElementById(`${widgetId}-menu`).getAttribute('aria-expanded') === 'true') {
          const temp = document.getElementsByClassName('bx--overflow-menu-options');
          temp.forEach((element) => {
            element.classList.remove('bx--overflow-menu-options--open');
          });
        }
      });
    }

    if (isLoading) {
      const asyncValidatorDebounced = debouncePromise(getWidgetData);
      asyncValidatorDebounced()
        .catch(() => {
          setState({
            widgetModel: undefined,
            isLoading: false,
            error: true,
          });
        });
    }
  });

  return (
    <div className="card-pf card-pf-view">
      <div className="card-pf-body">
        <div className="card-pf-heading-kebab">
          <OverflowMenu
            className="widget-overflow-menu"
            id={`${widgetId}-menu`}
            flipped
          >
            {getOverflowButtons(widgetButtons, widgetId, widgetType, widgetTitle, setState, widgetModel, widgetLastRun, widgetNextRun)}
          </OverflowMenu>
          <h2 className="card-pf-title sortable-handle ui-sortable-handle">
            {widgetTitle}
          </h2>
        </div>
      </div>
      {getWidget(widgetId, isLoading, widgetModel, widgetType, widgetLastRun, widgetNextRun, error)}
    </div>
  );
};

WidgetWrapper.propTypes = {
  widgetId: PropTypes.number.isRequired,
  widgetType: PropTypes.string.isRequired,
  widgetButtons: PropTypes.string.isRequired,
  widgetLastRun: PropTypes.string,
  widgetNextRun: PropTypes.string,
  widgetTitle: PropTypes.string,
};

WidgetWrapper.defaultProps = {
  widgetLastRun: 'Never',
  widgetNextRun: 'Never',
  widgetTitle: '',
};

export default WidgetWrapper;
