import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Select, SelectItem, Button, Loading, InlineNotification,
} from '@carbon/react';

const ContainerGroupLogs = ({ podId, podName, containers = [] }) => {
  const [selectedContainer, setSelectedContainer] = useState(containers[0] || '');
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = () => {
    setLoading(true);
    setError(null);
    setLogs(null);

    API.post(`/api/container_groups/${podId}`, {
      action: 'logs',
      container: selectedContainer,
    })
      .then((data) => {
        if (data && data.task_id) {
          return API.wait_for_task(data.task_id);
        }
        if (data && data.error) {
          return Promise.reject(data.error);
        }
        return data;
      })
      .then((result) => {
        const logContent = result?.task_results ?? result?.logs ?? '';
        setLogs(logContent);
      })
      .catch((err) => {
        setError(err && err.data && err.data.error && err.data.error.message
          ? err.data.error.message
          : (err && err.message) || __('Error loading logs'));
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="container-group-logs">
      <h3>{sprintf(__('Logs for %s'), podName)}</h3>

      {error && (
        <InlineNotification
          kind="error"
          title={__('Error')}
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          lowContrast
        />
      )}

      <div className="container-group-logs__controls">
        <Select
          id="container-select"
          labelText={__('Select Container')}
          hideLabel
          value={selectedContainer}
          onChange={(e) => setSelectedContainer(e.target.value)}
        >
          {containers.map((name) => (
            <SelectItem key={name} value={name} text={name} />
          ))}
        </Select>

        <div>
          <Button
            onClick={fetchLogs}
            disabled={!selectedContainer || loading}
          >
            {__('View Logs')}
          </Button>
        </div>
      </div>

      {loading && <Loading active small withOverlay={false} className="loading" />}

      {logs && <pre className="container-group-logs__output">{logs}</pre>}
    </div>
  );
};

ContainerGroupLogs.propTypes = {
  podId: PropTypes.string.isRequired,
  podName: PropTypes.string.isRequired,
  containers: PropTypes.arrayOf(PropTypes.string),
};

export default ContainerGroupLogs;
