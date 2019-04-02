import React from 'react';
import PropTypes from 'prop-types';
import datastoreSchema from './datastore-via-git.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { http } from '../../http_api';

const submitForm = values =>
  http.post('/miq_ae_tools/retrieve_git_datastore', values)
    .then(data => add_flash(data[0].message, data[0].level));

const ImportDatastoreViaGit = ({ disableSubmit }) => (
  <div>
    {disableSubmit
    && (
    <form className="form-horizontal">
      <div className="form-group">
        <div className="control-label col-md-2" />
        <div className="col-md-10"><h3>{__('Please enable the git owner role in order to import git repositories')}</h3></div>
      </div>
    </form>
    )}
    <MiqFormRenderer
      initialValues={{ git_verify_ssl: true }}
      schema={datastoreSchema()}
      onSubmit={submitForm}
      disableSubmit={disableSubmit ? ['pristine', 'dirty'] : ['pristine', 'invalid']}
    />
  </div>
);

ImportDatastoreViaGit.propTypes = {
  disableSubmit: PropTypes.bool,
};

ImportDatastoreViaGit.defaultProps = {
  disableSubmit: false,
};

export default ImportDatastoreViaGit;
