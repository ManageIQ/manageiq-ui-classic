import moment from 'moment';

const dailyTimeTooltip = (units = undefined) => (data) => {
  const theMoment = moment(data[0].date);
  let htmlString = `<div class="tooltip-inner">${theMoment.format('L')}  ${data[0].value} ${data[0].group} </div>`;
  if (units) {
    htmlString = `<div class="tooltip-inner">${theMoment.format('L')}  ${data[0].value} ${__(units)} </div>`;
  }
  return htmlString;
};

const dailyPodTimeTooltip = () => (data) => {
  const theMoment = moment(data[0].date);

  if (data[1]) {
    return `<div class="tooltip-inner">
  ${theMoment.format('L')}  ${data[0].value} ${__(data[0].group)}, ${data[1].value} ${__(data[1].group)} </div>`;
  }
  return `<div class="tooltip-inner">${theMoment.format('L')}  ${data[0].value} ${__(data[0].group)} </div>`;
};

const hourlyPodTimeTooltip = () => (data) => {
  const theMoment = moment(data[0].date);
  if (data[1]) {
    return `<div class="tooltip-inner">
  ${theMoment.format('LT')}  ${data[0].value} ${__(data[0].group)}, ${data[1].value} ${__(data[1].group)} </div>`;
  }
  return `<div class="tooltip-inner">
  ${theMoment.format('LT')}  ${data[0].value} ${__(data[0].group)} </div>`;
};

const hourlyTimeTooltip = (units = undefined) => (data) => {
  const theMoment = moment(data[0].date);
  let htmlString = `<div class="tooltip-inner">${theMoment.format('LT')}  ${data[0].value} </div>`;
  if (units) {
    htmlString = `<div class="tooltip-inner">${theMoment.format('LT')}  ${data[0].value} ${__(units)} </div>`;
  }
  return htmlString;
};

