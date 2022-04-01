/* eslint-disable no-alert */
import React from 'react';
import ReactDOM from 'react-dom';
import { OverflowMenuItem, Loading } from 'carbon-components-react';
import classNames from 'classnames';
import miqRedirectBack from '../../../helpers/miq-redirect-back';
import WidgetChart from '../widget-chart';
import WidgetError from '../widget-error';
import WidgetFooter from '../widget-footer';
import WidgetMenu from '../widget-menu';
import WidgetReport from '../widget-report';
import WidgetZoom from '../widget-zoom';
import { http } from '../../../http_api';

const widgetUrl = (widgetId, widgetType) => {
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

const model = (isLoading, widgetId, widgetModel, widgetType) => {
  let widget;
  if (isLoading) {
    widget = (
      <div className="loadingSpinner">
        <Loading className="export-spinner" withOverlay={false} small />
      </div>
    );
  } else if (widgetType === 'menu' && isLoading === false) {
    widget = (
      <WidgetMenu
        key={widgetId}
        widgetModel={widgetModel}
      />
    );
  } else if (widgetType === 'report' && isLoading === false) {
    widget = (
      <WidgetReport
        key={widgetId}
        widgetModel={widgetModel}
      />
    );
  } else if (widgetType === 'chart' && isLoading === false) {
    let data = widgetModel;
    let id;
    let title;

    // Parse data from widgetModel that returns a react element with all the required data in the script section
    if (data) {
      const start = data.search('. {') + 2;
      const end = data.search('</script>') - 8;
      data = data.substring(start, end);
      data = JSON.parse(data);
      id = data.id;
      title = data.title;
    }
    widget = (
      <WidgetChart
        key={`${widgetId}-${isLoading}`}
        widgetModel={widgetModel}
        data={data}
        id={id}
        title={title}
      />
    );
  }
  return widget;
};

const footer = (widgetModel, lastRun, nextRun) => {
  if (widgetModel) {
    return (
      <WidgetFooter lastRun={lastRun} nextRun={nextRun} />
    );
  }
  return null;
};

const menuItemOnClick = (menuItems, widgetId, dataMethod, href, buttonTitle, widgetType, widgetTitle, setState, widgetModel, lastRun, nextRun) => {
  let index = 0;
  // Handles Minimize button and changes it to Maximize after click
  if (buttonTitle === __('Minimize')) {
    document.getElementById(`dd_w${widgetId}_box`).style.display = 'none';
    menuItems.forEach((button) => {
      if (button.props.title === __('Minimize')) {
        const newButton = (
          <OverflowMenuItem
            key={button.props.id}
            id={button.props.id}
            itemText={(
              <div>
                <i className={classNames('fa-fw', 'icon', 'fa fa-caret-square-o-down fa-fw')} />
                {__('Maximize')}
              </div>
            )}
            requireTitle
            title={__('Maximize')}
            onClick={() => menuItemOnClick(menuItems, widgetId, '', '', __('Maximize'), widgetType, widgetTitle, setState)}
          />
        );
        if (index > -1) {
          menuItems[index] = newButton;
        }
      }
      index += 1;
    });
    index = 0;
    return;
  }
  // Handles Maximize button and changes it to minimize after click
  if (buttonTitle === __('Maximize')) {
    document.getElementById(`dd_w${widgetId}_box`).style.display = 'block';
    menuItems.forEach((button) => {
      if (button.props.title === __('Maximize')) {
        const newButton = (
          <OverflowMenuItem
            key={button.props.id}
            id={button.props.id}
            itemText={(
              <div>
                <i className={classNames('fa-fw', 'icon', 'fa fa-caret-square-o-up fa-fw')} />
                {__('Minimize')}
              </div>
            )}
            requireTitle
            title={__('Minimize')}
            onClick={() => menuItemOnClick(menuItems, widgetId, '', '', __('Minimize'), widgetType, widgetTitle, setState)}
          />
        );
        if (index > -1) {
          menuItems[index] = newButton;
        }
      }
      index += 1;
    });
    index = 0;
    return;
  }
  // Handles refresh button
  if (buttonTitle === __('Refresh this Widget')) {
    http.get(widgetUrl(widgetId, widgetType))
      .then((response) => {
        setState({
          widgetModel: response.content,
          isLoading: false,
        });
      });
    miqSparkleOff();
    add_flash(sprintf(__('Widget "%s" was refreshed'), widgetTitle), 'success');
    return;
  }
  // Handles zoom button
  if (buttonTitle === __('Zoom in on this chart')) {
    const oldDiv = document.getElementById('lightbox_div');
    const widget = model(false, widgetId, widgetModel, widgetType);
    const newDiv = document.createElement('div');
    ReactDOM.render(<WidgetZoom widgetTitle={widgetTitle} widget={widget} footer={footer(widgetModel, lastRun, nextRun)} />, newDiv);
    oldDiv.parentNode.replaceChild(newDiv, oldDiv);
    $('#lightbox-panel').fadeIn(300);
    return;
  }
  // Handles remove button
  if (dataMethod === 'post') {
    if (window.confirm(__(`Are you sure you want to remove ${widgetTitle} from the Dashboard?`))) {
      http.post(href, {}, { skipErrors: true })
        .then((result) => {
          miqRedirectBack(result.message, 'success', '/dashboard/');
        })
        .catch((result) => miqRedirectBack(result.message, 'warning', '/dashboard/'));
    }
  } else {
    // Handles print or export to PDF button
    if (buttonTitle === __('Print the full report (all rows) or export it as a PDF file')) {
      window.open(href, '_blank');
      return;
    }
    // Handles full screen button
    let confirmText;
    if (buttonTitle === __(`Open the chart and full report in a new window`)) {
      confirmText = __('This will show the chart and the entire report (all rows) in your browser. Do you want to proceed?');
    } else if (buttonTitle === __(`Open the full report in a new window`)) {
      confirmText = __('This will show the entire report (all rows) in your browser. Do you want to proceed?');
    }
    if (window.confirm(confirmText)) {
      window.open(href, '_blank');
    }
  }
};

export const getOverflowButtons = (widgetButtons, widgetId, widgetType, widgetTitle, setState, widgetModel, lastRun, nextRun) => {
  const menuItems = [];
  const parsedButtons = JSON.parse(widgetButtons);
  parsedButtons.forEach((button) => {
    menuItems.push(<OverflowMenuItem
      key={button.id}
      id={button.id}
      itemText={(
        <div>
          <i className={classNames('fa-fw', 'icon', button.fonticon)} />
          {button.name}
        </div>
      )}
      requireTitle
      title={button.title}
      onClick={() => menuItemOnClick(
        menuItems,
        widgetId,
        button.dataMethod,
        button.href,
        button.title,
        widgetType,
        widgetTitle,
        setState,
        widgetModel,
        lastRun,
        nextRun
      )}
    />);
  });
  return menuItems;
};

export const getWidget = (widgetId, isLoading, widgetModel, widgetType, lastRun, nextRun, error) => {
  if (error) {
    return (
      <WidgetError widgetId={widgetId} />
    );
  }
  if (widgetType === 'menu') {
    return (
      <div id={`dd_w${widgetId}_box`}>
        {model(isLoading, widgetId, widgetModel, widgetType)}
      </div>
    );
  }
  return (
    <div id={`dd_w${widgetId}_box`}>
      {model(isLoading, widgetId, widgetModel, widgetType)}
      {footer(widgetModel, lastRun, nextRun)}
    </div>
  );
};
