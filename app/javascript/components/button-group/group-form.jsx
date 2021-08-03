import React, { useState, useEffect} from 'react';
import groupFormSchema from './group-form-schema';
import MiqFormRenderer from '@@ddf';
import { Loading } from 'carbon-components-react';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import PropTypes from 'prop-types';

const GroupForm = ({rec_id, available_fields, fields}) => {

  const [{ isLoading, initialValues, buttonIcon, unassignedButtons}, setState] = useState({
    isLoading: !!rec_id
  });

  /** Function to change the format of the unassiged and selected buttons from the format
   * [[string,number]] to [{label:string, value:number}] */
  const formatButton = (buttons) => {
    const options = [];
    buttons && buttons.map((btn) => options.push({ label: btn[0], value: btn[1] })); 
    return options;
  }

  const buttonOptions = formatButton(available_fields.concat(fields))

  useEffect(() => {
    if (rec_id) {
      API.get(`/api/custom_button_sets/${rec_id}`).then((initialValues) => {        
        setState((state) => ({ 
          ...state, 
          initialValues,
          buttonIcon: initialValues.set_data.button_icon,
          unassignedButtons: buttonOptions,
          isLoading: false }));
      });
    }else{
      setState((state) => ({ 
        ...state, 
        unassignedButtons: buttonOptions,
        isLoading: false }));
    }
  }, []);

  const onSubmit = (values) => {
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
  }

  const onCancel = () => {
    const message = sprintf(
      rec_id
        ? __('Edit of Button group "%s" was canceled by the user.')
        : __('Creation of new Button group was canceled by the user.'),
      initialValues && initialValues.name,
    );
    miqRedirectBack(message, 'warning', '/miq_ae_customization/explorer');
  };

  /** Call back function executed when the Icon field is changed */
  const iconChanged = (newIcon) => {
    setState((state) => ({ 
      ...state,
      buttonIcon: newIcon
    }));
  }

    if (isLoading) return <Loading className="export-spinner" withOverlay={false} small />;
    return !isLoading && (
        <div className='col-md-12'>
          <MiqFormRenderer
              initialValues={initialValues}
              schema={groupFormSchema(buttonIcon, unassignedButtons, iconChanged)}
              onSubmit={onSubmit}
              onCancel={onCancel}
          />
      </div>
    )
}

GroupForm.propTypes = {
  rec_id: PropTypes.number,
};

GroupForm.defaultProps = {
  rec_id: undefined,
};

export default GroupForm;