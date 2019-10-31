import React from 'react';
import PropTypes from 'prop-types';
import automateClassFormSchema from './automate-class-form.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
// import { http } from '../../http_api';

const submitForm = () => true;
/*
  http.post('/miq_ae_tools/retrieve_git_datastore', values)
    .then(data => add_flash(data[0].message, data[0].level)); */

const AutomateClassForm = ({
  namespacePath, maxNameLen, initialValues,
}) => (
  <div style={{ paddingBottom: 16 }}>
    <h3>{__('Properties')}</h3>
    <div className="form-horizontal">
      <div className="form-group">
        <label className="col-md-2 control-label">
          {__('Fully Qualified Name')}
        </label>
        <div className="col-md-8">{namespacePath}</div>
      </div>
    </div>
    <MiqFormRenderer
      initialValues={initialValues}
      schema={automateClassFormSchema(maxNameLen)} // TODO
      onSubmit={submitForm}
    />
  </div>
);

AutomateClassForm.propTypes = {
  namespacePath: PropTypes.string.isRequired,
  maxNameLen: PropTypes.number.isRequired,
  initialValues: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    display_name: PropTypes.string,
    description: PropTypes.string.isRequired,
  })).isRequired,
};

export default AutomateClassForm;
