/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { OverflowMenu } from 'carbon-components-react';
import debouncePromise from '../../../helpers/promise-debounce';
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

  /** Function to assign style to the OverflowMenu to display the list on the top of its menu button.
   * Note: The open={true} property for the OverflowMenu is not working as expected. Therefore,
   * we are unable to set the direction={"top"|"bottom"}
  */
  const overflowMenuDirection = (widgetId, widgetButtons) => {
    const widgetMenu = document.getElementById(`${widgetId}-menu`);
    if (widgetMenu) {
      const rowHeight = 30; // Height of a row item in the OverflowMenu list.
      const dimensions = widgetMenu.getBoundingClientRect();
      const overflowMenuHeight = rowHeight * JSON.parse(widgetButtons).length;
      const visibleMenuHeight = dimensions.bottom + overflowMenuHeight;
      if (visibleMenuHeight > window.innerHeight) {
        const overflowMenu = document.getElementsByClassName('bx--overflow-menu-options--open')[0];
        if (overflowMenu) {
          overflowMenu.style.top = `${dimensions.top - overflowMenuHeight}px`;
        }
      }
    }
  };

  return (
    <div className="card-pf card-pf-view">
      <div className="card-pf-body">
        <div className="card-pf-heading-kebab">
          <OverflowMenu
            className="widget-overflow-menu"
            id={`${widgetId}-menu`}
            aria-labelledby={`widget-title-${widgetId}`}
            flipped
            onOpen={() => overflowMenuDirection(widgetId, widgetButtons)}
          >
            {getOverflowButtons(widgetButtons, widgetId, widgetType, widgetTitle, setState, widgetModel, widgetLastRun, widgetNextRun)}
          </OverflowMenu>
          <div className="card-pf-title sortable-handle ui-sortable-handle">
            <span id={`widget-title-${widgetId}`}>{widgetTitle}</span>
          </div>
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
