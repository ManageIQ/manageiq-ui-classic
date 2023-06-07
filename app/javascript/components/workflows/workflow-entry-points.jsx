import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading, Modal, ModalBody } from 'carbon-components-react';
import MiqDataTable from '../miq-data-table';
import { workflowsEntryPoints } from './helper';
import { http } from '../../http_api';

const WorkflowEntryPoints = ({ field, selected, type }) => {
  const [data, setData] = useState({
    isLoading: true, list: {}, selectedItemId: selected,
  });

  const workflowTypes = {
    provision: __('Provision'),
    reconfigure: __('Reconfigure'),
    retire: __('Retirement'),
  };

  useEffect(() => {
    http.post(`/catalog/ae_tree_select_toggle?typ=${type}`, {}, { headers: {}, skipJsonParsing: true })
      .then((_data) => {
        API.get('/api/configuration_script_payloads?expand=resources')
          .then((response) => {
            setData({
              ...data,
              isLoading: false,
              list: workflowsEntryPoints(response),
            });
          });
      });
  }, []);

  /** Function to handle a row's click event. */
  const onSelect = (selectedItemId) => {
    setData({
      ...data,
      selectedItemId: (data.selectedItemId === selectedItemId) ? undefined : selectedItemId,
    });
    const params = `cfp-${encodeURIComponent(selectedItemId)}&tree=automate_catalog_tree&field=${field}`;
    window.miqJqueryRequest(`/catalog/ae_tree_select/?id=${params}&typ=${type}`);
  };
  if (data.isLoading) {
    return (<Loading active small withOverlay={false} className="loading" />);
  }
  /** Function to handle the modal box close button click event. */
  const onCloseModal = () => {
    document.getElementById(`${type}-workflows`).innerHTML = '';
    http.post('/catalog/ae_tree_select_toggle?button=cancel', {}, { headers: {}, skipJsonParsing: true });
  };
  /** Function to handle the modal box apply button click event. */
  const onApply = () => {
    const seletedItem = data.list.rows.find((item) => item.id === data.selectedItemId);
    const name = seletedItem.name.text;
    if (seletedItem) {
      const nameField = document.getElementById(field);
      const selectedField = document.getElementById(`${type}_configuration_script_id`);

      if (nameField && selectedField) {
        nameField.value = name;
        selectedField.value = data.selectedItemId;
        http.post('/catalog/ae_tree_select_toggle?button=submit&automation_type=workflow', {}, { headers: {}, skipJsonParsing: true })
          .then((_data) => {
            document.getElementById(`${type}-workflows`).innerHTML = '';
          });
      }
    }
  };
  return (
    <Modal
      open
      modalHeading={sprintf(__('Select Embedded Workflow - %s Entry Point'), workflowTypes[type])}
      primaryButtonText={__('Apply')}
      secondaryButtonText={__('Cancel')}
      onRequestSubmit={onApply}
      onRequestClose={onCloseModal}
      className="workflows-entry-point-modal"
    >
      <ModalBody className="workflows-entry-point-modal-body">
        <MiqDataTable
          headers={data.list.headers}
          rows={data.list.rows}
          onCellClick={(selectedRow) => onSelect(selectedRow.id)}
          showPagination={false}
          truncateText={false}
          mode="automated-workflow-entry-points"
          gridChecks={[data.selectedItemId]}
          size="md"
        />
      </ModalBody>
    </Modal>

  );
};
WorkflowEntryPoints.propTypes = {
  field: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  selected: PropTypes.string,
};

WorkflowEntryPoints.defaultProps = {
  selected: '',
};

export default WorkflowEntryPoints;