export const chartConfig = {
  cpuUsageConfig: {
    chartId: 'cpuUsageChart',
    title: __('CPU'),
    units: __('Cores'),
    usageDataName: __('Used'),
    availableDataName: __('Available'),
    legendLeftText: __('Last 30 Days'),
    legendRightText: '',
    numDays: 30,
    availableof: __('Available of'),
    sparklineTooltip: () => dailyTimeTooltip(),
  },

  cpuUsageDonutConfig: {
    chartId: 'cpuDonutChart',
    thresholds: { warning: '60', error: '90' },
  },
  memoryUsageConfig: {
    chartId: 'memUsageChart',
    title: __('Memory'),
    units: __('GB'),
    usageDataName: __('Used'),
    availableDataName: __('Available'),
    legendLeftText: __('Last 30 Days'),
    legendRightText: '',
    numDays: 30,
    availableof: __('Available of'),
    sparklineTooltip: () => dailyTimeTooltip(),
  },

  memoryUsageDonutConfig: {
    chartId: 'memoryDonutChart',
    thresholds: { warning: '60', error: '90' },
  },
  recentResourcesConfig: {
    chartId: 'recentResourcesChart',
    tooltipFn: () => dailyTimeTooltip(),
    point: { r: 1 },
    size: { height: '145px' },
    grid: { y: { show: false } },
    setAreaChart: true,
    units: __('Hosts'),
    legendLeftText: __('Last 30 Days'),
  },
  recentVmsConfig: {
    chartId: 'recentVmsChart',
    headTitle: __('Recent VMs'),
    label: __('VMs'),
    tooltipFn: () => dailyTimeTooltip(),
    point: { r: 1 },
    size: { height: '145px' },
    grid: { y: { show: false } },
    setAreaChart: true,
    units: __('Vms'),
    legendLeftText: __('Last 30 Days'),
  },
  dailyNetworkUsageConfig: {
    chartId: 'networkUsageDailyChart',
    headTitle: __('Network Utilization Trend'),
    timeFrame: __('Last 30 Days'),
    units: __('KBps'),
    dataName: __('KBps'),
    tooltipFn: () => dailyTimeTooltip('KBps'),
    size: { height: '150px' },
    createdLabel: __('Network'),
    valueType: 'actual',
  },
  hourlyNetworkUsageConfig: {
    chartId: 'networkUsageHourlyChart',
    headTitle: __('Network Utilization Trend'),
    timeFrame: __('Last 24 Hours'),
    units: __('KBps'),
    dataName: __('KBps'),
    tooltipFn: () => hourlyTimeTooltip('KBps'),
    size: { height: '150px' },
    createdLabel: __('Network'),
    valueType: 'actual',
  },
  dailyPodUsageConfig: {
    chartId: 'podUsageDailyChart',
    headTitle: __('Pod Creation and Deletion Trends'),
    timeFrame: __('Last 30 days'),
    createdLabel: __('Created'),
    deletedLabel: __('Deleted'),
    tooltipFn: dailyPodTimeTooltip,
    point: { r: 1 },
    size: { height: '150px' },
    grid: { y: { show: false } },
    setAreaChart: true,
  },
  hourlyPodUsageConfig: {
    chartId: 'podUsageHourlyChart',
    headTitle: __('Pod Creation and Deletion Trends'),
    timeFrame: __('Last 24 hours'),
    createdLabel: __('Created'),
    deletedLabel: __('Deleted'),
    tooltipFn: hourlyPodTimeTooltip,
    point: { r: 1 },
    size: { height: '145px' },
    grid: { y: { show: false } },
    setAreaChart: true,
  },
  dailyImageUsageConfig: {
    chartId: 'imageUsageDailyChart',
    headTitle: __('New Image Usage Trend'),
    timeFrame: __('Last 30 days'),
    createdLabel: __('Images'),
    tooltipFn: () => dailyTimeTooltip('KBps'),
    units: __('KBps'),
    point: { r: 1 },
    size: { height: '150px' },
    grid: { y: { show: false } },
    setAreaChart: true,
  },
  hourlyImageUsageConfig: {
    chartId: 'imageUsageHourlyChart',
    headTitle: __('New Image Usage Trend'),
    timeFrame: __('Last 24 hours'),
    createdLabel: __('Images'),
    tooltipFn: () => hourlyTimeTooltip('KBps'),
    units: __('KBps'),
    point: { r: 1 },
    size: { height: '150px' },
    grid: { y: { show: false } },
    setAreaChart: true,
  },
  availableServersUsageConfig: {
    chartId: 'serverAvailabilityChart',
    title: __('Servers Available'),
    units: __('Server'),
    usageDataName: __('Used'),
    legendLeftText: __('Last 30 Days'),
    legendRightText: '',
    numDays: 30,
    availableDataName: __('Available'),
  },
  availableServersUsagePieConfig: {
    chartId: 'serverAvailablePieChart_',
  },
  serversHealthUsageConfig: {
    chartId: 'serverHealthChart',
    title: __('Servers Health'),
    units: __('Server'),
    usageDataName: __('Used'),
    legendLeftText: __('Last 30 Days'),
    legendRightText: '',
    numDays: 30,

  },
  recentServersConfig: {
    chartId: 'recentServersChart',
    tooltipFn: () => dailyTimeTooltip(),
    units: __('Servers'),
    point: { r: 1 },
    size: { height: '145px' },
    grid: { y: { show: false } },
    setAreaChart: true,
    legendLeftText: __('Last 30 Days'),
  },
  recentInstancesConfig: {
    chartId: 'recentInstancesChart',
    tooltipFn: () => dailyTimeTooltip(),
    units: __('Instances'),
    point: { r: 1 },
    size: { height: '145px' },
    grid: { y: { show: false } },
    setAreaChart: true,
    legendLeftText: __('Last 30 Days'),
  },
  recentImagesConfig: {
    chartId: 'recentInstancesChart',
    tooltipFn: () => dailyTimeTooltip(),
    units: __('Images'),
    point: { r: 1 },
    size: { height: '145px' },
    grid: { y: { show: false } },
    setAreaChart: true,
    legendLeftText: __('Last 30 Days'),
  },
};
