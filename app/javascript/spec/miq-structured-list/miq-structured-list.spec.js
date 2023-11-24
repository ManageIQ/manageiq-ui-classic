import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import MiqStructuredList from '../../components/miq-structured-list';
import { codeMirrorData } from '../textual_summary/data/code_mirror_data';
import { genericGroupData } from '../textual_summary/data/generic_group';
import { multilinkTableData } from '../textual_summary/data/multilink_table';
import { operationRangesData } from '../textual_summary/data/operation_ranges';
import { simpleTableData, complexTableData, buildInstance } from '../textual_summary/data/simple_table';
import { tableListViewData } from '../textual_summary/data/table_list_view';
import { tagGroupData } from '../textual_summary/data/tag_group';
import { diagnosticSettingsListData } from '../textual_summary/data/diagnostic_settings_list';
import { catalogListData } from '../textual_summary/data/catalog_list';
import { miqAeClassListData } from '../textual_summary/data/miq_ae_class_list';
import { miqAePolicyListData } from '../textual_summary/data/miq_ae_policy_list';
import { miqAlertListData } from '../textual_summary/data/miq_alert_list';
import { miqPolicySetListData } from '../textual_summary/data/miq_policy_set_list';
import { miqReportDashboardListData } from '../textual_summary/data/report_dashboard_list';
import { reportInformationListData } from '../textual_summary/data/report_information_list';
import { reportScheduleListData } from '../textual_summary/data/report_schedule_list';

describe('Structured list component', () => {
  it('should render a simple_table with generic data', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={genericGroupData.items}
      title={genericGroupData.title}
      mode="simple_table"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a multilink_list table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={multilinkTableData.items}
      title={multilinkTableData.title}
      mode="multilink_table"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a operation_range table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={operationRangesData.items}
      title={operationRangesData.title}
      mode="operation_ranges"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a tag_group table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={tagGroupData.items}
      title={tagGroupData.title}
      mode="tag_group"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a simple_table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={simpleTableData.items}
      title={simpleTableData.title}
      mode="simple_table"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render strings without double escaping strings', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={complexTableData.rows}
      mode={complexTableData.mode}
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a simple_table with sortable and expandable data', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      headers={buildInstance.labels}
      rows={buildInstance.items}
      title={buildInstance.title}
      mode="simple_table"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a table_list_view table', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      headers={tableListViewData.headers.map((item) => item.label)}
      rows={tableListViewData.items}
      title={tableListViewData.title}
      mode="table_list_view"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render miq_alert_show page without double escaping strings', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={miqAlertListData.items}
      title={miqAlertListData.title}
      mode={miqAlertListData.mode}
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render settings list', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={diagnosticSettingsListData.items}
      mode={diagnosticSettingsListData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render catalog_data with escaped strings', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={catalogListData.items}
      title={catalogListData.title}
      mode="catalog_list_view"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render miq_reports_data without double escaping strings', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={miqReportDashboardListData.items}
      title={miqReportDashboardListData.title}
      mode={miqReportDashboardListData.mode}
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a miq_policy_set show page without double escaping strings', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={miqPolicySetListData.items}
      title={miqPolicySetListData.title}
      mode={miqPolicySetListData.mode}
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a report_information page without double escaping strings', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={reportInformationListData.items}
      title={reportInformationListData.title}
      mode={reportInformationListData.mode}
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render miq_ae_class_list_view with escaped strings', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={miqAeClassListData.items}
      title={miqAeClassListData.title}
      mode="table_list_view"
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render miq policy data without double escaping strings', () => {
    const wrapper = shallow(<MiqStructuredList
      rows={miqAePolicyListData.items}
      mode={miqAePolicyListData.mode}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render report_schedule page without double escaping strings', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={reportScheduleListData.items}
      title={reportScheduleListData.title}
      mode={reportScheduleListData.mode}
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render code mirror component', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<MiqStructuredList
      rows={codeMirrorData.items}
      title={codeMirrorData.title}
      mode={codeMirrorData.mode}
      onClick={onClick}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
