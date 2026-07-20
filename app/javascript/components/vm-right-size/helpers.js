const val = (v) => v ?? __('Not Available');

export const normTableData = (norm) => ({
  headers: [
    { key: 'defaultKey_metric', header: 'defaultKey_metric' },
    { key: 'max',               header: __('Max') },
    { key: 'high',    header: __('High') },
    { key: 'average', header: __('Average') },
    { key: 'low',     header: __('Low') },
  ],
  rows: [
    {
      id: 'cpu',
      defaultKey_metric: __('CPU'),
      max: val(norm.cpu_mhz_max),
      high: val(norm.cpu_mhz_high),
      average: val(norm.cpu_mhz_avg),
      low: val(norm.cpu_mhz_low),
    },
    {
      id: 'cpu_usage',
      defaultKey_metric: __('CPU Usage'),
      max: val(norm.cpu_pct_max),
      high: val(norm.cpu_pct_high),
      average: val(norm.cpu_pct_avg),
      low: val(norm.cpu_pct_low),
    },
    {
      id: 'memory',
      defaultKey_metric: __('Memory'),
      max: val(norm.mem_max),
      high: val(norm.mem_high),
      average: val(norm.mem_avg),
      low: val(norm.mem_low),
    },
    {
      id: 'memory_pct',
      defaultKey_metric: __('Memory Usage'),
      max: val(norm.mem_pct_max),
      high: val(norm.mem_pct_high),
      average: val(norm.mem_pct_avg),
      low: val(norm.mem_pct_low),
    },
  ],
});

export const sizingTableData = (sizing, currentCores, currentMem) => ({
  headers: [
    { key: 'defaultKey_category', header: 'defaultKey_category' },
    { key: 'current',             header: __('Current') },
    { key: 'recommended', header: __('Recommended') },
    { key: 'savingsPct',  header: __('% Savings') },
    { key: 'savings',     header: __('Savings') },
  ],
  rows: [
    {
      id: 'processors',
      defaultKey_category: __('Processors'),
      current: val(currentCores),
      recommended: val(sizing.recommended_vcpus),
      savingsPct: val(sizing.vcpus_change_pct),
      savings: val(sizing.vcpus_change),
    },
    {
      id: 'memory',
      defaultKey_category: __('Memory'),
      current: val(currentMem),
      recommended: val(sizing.recommended_mem),
      savingsPct: val(sizing.mem_change_pct),
      savings: val(sizing.mem_change),
    },
  ],
});
