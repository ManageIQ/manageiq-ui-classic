import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Loading } from '@carbon/react';
import MiqDataTable from '../miq-data-table';
import { http } from '../../http_api';
import { normTableData, sizingTableData } from './helpers';

const VmRightSize = ({ dataUrl, backUrl = undefined }) => {
  const [{ isLoading, data }, setState] = useState({ isLoading: true, data: null });

  useEffect(() => {
    http.get(dataUrl)
      .then((response) => setState({ isLoading: false, data: response.data }))
      .catch(() => setState({ isLoading: false, data: null }));
  }, [dataUrl]);

  if (isLoading) {
    return <Loading className="export-spinner" withOverlay={false} small />;
  }
  if (!data) {
    return null;
  }

  const {
    norm, conservative, moderate, aggressive, cpu_minimum: cpuMin, mem_minimum: memMin,
  } = data;

  return (
    <div id="tab_div">
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

VmRightSize.propTypes = {
  dataUrl: PropTypes.string.isRequired,
  backUrl: PropTypes.string,
};

export default VmRightSize;
