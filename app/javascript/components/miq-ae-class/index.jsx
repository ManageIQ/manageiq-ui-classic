import React, { useState, useEffect } from 'react';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import { Button } from 'carbon-components-react';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import PropTypes from 'prop-types';
import createSchema from './class-form.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import miqFlash from '../../helpers/miq-flash';

const MiqAeClass = ({ classRecord, fqname }) => {
  const [data, setData] = useState({
    isLoading: true,
    initialValues: undefined,
  });

  const isEdit = !!(classRecord && classRecord.id);

  useEffect(() => {
    if (isEdit) {
      http.get(`/miq_ae_class/edit_class_record/${classRecord.id}/`).then((recordValues) => {
        if (recordValues) {
          setData({ ...data, isLoading: false, initialValues: recordValues });
        }
      });
    } else {
      const initialValues = {
        fqname,
        name: classRecord && classRecord.name,
        display_name: classRecord && classRecord.display_name,
        description: classRecord && classRecord.description,
      };
      setData({ ...data, isLoading: false, initialValues });
    }
  }, [classRecord]);

  const onSubmit = (values) => {
    miqSparkleOn();

    const params = {
      action: isEdit ? 'edit' : 'create',
      name: values.name,
      display_name: values.display_name,
      description: values.description,
      old_data: data.initialValues,
      button: classRecord.id ? 'save' : 'add',
    };

    const request = isEdit
      ? http.post(`/miq_ae_class/class_update/${classRecord.id}`, params)
      : http.post(`/miq_ae_class/class_update/`, params);

    request
      .then((response) => {
        if (response.status === 200) {
          const confirmation = isEdit ? __(`Class "${values.name}" was saved`) : __(`Class "${values.name}" was added`);
          miqRedirectBack(sprintf(confirmation, values.name), 'success', '/miq_ae_class/explorer');
        } else {
          miqSparkleOff();
          miqFlash('error', response.error);
        }
      })
      .catch(miqSparkleOff);
  };

  const onCancel = () => {
    const confirmation = classRecord.id ? __(`Edit of Class "${classRecord.name}" cancelled by the user`)
      : __(`Add of new Class was cancelled by the user`);
    const message = sprintf(
      confirmation
    );
    miqRedirectBack(message, 'warning', '/miq_ae_class/explorer');
  };

  const customValidatorMapper = {
    customValidatorForNameField: () => (value) => {
      if (!value) {
        return __('Required');
      }
      if (!value.match('^[a-zA-Z0-9_.-]*$')) {
        return __('Name may contain only alphanumeric and _ . - characters');
      }
      return false;
    },
  };

  return (!data.isLoading
    ? (
      <div className="dialog-provision-form">
        <MiqFormRenderer
          schema={createSchema(fqname)}
          initialValues={data.initialValues}
          validatorMapper={customValidatorMapper}
          onSubmit={onSubmit}
          onCancel={onCancel}
          canReset={!!classRecord.id}
          validate={() => {}}
          FormTemplate={(props) => <FormTemplate {...props} recId={classRecord.id} />}
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

MiqAeClass.propTypes = {
  classRecord: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    display_name: PropTypes.string,
    description: PropTypes.string,
  }),
  fqname: PropTypes.string.isRequired,
};

MiqAeClass.defaultProps = {
  classRecord: undefined,
};

FormTemplate.propTypes = {
  formFields: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number }),
    PropTypes.shape({ name: PropTypes.string }),
    PropTypes.shape({ display_name: PropTypes.string }),
    PropTypes.shape({ description: PropTypes.string }),
  ),
  recId: PropTypes.number,
};

FormTemplate.defaultProps = {
  formFields: undefined,
  recId: undefined,
};

export default MiqAeClass;
