import React from 'react';
import PropTypes from 'prop-types';
import { HeatmapChart } from '@carbon/charts-react';
import { getHeatMapData } from '../helpers';
import EmptyChart from '../emptyChart';

const HeatMapChartGraph = ({
  data, dataPoint1, dataPoint2, dataPointAvailable,
}) => {
  const heatData1 = data[dataPoint1];
  const heatData2 = data[dataPoint2];
  const heatmapCpuData = (heatData1 === null || heatData1[0]['node'] === undefined) ? [] : getHeatMapData(heatData1);
  const heatmapMemoryData = (heatData2 === null) ? [] : getHeatMapData(heatData2);

  const heatmapCpuTooltip = () => (data) => {
    let d1;

    if (dataPoint1 === 'resourceUsage') {
      d1 = heatmapCpuData.find((item) => item.node === data[1].value);
    }
    else {
      d1 = heatmapCpuData[0];
    }

    let percent = -1;
    let tooltip = sprintf(__('Cluster: %s'), data[1].value) + `<br>` + sprintf(__('Provider: %s'), d1.provider)
    if (data[2].value === null || data[1].value === null) {
      tooltip += `<br> ` + __('Usage: Unknown');
    } else {
      percent = data[2].value;
      tooltip += '<br>';
      tooltip += sprintf(__('Usage: %d%% in use of %d %s '), percent, d1.total, d1.unit);
    }
    return tooltip;
  };

  heatmapCpuTooltip.propTypes = {
    data: PropTypes.objectOf(PropTypes.any).isRequired,
  };

  const heatmapMemoryTooltip = () => (data) => {
    const d1 = heatmapMemoryData[0];
    let percent = -1;
    let tooltip = sprintf(__('Cluster: %s'), data[1].value) + `<br>` + sprintf(__('Provider: %s'), d1.provider)
    if (data[2].value === null || data[1].value === null) {
      tooltip += `<br> ` + __('Usage: Unknown');
    } else {
      percent = data[2].value;
      tooltip += '<br>';
      tooltip += sprintf(__('Usage: %d%% in use of %d %s '), percent, d1.total, d1.unit);
    }
    return tooltip;
  };

  heatmapMemoryTooltip.propTypes = {
    data: PropTypes.objectOf(PropTypes.any).isRequired,
  };

  const heatmapCpuOptions = {
    axes: {
      bottom: {
        visible: false,
        title: 'Percent',
        mapsTo: 'percent',
        scaleType: 'labels',
      },
      left: {
        visible: false,
        title: 'Node',
        mapsTo: 'node',
        scaleType: 'labels',
      },
    },
    heatmap: {
      colorLegend: {
        title: 'Utilization',
        type: 'quantize',
      },
      divider: {
        state: 'on',
      },
    },
    experimental: true,
    height: '400px',
    width: '280px',
    tooltip: {
      customHTML: heatmapCpuTooltip(data),
      truncation: {
        type: 'none',
      },
    },
  };

  const heatmapMemoryOptions = {
    axes: {
      bottom: {
        visible: false,
        title: ' Percent',
        mapsTo: ' percent',
        scaleType: 'labels',
      },
      left: {
        visible: false,
        title: 'Node',
        mapsTo: 'node',
        scaleType: 'labels',
      },
    },
    heatmap: {
      colorLegend: {
        title: 'Utilization',
        type: 'quantize',
      },
      divider: {
        state: 'on',
      },
    },
    height: '400px',
    width: '280px',
    tooltip: {
      customHTML: heatmapMemoryTooltip(data),
      truncation: {
        type: 'none',
      },
    },
  };

  return (
    <div className="heatmap_charts_section">

      <div className="heatmap_charts_div">
        <div className="heat-chart-pf">
          { dataPointAvailable
            ? (
              <h3>
                {__('CPU')}
              </h3>
            ) : (
              <h3>
                {__('Resources (Pools)')}
              </h3>
            )}
          {(heatmapCpuData.length > 0) ? <HeatmapChart data={heatmapCpuData} options={heatmapCpuOptions} /> : <EmptyChart />}
        </div>
        { dataPointAvailable
        && (
          <div className="heat-chart-pf">
            <h3>
              {__('Memory')}
            </h3>

            {(heatmapMemoryData.length > 0) ? <HeatmapChart data={heatmapMemoryData} options={heatmapMemoryOptions} /> : <EmptyChart />}
          </div>
        ) }

      </div>
      <span className="trend-footer-pf">
        {__('Last 30 Days')}
      </span>
    </div>
  );
};

HeatMapChartGraph.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  dataPoint1: PropTypes.string.isRequired,
  dataPoint2: PropTypes.string.isRequired,
  dataPointAvailable: PropTypes.bool.isRequired,
};

export default HeatMapChartGraph;
