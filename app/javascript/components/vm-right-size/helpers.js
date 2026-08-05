const displayValue = (v) => v ?? __('Not Available');

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
      max: displayValue(norm.cpu_mhz_max),
      high: displayValue(norm.cpu_mhz_high),
      average: displayValue(norm.cpu_mhz_avg),
      low: displayValue(norm.cpu_mhz_low),
    },
    {
      id: 'cpu_usage',
      defaultKey_metric: __('CPU Usage'),
      max: displayValue(norm.cpu_pct_max),
      high: displayValue(norm.cpu_pct_high),
      average: displayValue(norm.cpu_pct_avg),
      low: displayValue(norm.cpu_pct_low),
    },
    {
      id: 'memory',
      defaultKey_metric: __('Memory'),
      max: displayValue(norm.mem_max),
      high: displayValue(norm.mem_high),
      average: displayValue(norm.mem_avg),
      low: displayValue(norm.mem_low),
    },
    {
      id: 'memory_pct',
      defaultKey_metric: __('Memory Usage'),
      max: displayValue(norm.mem_pct_max),
      high: displayValue(norm.mem_pct_high),
      average: displayValue(norm.mem_pct_avg),
      low: displayValue(norm.mem_pct_low),
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
      current: displayValue(currentCores),
      recommended: displayValue(sizing.recommended_vcpus),
      savingsPct: displayValue(sizing.vcpus_change_pct),
      savings: displayValue(sizing.vcpus_change),
    },
    {
      id: 'memory',
      defaultKey_category: __('Memory'),
      current: displayValue(currentMem),
      recommended: displayValue(sizing.recommended_mem),
      savingsPct: displayValue(sizing.mem_change_pct),
      savings: displayValue(sizing.mem_change),
    },
  ],
});
