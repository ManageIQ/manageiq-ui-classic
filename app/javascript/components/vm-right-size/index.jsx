import PropTypes from 'prop-types';
import { Button } from '@carbon/react';
import MiqDataTable from '../miq-data-table';
import { normTableData, sizingTableData } from './helpers';

const VmRightSize = ({ data, backUrl }) => {
  if (!data) {
    return null;
  }

  const {
    norm, conservative, moderate, aggressive, cpu_minimum: cpuMin, mem_minimum: memMin,
  } = data;

  return (
    <div>
      <h3>{__("Normal Operating Ranges (up to 30 days' data)")}</h3>
      <MiqDataTable {...normTableData(norm)} />

      <hr />
      <h3>{__('Right-Sizing (Conservative - derived from Absolute Maximum)')}</h3>
      <MiqDataTable {...sizingTableData(conservative, data.cpu_total_cores, data.mem_cpu)} />

      <hr />
      <h3>{__('Right-Sizing (Moderate - derived from High NORM)')}</h3>
      <MiqDataTable {...sizingTableData(moderate, data.cpu_total_cores, data.mem_cpu)} />

      <hr />
      <h3>{__('Right-Sizing (Aggressive - derived from Average NORM)')}</h3>
      <MiqDataTable {...sizingTableData(aggressive, data.cpu_total_cores, data.mem_cpu)} />

      <p className="note">
        {sprintf(
          __('* Recommendations are subject to minimum of CPU: %s and Memory: %s.'),
          cpuMin,
          memMin,
        )}
      </p>

      {backUrl && (
        <Button kind="secondary" className="vm-right-size-back-button" onClick={() => miqAjaxButton(backUrl)}>
          {__('Back')}
        </Button>
      )}
    </div>
  );
};

const sizingShape = PropTypes.shape({
  recommended_vcpus: PropTypes.string,
  vcpus_change_pct: PropTypes.string,
  vcpus_change: PropTypes.string,
  recommended_mem: PropTypes.string,
  mem_change_pct: PropTypes.string,
  mem_change: PropTypes.string,
}).isRequired;

VmRightSize.propTypes = {
  data: PropTypes.shape({
    norm: PropTypes.shape({
      cpu_mhz_max: PropTypes.string,
      cpu_mhz_high: PropTypes.string,
      cpu_mhz_avg: PropTypes.string,
      cpu_mhz_low: PropTypes.string,
      cpu_pct_max: PropTypes.string,
      cpu_pct_high: PropTypes.string,
      cpu_pct_avg: PropTypes.string,
      cpu_pct_low: PropTypes.string,
      mem_max: PropTypes.string,
      mem_high: PropTypes.string,
      mem_avg: PropTypes.string,
      mem_low: PropTypes.string,
      mem_pct_max: PropTypes.string,
      mem_pct_high: PropTypes.string,
      mem_pct_avg: PropTypes.string,
      mem_pct_low: PropTypes.string,
    }).isRequired,
    conservative: sizingShape,
    moderate: sizingShape,
    aggressive: sizingShape,
    cpu_minimum: PropTypes.string.isRequired,
    mem_minimum: PropTypes.string.isRequired,
    cpu_total_cores: PropTypes.string,
    mem_cpu: PropTypes.string,
  }),
  backUrl: PropTypes.string,
};

export default VmRightSize;
