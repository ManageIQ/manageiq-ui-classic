import React from 'react';
import ChartCard from './chart-card';
import { chartConfig } from '../provider-dashboard-charts/charts_config';
import PfAggregateStatusCard from '../pf_aggregate_status_card';

const getTooltipHTML = (pointData, tooltipType, unit) => {
  const date = moment(pointData[0].date);
  if (tooltipType === 'daily') {
    return (`${date.format('MM/DD/YYYY')}: ${pointData[0].value} ${unit}`);
  }
  return (`${date.format('h:mm A')}: ${pointData[0].value} ${unit}`);
};

export const getStatusCards = (isLoading, dashboardData) => {
  if (isLoading !== true) {
    return (
      <div>
        <div className="card-wrapper" id="containers">
          <PfAggregateStatusCard
            showTopBorder
            altLayout={false}
            layout="mini"
            data={{
              count: dashboardData.data.status.containers.count,
              title: __('Containers'),
              iconClass: 'fa fa-cube',
              href: dashboardData.data.status.containers.href,
            }}
          />
        </div>
        <div className="card-wrapper" id="images">
          <PfAggregateStatusCard
            showTopBorder
            altLayout={false}
            layout="mini"
            data={{
              count: dashboardData.data.status.images.count,
              title: __('Images'),
              iconClass: 'pficon pficon-image',
              href: dashboardData.data.status.images.href,
            }}
          />
        </div>
        <div className="card-wrapper" id="services">
          <PfAggregateStatusCard
            showTopBorder
            altLayout={false}
            layout="mini"
            data={{
              count: dashboardData.data.status.services.count,
              title: __('Services'),
              iconClass: 'pficon pficon-service',
              href: dashboardData.data.status.services.href,
            }}
          />
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="card-wrapper" id="containers">
        <PfAggregateStatusCard
          showTopBorder
          altLayout={false}
          layout="mini"
          data={{
            count: 0,
            title: __('Containers'),
            iconClass: 'fa fa-cube',
          }}
        />
      </div>
      <div className="card-wrapper" id="images">
        <PfAggregateStatusCard
          showTopBorder
          altLayout={false}
          layout="mini"
          data={{
            count: 0,
            title: __('Images'),
            iconClass: 'pficon pficon-image',
          }}
        />
      </div>
      <div className="card-wrapper" id="services">
        <PfAggregateStatusCard
          showTopBorder
          altLayout={false}
          layout="mini"
          data={{
            count: 0,
            title: __('Services'),
            iconClass: 'pficon pficon-service',
          }}
        />
      </div>
    </div>
  );
};

export const getCPUChart = (isLoading, dashboardData) => {
  if (isLoading !== true) {
    if (dashboardData.data.project_utilization.dataAvailable) {
      const chartData = [];
      let count = 0;
      dashboardData.data.project_utilization.xy_data.cpu.xData.forEach((dateDataPoint) => {
        const valueDataPoint = dashboardData.data.project_utilization.xy_data.cpu.yData[count];
        chartData.push({
          date: dateDataPoint,
          value: valueDataPoint,
        });
        count += 1;
      });
      const tooltipType = dashboardData.data.project_utilization.interval_name;

      const options = {
        toolbar: { enabled: false },
        tooltip: {
          customHTML: (pointData) => getTooltipHTML(pointData, tooltipType, __('Cores')),
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

      return (
        <ChartCard
          title={__('CPU Utilization')}
          textNumber={dashboardData.data.project_utilization.xy_data.cpu.used}
          textUnit={__('Cores')}
          textTitle={__('CPU Utilization')}
          chartData={chartData}
          options={options}
          isLoading={isLoading}
        />
      );
    }
    return (
      <ChartCard
        chartType="empty"
        title={__('CPU Utilization')}
      />
    );
  }
  return (
    <ChartCard
      title={__('CPU Utilization')}
      isLoading={isLoading}
    />
  );
};

export const getMemoryChart = (isLoading, dashboardData) => {
  if (isLoading !== true) {
    if (dashboardData.data.project_utilization.dataAvailable) {
      const chartData = [];
      let count = 0;
      dashboardData.data.project_utilization.xy_data.memory.xData.forEach((dateDataPoint) => {
        const valueDataPoint = dashboardData.data.project_utilization.xy_data.memory.yData[count];
        chartData.push({
          date: dateDataPoint,
          value: valueDataPoint,
        });
        count += 1;
      });
      const tooltipType = dashboardData.data.project_utilization.interval_name;

      const options = {
        toolbar: { enabled: false },
        tooltip: {
          customHTML: (pointData) => getTooltipHTML(pointData, tooltipType, __('GB')),
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

      return (
        <ChartCard
          title={__('Memory Utilization')}
          textNumber={dashboardData.data.project_utilization.xy_data.memory.used}
          textUnit={__('GB')}
          textTitle={__('Memory Utilization')}
          chartData={chartData}
          options={options}
          isLoading={isLoading}
        />
      );
    }
    return (
      <ChartCard
        chartType="empty"
        title={__('Memory Utilization')}
      />
    );
  }
  return (
    <ChartCard
      title={__('Memory Utilization')}
      isLoading={isLoading}
    />
  );
};

export const getNetworkChart = (isLoading, dashboardData) => {
  if (isLoading !== true) {
    if (dashboardData.data.network_metrics.dataAvailable) {
      const chartData = [];
      let count = 0;
      let finalValue = 0;
      dashboardData.data.network_metrics.xy_data.xData.forEach((dateDataPoint) => {
        const valueDataPoint = dashboardData.data.network_metrics.xy_data.yData[count];
        finalValue = valueDataPoint;
        chartData.push({
          date: dateDataPoint,
          value: valueDataPoint,
        });
        count += 1;
      });
      const tooltipType = dashboardData.data.network_metrics.interval_name;

      const options = {
        toolbar: { enabled: false },
        tooltip: {
          customHTML: (pointData) => getTooltipHTML(pointData, tooltipType, __('KBps')),
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

      return (
        <ChartCard
          title={__('Network Utilization Trend')}
          textNumber={finalValue}
          textUnit={__('KBps')}
          textTitle={__('Network Utilization')}
          chartData={chartData}
          options={options}
          isLoading={isLoading}
        />
      );
    }
    return (
      <ChartCard
        chartType="empty"
        title={__('Network Utilization Trend')}
      />
    );
  }
  return (
    <ChartCard
      title={__('Network Utilization Trend')}
      isLoading={isLoading}
    />
  );
};

export const getPodsTrendChart = (isLoading, dashboardData) => {
  if (isLoading !== true) {
    if (dashboardData.data.pod_metrics.dataAvailable) {
      const tooltipType = dashboardData.data.pod_metrics.interval_name;
      let config = 'hourlyPodUsageConfig';
      if (tooltipType === 'daily') {
        config = 'dailyPodUsageConfig';
      }

      return (
        <ChartCard
          chartType="podsTrend"
          title={__('Pod Creation and Deletion Trends')}
          chartData={dashboardData.data}
          isLoading={isLoading}
          config={chartConfig[config]}
        />
      );
    }
    return (
      <ChartCard
        chartType="empty"
        title={__('Pod Creation and Deletion Trends')}
      />
    );
  }
  return (
    <ChartCard
      title={__('Pod Creation and Deletion Trends')}
      isLoading={isLoading}
    />
  );
};

export const getQuotasChart = (isLoading, dashboardData) => {
  if (isLoading !== true) {
    if (dashboardData.data.quota.length > 0) {
      return (
        <ChartCard
          chartType="quotas"
          title={__('Quotas')}
          chartData={dashboardData.data.quota}
          isLoading={isLoading}
        />
      );
    }
    return (
      <ChartCard
        chartType="empty"
        title={__('Quotas')}
      />
    );
  }
  return (
    <ChartCard
      title={__('Quotas')}
      isLoading={isLoading}
    />
  );
};

export const getPodsTable = (isLoading, dashboardData) => {
  if (isLoading !== true) {
    if (dashboardData.data.pods.length > 0) {
      const rows = dashboardData.data.pods.map((row) => ({
        ...row,
        id: `${row.id}`,
        name: {
          is_link: true,
          href: `/container_group/show/${row.id}/`,
          text: row.name,
        },
      }));
      const headers = [
        { key: 'name', header: __('Name') },
        { key: 'phase', header: __('Status') },
        { key: 'ready_condition_status', header: __('Ready Status') },
        { key: 'running_containers_summary', header: __('Ready Containers') },
      ];
      const chartData = { rows, headers };
      return (
        <ChartCard
          chartType="table"
          title={__('Pods')}
          chartData={chartData}
          isLoading={isLoading}
        />
      );
    }
    return (
      <ChartCard
        chartType="empty"
        title={__('Pods')}
      />
    );
  }
  return (
    <ChartCard
      title={__('Pods')}
      isLoading={isLoading}
    />
  );
};
