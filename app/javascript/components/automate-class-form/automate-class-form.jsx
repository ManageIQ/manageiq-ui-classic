import React from 'react';
// import PropTypes from 'prop-types';
import automateClassFormSchema from './automate-class-form.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
// import { http } from '../../http_api';

const submitForm = values =>
  http.post('/miq_ae_tools/retrieve_git_datastore', values)
    .then(data => add_flash(data[0].message, data[0].level));

const AutomateClassForm = ({ disableSubmit }) => (
  <div style={{ paddingBottom: 16 }}>
    <MiqFormRenderer
      initialValues={{ git_verify_ssl: true }}
      schema={automateClassFormSchema()}
      onSubmit={submitForm}
      disableSubmit={disableSubmit ? ['pristine', 'dirty'] : ['pristine', 'invalid']}
    />
  </div>
);

export default AutomateClassForm;

/*
- url = url_for_only_path(:action => 'form_field_changed', :id => (@ae_class.id || 'new'))
- obs = {:interval => '.5', :url => url}.to_json
%h3
  = _('Properties')
.form-horizontal
  .form-group
    %label.col-md-2.control-label
      = _('Fully Qualified Name')
    .col-md-8
      = @sb[:namespace_path]
  .form-group
    %label.col-md-2.control-label
      = _('Name')
    .col-md-8
      = text_field_tag("name", @edit[:new][:name],
                        :maxlength         => ViewHelper::MAX_NAME_LEN,
                        :class => "form-control",
                        "data-miq_observe" => obs)
      = javascript_tag(javascript_focus('name'))
  .form-group
    %label.col-md-2.control-label
      = _('Display Name')
    .col-md-8
      = text_field_tag("display_name", @edit[:new][:display_name],
                        :maxlength         => ViewHelper::MAX_NAME_LEN,
                        :class => "form-control",
                        "data-miq_observe" => obs)
  .form-group
    %label.col-md-2.control-label
      = _('Description')
    .col-md-8
      = text_field_tag("description", @edit[:new][:description],
                       :maxlength => ViewHelper::MAX_NAME_LEN,
                       :class => "form-control",
                       "data-miq_observe" => obs)
-------------
import React from 'react';
import PropTypes from 'prop-types';
import datastoreSchema from './automate-class-form.schema';
import MiqFormRenderer from '../../forms/data-driven-form';
import { http } from '../../http_api';

const submitForm = values =>
  http.post('/miq_ae_tools/retrieve_git_datastore', values)
    .then(data => add_flash(data[0].message, data[0].level));

const ImportDatastoreViaGit = ({ disableSubmit }) => (
  <div style={{ paddingBottom: 16 }}>
    {disableSubmit
    && (
    <h3>{__('Please enable the git owner role in order to import git repositories')}</h3>
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
*/
