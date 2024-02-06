/* eslint-disable max-len */
import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { mount } from '../helpers/mountForm';
import WidgetWrapper from '../../components/dashboard-widgets/widget-wrapper';

describe('Widget wrapper component', () => {
  const widgetButtonsReport = `[{"id":"w_19_close","title":"Remove from Dashboard","name":"Remove Widget","confirm":"Are you sure you want to remove 'EVM: Recently Discovered Hosts'from the Dashboard?","dataRemote":true,"sparkleOn":true,"href":"/dashboard/widget_close?widget=19","fonticon":"fa fa-times fa-fw","dataMethod":"post"},{"id":"w_19_minmax","title":"Minimize","name":"Minimize","confirm":false,"dataRemote":true,"href":"/dashboard/widget_toggle_minmax?widget=19","fonticon":"fa fa-caret-square-o-up fa-fw","dataMethod":"post"},{"id":"w_19_fullscreen","title":"Open the full report in a new window","name":"Full Screen","confirm":"This will show the entire report (all rows) in your browser. Do you want to proceed?","href":"/dashboard/report_only?rr_id=19618\u0026type=tabular","fonticon":"fa fa-arrows-alt fa-fw","target":"_blank","rel":"noopener noreferrer"},{"id":"w_19_pdf","title":"Print the full report (all rows) or export it as a PDF file","name":"Print or export to PDF","href":"/dashboard/widget_to_pdf?rr_id=19618","fonticon":"pficon pficon-print fa-fw","target":"_blank","rel":"noopener noreferrer"},{"id":"w_19_refresh","title":"Refresh this Widget","name":"Refresh","fonticon":"fa fa-refresh fa-fw","refresh":true}]`;
  const widgetButtonsMenu = `[{"id":"w_83_close","title":"Remove from Dashboard","name":"Remove Widget","confirm":"Are you sure you want to remove 'Links'from the Dashboard?","dataRemote":true,"sparkleOn":true,"href":"/dashboard/widget_close?widget=83","fonticon":"fa fa-times fa-fw","dataMethod":"post"},{"id":"w_83_minmax","title":"Minimize","name":"Minimize","confirm":false,"dataRemote":true,"href":"/dashboard/widget_toggle_minmax?widget=83","fonticon":"fa fa-caret-square-o-up fa-fw","dataMethod":"post"}]`;
  const widgetButtonsChart = `[{"id":"w_1_close","title":"Remove from Dashboard","name":"Remove Widget","confirm":"Are you sure you want to remove 'Guest OS Information'from the Dashboard?","dataRemote":true,"sparkleOn":true,"href":"/dashboard/widget_close?widget=1","fonticon":"fa fa-times fa-fw","dataMethod":"post"},{"id":"w_1_minmax","title":"Minimize","name":"Minimize","confirm":false,"dataRemote":true,"href":"/dashboard/widget_toggle_minmax?widget=1","fonticon":"fa fa-caret-square-o-up fa-fw","dataMethod":"post"},{"id":"w_1_fullscreen","title":"Open the chart and full report in a new window","name":"Full Screen","confirm":"This will show the chart and the entire report (all rows) in your browser. Do you want to proceed?","href":"/dashboard/report_only?rr_id=12686\u0026type=hybrid","fonticon":"fa fa-arrows-alt fa-fw","target":"_blank","rel":"noopener noreferrer"},{"id":"w_1_pdf","title":"Print the full report (all rows) or export it as a PDF file","name":"Print or export to PDF","href":"/dashboard/widget_to_pdf?rr_id=12686","fonticon":"pficon pficon-print fa-fw","target":"_blank","rel":"noopener noreferrer"},{"id":"w_1_zoom","title":"Zoom in on this chart","name":"Zoom in","href":"/dashboard/widget_zoom?widget=1","fonticon":"fa fa-plus fa-fw","dataRemote":true,"sparkleOn":true,"dataMethod":"post"},{"id":"w_1_refresh","title":"Refresh this Widget","name":"Refresh","fonticon":"fa fa-refresh fa-fw","refresh":true}]`;
  beforeEach(() => {
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });
  it('should render a widget wrapper with a report', () => {
    const wrapper = mount(<WidgetWrapper
      widgetId={19}
      widgetType="report"
      widgetButtons={widgetButtonsReport}
      widgetLastRun="March 04, 2022 03:55"
      widgetNextRun="March 07, 2022 01:00"
      widgetTitle="EVM: Recently Discovered Hosts"
    />);

    expect(toJson(wrapper)).toMatchSnapshot();
  });
  it('should render a widget wrapper with a menu', () => {
    const wrapper = mount(<WidgetWrapper
      widgetId={83}
      widgetType="menu"
      widgetButtons={widgetButtonsMenu}
      widgetLastRun="March 04, 2022 03:55"
      widgetNextRun="March 07, 2022 01:00"
      widgetTitle="Links"
    />);

    expect(toJson(wrapper)).toMatchSnapshot();
  });
  it('should render a widget wrapper with a chart', () => {
    const wrapper = mount(<WidgetWrapper
      widgetId={1}
      widgetType="chart"
      widgetButtons={widgetButtonsChart}
      widgetLastRun="April 06, 2019 12:00"
      widgetNextRun="March 07, 2022 01:00"
      widgetTitle="Guest OS Information"
    />);

    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
