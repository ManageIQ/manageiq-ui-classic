import React, { useState, useEffect } from 'react';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import { Button } from 'carbon-components-react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './miq-ae-customization-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const MiqAeCustomization = ({ dialogRecord, dialogTypes }) => {
  const [data, setData] = useState({
    isLoading: true,
    initialValues: undefined,
  });

  const isEdit = !!(dialogRecord && dialogRecord.id);

  useEffect(() => {
    if (isEdit) {
      http.get(`/miq_ae_customization/old_dialogs_edit_get/${dialogRecord.id}/`).then((recordValues) => {
        if (recordValues) {
          setData({ ...data, isLoading: false, initialValues: recordValues });
        }
      });
    } else {
      const initialValues = {
        name: dialogRecord && dialogRecord.name,
        description: dialogRecord && dialogRecord.description,
        content: (dialogRecord && dialogRecord.content) || '---\n',
        dialog_type: dialogRecord && dialogRecord.dialog_type,
      };
      setData({ ...data, isLoading: false, initialValues });
    }
  }, [dialogRecord]);

  const onSubmit = (values) => {
    miqSparkleOn();

    const params = {
      action: isEdit ? 'edit' : 'create',
      name: values.name,
      description: values.description,
      dialog_type: values.dialog_type,
      content_data: values.content,
      old_data: data.initialValues,
      button: dialogRecord.id ? 'save' : 'add',
    };

    const request = isEdit
      ? http.post(`/miq_ae_customization/provision_dialogs_update/${dialogRecord.id}`, params)
      : http.post(`/miq_ae_customization/provision_dialogs_update/`, params);

    request
      .then(() => {
        const confirmation = isEdit ? __(`Dialog "${values.name}" was saved`) : __(`Dialog "${values.name}" was added`);
        miqRedirectBack(sprintf(confirmation, values.name), 'success', '/miq_ae_customization/explorer');
      })
      .catch(miqSparkleOff);
  };

  const onCancel = () => {
    const confirmation = dialogRecord.id ? __(`Edit of Dialog "${dialogRecord.name}" cancelled by the user`)
      : __(`Add of new Dialog was cancelled by the user`);
    const message = sprintf(
      confirmation
    );
    miqRedirectBack(message, 'warning', '/miq_ae_customization/explorer');
  };

  return (!data.isLoading
    ? (
      <div className="dialog-provision-form">
        <MiqFormRenderer
          schema={createSchema(dialogTypes)}
          initialValues={data.initialValues}
          onSubmit={onSubmit}
          onCancel={onCancel}
          canReset={!!dialogRecord.id}
          validate={() => {}}
          FormTemplate={(props) => <FormTemplate {...props} recId={dialogRecord.id} />}
        />
      </div>
    ) : null
  );
};

const FormTemplate = ({
  formFields, recId,
}) => {
  const {
    handleSubmit, onReset, onCancel, getState,
  } = useFormApi();
  const { valid, pristine } = getState();
  const submitLabel = !!recId ? __('Save') : __('Add');
  return (
    <form onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {() => (
          <div className="custom-button-wrapper">
            { !recId
              ? (
                <Button
                  disabled={!valid}
                  kind="primary"
                  className="btnRight"
                  type="submit"
                  variant="contained"
                >
                  {submitLabel}
                </Button>
              ) : (
                <Button
                  disabled={!valid || pristine}
                  kind="primary"
                  className="btnRight"
                  type="submit"
                  variant="contained"
                >
                  {submitLabel}
                </Button>
              )}
            {!!recId
              ? (
                <Button
                  disabled={pristine}
                  kind="secondary"
                  className="btnRight"
                  variant="contained"
                  onClick={onReset}
                  type="button"
                >
                  { __('Reset')}
                </Button>
              ) : null}

            <Button variant="contained" type="button" onClick={onCancel} kind="secondary">
              { __('Cancel')}
            </Button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};

MiqAeCustomization.propTypes = {
  dialogRecord: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
    dialog_type: PropTypes.string,
  }),
  dialogTypes: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
  ).isRequired,
};

MiqAeCustomization.defaultProps = {
  dialogRecord: undefined,
};

FormTemplate.propTypes = {
  formFields: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number }),
    PropTypes.shape({ name: PropTypes.string }),
    PropTypes.shape({ description: PropTypes.string }),
    PropTypes.shape({ content: PropTypes.string }),
    PropTypes.shape({ dialog_type: PropTypes.string }),
  ),
  recId: PropTypes.number,
};

FormTemplate.defaultProps = {
  formFields: undefined,
  recId: undefined,
};

export default MiqAeCustomization;
