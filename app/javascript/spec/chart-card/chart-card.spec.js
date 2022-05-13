import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import ChartCard from '../../components/container-projects/chart-card';
import { chartConfig } from '../../components/provider-dashboard-charts/charts_config';

describe('Chart Card component', () => {
  it('should render the loading card', () => {
    const wrapper = shallow(<ChartCard title="Pods" isLoading />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render the empty card', () => {
    const wrapper = shallow(<ChartCard chartType="empty" title="Pods" />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render the area chart card', () => {
    const chartData = [
      { date: '2022-05-09T23:00:00.000Z', value: 0.01 },
      { date: '2022-05-10T00:00:00.000Z', value: 0.02 },
      { date: '2022-05-10T01:00:00.000Z', value: 0.02 },
      { date: '2022-05-10T02:00:00.000Z', value: 0.02 },
      { date: '2022-05-10T03:00:00.000Z', value: 0.01 },
    ];
    const getTooltipHTML = (pointData, tooltipType, unit) => {
      const date = moment(pointData[0].date);
      if (tooltipType === 'daily') {
        return (`${date.format('MM/DD/YYYY')}: ${pointData[0].value} ${unit}`);
      }
      return (`${date.format('h:mm A')}: ${pointData[0].value} ${unit}`);
    };
    const options = {
      toolbar: { enabled: false },
      tooltip: {
        customHTML: (pointData) => getTooltipHTML(pointData, 'hourly', __('Cores')),
        truncation: {
          type: 'none',
        },
      },
      height: '50px',
      grid: {
        x: {
          enabled: false,
        },
        y: {
          enabled: false,
        },
      },
      axes: {
        bottom: {
          visible: false,
          mapsTo: 'date',
          scaleType: 'time',
        },
        left: {
          visible: false,
          mapsTo: 'value',
          scaleType: 'linear',
        },
      },
      points: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
    };
    const wrapper = shallow(<ChartCard
      title="CPU Utilization"
      textNumber={0.02}
      textUnit="Cores"
      textTitle="CPU Utilization"
      chartData={chartData}
      options={options}
      isLoading={false}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render the quotas chart card', () => {
    const chartData = [
      {
        resource: 'cpu', quota_enforced: 20, quota_observed: '0.3', units: 'Cores',
      },
      {
        resource: 'memory', quota_enforced: 1, quota_observed: 0, units: 'GB',
      },
      {
        resource: 'pods', quota_enforced: 10, quota_observed: 4, units: '',
      },
      {
        resource: 'replicationcontrollers', quota_enforced: 5, quota_observed: 7, units: '',
      },
      {
        resource: 'resourcequotas', quota_enforced: 1, quota_observed: 1, units: '',
      },
      {
        resource: 'services', quota_enforced: 5, quota_observed: 4, units: '',
      },
    ];
    const wrapper = shallow(<ChartCard chartType="quotas" title="Quotas" chartData={chartData} isLoading={false} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render the pods trend chart card', () => {
    const chartData = {
      pod_metrics: {
        dataAvailable: true,
        interval_name: 'hourly',
        xy_data: {
          dataAvailable: true,
          xData: [
            '2022-05-09T23:00:00.000Z',
            '2022-05-10T00:00:00.000Z',
            '2022-05-10T01:00:00.000Z',
          ],
          yCreated: [1, 0, 0],
          yDeleted: [0, 0, 1],
        },
      },
    };
    const wrapper = shallow(<ChartCard
      chartType="podsTrend"
      title="Pod Creation and Deletion Trends"
      chartData={chartData}
      isLoading={false}
      config={chartConfig.hourlyPodUsageConfig}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render the pods table card', () => {
    const chartData = {
      headers: [
        { key: 'name', header: __('Name') },
        { key: 'phase', header: __('Status') },
        { key: 'ready_condition_status', header: __('Ready Status') },
        { key: 'running_containers_summary', header: __('Ready Containers') },
      ],
      rows: [
        {
          name: 'test0',
          phase: 'Succeeded',
          running_containers_summary: '0/1',
          ready_condition_status: 'False',
          id: '0.03272110141753015',
        },
        {
          name: 'test1',
          phase: 'Running',
          running_containers_summary: '1/1',
          ready_condition_status: 'True',
          id: '0.548571332866931',
        },
        {
          name: 'test2',
          phase: 'Running',
          running_containers_summary: '1/1',
          ready_condition_status: 'True',
          id: '0.988113698073033',
        },
      ],
    };
    const wrapper = shallow(<ChartCard chartType="table" title="Pods" chartData={chartData} isLoading={false} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
