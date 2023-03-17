import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading } from 'carbon-components-react';
import componentMapper from '../../forms/mappers/componentMapper';
import MiqFormRenderer from '../../forms/data-driven-form';
import { createSchema } from './reconfigure-form.schema';
import { CellAction } from '../miq-data-table/helper';
import ReconfigureTable from './reconfigure-table';
import ReconfigureTemplate from './reconfigure-template';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import {
  setInitialData,
  subFormSubmit,
  setButtonActions,
  reconfigureSubmitData,
  validateMemory,
  getFormSubmitStatus,
  validateCpu,
} from './helper';
import { TYPES, formsData } from './helpers/general';
import { validateDiskSize } from './helpers/disk';
import { setNetworkOptions } from './helpers/network';

const ReconfigureVmForm = ({
  recordId, requestId, roles, options, memory,
}) => {
  const [data, setData] = useState({
    initialValues: {},
    isLoading: true,
    form: {
      title: formsData.reconfigure.title,
      type: TYPES.RECONFIGURE,
      className: formsData.reconfigure.className,
      action: 'edit',
    },
    orchestration_stack_id: '',
    networkOptions: [],
    dataTable: {
      disks: [],
      networkAdapters: [],
      drives: [],
    },
    editingRow: [],
    submitParams: {
      disks: { add: [], resize: [], delete: [] },
      diskIds: {
        add: [], resize: [], delete: [], backup: [],
      },
      networks: { add: [], edit: [], delete: [] },
      networkIds: { add: [], edit: [], delete: [] },
      drives: { connect: [], disconnect: [] },
      driveIds: { connect: [], disconnect: [] },
    },
    changeCounter: 0,
    socket: '',
    cores: '',
    reset: 1,
  });

  useEffect(() => {
    setInitialData(recordId, requestId, data, setData, roles);
  }, [recordId, data.reset]);

  const onSubmit = (formsData) => {
    miqSparkleOn();
    if (data.form.type === TYPES.RECONFIGURE) {
      const URL = `/vm_infra/reconfigure_update/${requestId}?button=submit`;
      miqAjaxButton(URL, reconfigureSubmitData(recordId, data, formsData));
    } else {
      subFormSubmit(data, setData, formsData, roles);
    }
    miqSparkleOff();
  };

  const onCancel = () => {
    if (data.form.type === TYPES.RECONFIGURE) {
      miqSparkleOn();
      const returnURL = '/vm_infra/explorer/';
      const message = sprintf(__('VM Reconfigure Request was cancelled by the user'));
      miqRedirectBack(message, 'success', returnURL);
    } else {
      setData({
        ...data,
        isLoading: false,
        form: {
          title: __('Options'),
          type: TYPES.RECONFIGURE,
          className: 'reconfigureForm',
        },
      });
    }
  };

  const onReset = () => {
    if (data.form.type === TYPES.RECONFIGURE) {
      setData({
        ...data,
        editingRow: [],
        submitParams: {
          disks: { add: [], resize: [], delete: [] },
          diskIds: {
            add: [], resize: [], delete: [], backup: [],
          },
          networks: { add: [], edit: [], delete: [] },
          networkIds: { add: [], edit: [], delete: [] },
          drives: { connect: [], disconnect: [] },
          driveIds: { connect: [], disconnect: [] },
        },
        changeCounter: 0,
        reset: data.reset + 1,
      });
    }
  };

  /** Function to define the custom validation functions */
  const customValidatorMapper = {
    customRequired: ({ hideField }) => (value) => (!value && !hideField ? __('Required') : undefined),
    memoryCheck: () => (value, allValues) => (
      validateMemory(value, allValues.cb_memory, allValues.mem_type, memory) ? undefined : __('Memory value not in range or not a multiple of 4')
    ),
    cpuCheck: ({ field }) => (value, allValues) => (
      validateCpu(value, allValues, field, memory.max_cpu) ? undefined : __(`Total processors value larger than the maximum allowed value`)
    ),
    diskMemoryCheck: ({ size, unit }) => (value, allValues) => (
      validateDiskSize(value, allValues.unit, size, unit) ? undefined : __(`Disk size has to be greater than ${size}${unit}`)
    ),
  };

  /** Function to render the forms by setting form type.
   * return true for no render action.
   */
  // eslint-disable-next-line consistent-return
  const setRenderForm = (row, type, action) => {
    if (type === TYPES.DISK && action === 'edit') {
      return true;
    }
    if (type === TYPES.NETWORK || type === TYPES.EDITNETWORK) {
      if (action === 'edit') {
        const networks = data.submitParams.networkIds;
        if (networks.add.includes(row.id) || networks.edit.includes(row.id) || networks.delete.includes(row.id)) {
          return true;
        }
      }
      if (roles.isVmwareCloud) {
        setNetworkOptions(data.orchestration_stack_id, data, setData, type, action, row);
        return true;
      }
    }
    setData({
      ...data,
      isLoading: false,
      editingRow: row,
      form: {
        title: formsData[type].title,
        type,
        action,
        className: formsData[type].className,
      },
    });
  };

  /** Function to handle the button clicks of the datatable. */
  const setButtonClick = (item) => {
    if (item && item.callbackAction) {
      if (item.callbackAction === TYPES.EDITNETWORK) {
        setRenderForm(item, TYPES.EDITNETWORK, 'edit');
      } else if (item.callbackAction === 'connectDrives') {
        setRenderForm(item, TYPES.DRIVE, 'edit');
      } else if (item.callbackAction === 'resizeDisk') {
        setRenderForm(item, TYPES.RESIZE, TYPES.RESIZE);
      } else {
        setButtonActions(item, data, setData, roles);
      }
    }
  };

  /** Function to execute the click events of from the datables.
  * Like - row's click event  for resize and delete button click event.
  */
  const onCellClick = (selectedRow, cellType) => {
    if (cellType === CellAction.buttonCallback) {
      setButtonClick(selectedRow);
    }
    return true;
  };

  const tableComponentMapper = {
    ...componentMapper,
    'reconfigure-table': ReconfigureTable,
  };

  if (data.isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
  return !data.isLoading && (
    <>
      <MiqFormRenderer
        componentMapper={tableComponentMapper}
        schema={createSchema(recordId, data, setData, roles, options, memory, onCellClick, setRenderForm)}
        FormTemplate={(props) => (
          <ReconfigureTemplate
            canSubmit={getFormSubmitStatus(data)}
            {...props}
          />
        )}
        initialValues={data.initialValues}
        onSubmit={onSubmit}
        onReset={onReset}
        onCancel={() => onCancel(data)}
        validatorMapper={customValidatorMapper}
        clearOnUnmount={data.form.type !== TYPES.RECONFIGURE}
      />
    </>
  );
};

ReconfigureVmForm.propTypes = {
  recordId: PropTypes.arrayOf(PropTypes.any).isRequired,
  requestId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  roles: PropTypes.objectOf(PropTypes.any),
  options: PropTypes.objectOf(PropTypes.any),
  memory: PropTypes.objectOf(PropTypes.any),
};

ReconfigureVmForm.defaultProps = {
  roles: undefined,
  options: undefined,
  memory: undefined,
};

export default ReconfigureVmForm;
