import React, { useState, useEffect } from 'react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import PropTypes from 'prop-types';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import createSchema from './settings-tasks-form.schema';
import loadTable from './load-table-helper';
import GtlView from '../gtl-view';

const SettingsTasksForm = ({
  allTasks, zones, users, timePeriods, taskStates, tz,
}) => {
  const [initialValues] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const loadDefaultTable = () => {
    const values = {
      // eslint-disable-next-line max-len
      zone: 'all', timePeriod: '0', taskStatus: ['queued', 'running', 'completed_ok', 'completed_error', 'completed_warn'], taskState: 'all', user: 'all',
    };
    if (allTasks) {
      loadTable(values, tz, users);
    } else {
      values.user = users;
      loadTable(values, tz, users);
    }
  };

  useEffect(() => {
    loadDefaultTable();
    setIsLoading(false);
  }, []);

  const onSubmit = (values) => {
    loadTable(values, tz, users);
  };

  return !isLoading && (
    <div className="tasks-form">
      <MiqFormRenderer
        FormTemplate={(props) => <FormTemplate {...props} />}
        schema={createSchema(allTasks, zones, users, timePeriods, taskStates)}
        initialValues={initialValues}
        onSubmit={onSubmit}
        canReset
        onReset={() => {
          add_flash(__('All changes have been reset'), 'warn');
          loadDefaultTable();
        }}
      />
      <GtlView showUrl="/miq_task/show" />
    </div>
  );
};

const FormTemplate = ({
  formFields,
}) => {
  const {
    handleSubmit, onReset, getState,
  } = useFormApi();
  const { valid, pristine, dirtySinceLastSubmit } = getState();
  return (
    <form onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {({ values }) => (
          <div className="custom-button-wrapper">
            <button
              disabled={values.taskStatus.length === 0 || !valid || (pristine && !dirtySinceLastSubmit)}
              className="bx--btn bx--btn--primary btnRight"
              id="submit"
              type="submit"
              variant="contained"
            >
              {__('Apply')}
            </button>
            <button
              disabled={!valid || (pristine && !dirtySinceLastSubmit)}
              className="bx--btn bx--btn--secondary btnRight"
              variant="contained"
              id="reset"
              onClick={onReset}
              type="button"
            >
              {__('Reset')}
            </button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};

SettingsTasksForm.propTypes = {
  allTasks: PropTypes.bool.isRequired,
  zones: PropTypes.arrayOf(PropTypes.any).isRequired,
  users: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.string]).isRequired,
  timePeriods: PropTypes.arrayOf(PropTypes.any).isRequired,
  taskStates: PropTypes.arrayOf(PropTypes.any).isRequired,
  tz: PropTypes.objectOf(PropTypes.any).isRequired,
};

FormTemplate.propTypes = {
  formFields: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default SettingsTasksForm;
