import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import PropTypes from 'prop-types';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './group-form.schema';

const GroupForm = ({
  rec_id, available_fields, fields, url,
}) => {
  const [{
    isLoading, initialValues, buttonIcon, unassignedButtons,
  }, setState] = useState({
    isLoading: !!rec_id,
  });
  console.log('rec_id, available_fields, fields, url,', rec_id, available_fields, fields, url);

  const disableSubmit = ['invalid'];
  /** Function to change the format of the unassiged and selected buttons from the format
   * [[string,number]] to [{label:string, value:number}] */
  const formatButton = (buttons) => {
    const options = [];
    buttons && buttons.map((btn) => options.push({ label: btn[0], value: btn[1] }));
    return options;
  };

  const buttonOptions = available_fields.length > 0 ? formatButton(available_fields.concat(fields)) : [];

  useEffect(() => {
    if (rec_id) {
      API.get(`/api/custom_button_sets/${rec_id}`).then((initialValues) => {
        setState((state) => ({
          ...state,
          initialValues,
          buttonIcon: initialValues.set_data.button_icon,
          unassignedButtons: buttonOptions,
          isLoading: false,
        }));
      });
    } else {
      setState((state) => ({
        ...state,
        unassignedButtons: available_fields.length > 0 ? buttonOptions : [],
        isLoading: false,
      }));
    }
  }, []);

  //   if (rec_id && initialValues) {
  //     if (initialValues.set_data.button_icon !== buttonIcon) {
  //         disableSubmit = ['pristine', 'invalid'];
  //     } else {
  //       disableSubmit = ['pristine', 'invalid'];
  //     }
  //   } else {
  //     disableSubmit = ['invalid'];
  //   }

  const onSubmit = (values) => {
    console.log('valuesss', values);
    console.log('buttonIcon', buttonIcon);
    values.set_data.button_color = (values.set_data && values.set_data.button_color) ? values.set_data.button_color : '#000';
    values.set_data.button_icon = buttonIcon;
    miqSparkleOn();
    const request = rec_id
      ? API.patch(`/api/custom_button_sets/${rec_id}`, values)
      : API.post('/api/custom_button_sets', values);
    request.then(() => {
      const message = sprintf(
        rec_id
          ? __('Modification of Button group "%s" has been successfully.')
          : __('Button group "%s" has been successfully added.'),
        values.name,
      );
      miqRedirectBack(message, undefined, '/miq_ae_customization/explorer');
    }).catch((e) => miqSparkleOff());
  };

  const onCancel = () => {
    const message = sprintf(
      rec_id
        ? __('Edit of Button group "%s" was canceled by the user.')
        : __('Creation of new Button group was canceled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/miq_ae_customization/explorer');
  };

  if (isLoading || (unassignedButtons===undefined)) return <Loading className="export-spinner" withOverlay={false} small />;
  return (!isLoading && unassignedButtons) && (
    <div className="col-md-12 button-group-form">
      <MiqFormRenderer
        schema={createSchema( buttonIcon, unassignedButtons, url, setState)}
        initialValues={initialValues}
        canReset={!!rec_id}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};

GroupForm.propTypes = {
  rec_id: PropTypes.number,
};

GroupForm.defaultProps = {
  rec_id: undefined,
};

export default GroupForm;
