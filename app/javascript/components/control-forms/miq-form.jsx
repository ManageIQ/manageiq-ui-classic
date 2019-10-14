import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Grid } from 'patternfly-react';

import MiqFormRenderer from '../../forms/data-driven-form';
import handleFailure from '../../helpers/handle-failure';
import { API, http } from '../../http_api';


// on cancel, DoNav to.. ; TODO DoNav + flash later? or do those miqAjaxButton to ?button=cancel do anything else?
// on cancel, do.. ;TODO maybe add cancelFlash too (with), and same for submit?
function leave(opt) {
  if (opt.call) { // onCancel function
    opt();
  } else if (opt.url) { // DoNav to
    if (opt.flash) { miqFlashLater(opt.flash); } // TODO syntax?
    window.DoNav(opt.url);
  } else if (opt.ajax) {  // miqAjaxButton
    if (opt.flash) { miqFlashLater(opt.flash); } // TODO syntax?
    window.miqAjaxButton(opt.ajax, opt.ajaxArg); // TODO syntax?
  } else {
    console.error("MiqForm.cancel: invalid cancel option value", opt);
  }
}

// default error handler
function defaultError(data) {
  //TODO flash?
}

export function MiqForm({
  name, // form name, for debugging and redux
  initialValues,  // TODO or create initial values from schema?
  schema, // TODO or pass createSchema?
  propTypes = {}, defaultProps = {}, // TODO why extra props?
  cancel, // what to do on cancel - see leave() above
  loadRecord, // (id, isCopy) => Promise(record) - how to load record (it should also rename and preprocess values if needed) ; TODO merge with initialValues ;; TODOTODO initialValues is used for pristine checking when editing?

  save, // (values, recordId, copyId) => Promise
  success, // what to do on successful submit - see leave() above
  error = defaultError, // what to do on submit error - function, no leave()
}) {
  const thisForm = (props) => {
    const { recordId, copyId } = props;

    return (
      <Grid fluid>
        <MiqFormRenderer
          initialValues={initialValues}
          schema={schema}
          onSubmit={(values) => save(values, recordId, copyId).then(() => leave(success), error)}
          onCancel={() => leave(cancel)}
          onReset={() => add_flash(__('All changes have been reset'), 'warn')}
          canReset={recordId || copyId} // can't reset on Add forms
          buttonsLabels={{
            submitLabel: recordId ? __('Save') : __('Add'),
          }}
        />
      </Grid>
    );
  };

  thisForm.name = name;
  thisForm.propTypes = {
    ...propTypes,
    recordId: PropTypes.string, // when editing
    copyId: PropTypes.string, // when making a copy
  };
  thisForm.defaultProps = {
    ...defaultProps,
    recordId: null,
    copyId: null,
  };

  return thisForm;
}
