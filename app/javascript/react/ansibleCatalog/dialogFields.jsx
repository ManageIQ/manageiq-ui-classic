import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FinalFormField, FinalFormSelect, Condition } from '@manageiq/react-ui-components/dist/forms';
import { required } from 'redux-form-validators';
import { DROPDOWN_OPTIONS, DEFAULT_PLACEHOLDER } from './constants';

export class DialogFields extends React.Component {
  validateValue = value => {
    if (!value) {
      return (__('Required'));
    }
    const exists = this.props.dropdownOptions.find(dialog => dialog.label === value);
    return (exists ? __('Dialog name exists') : '');
  }
  render() {

    return (
      <div>
        <Field options={DROPDOWN_OPTIONS.DIALOG} label={__('Dialog')} name='dialogOption' component={FinalFormSelect} />
        <Condition when="dialogOption" is='existing'>
          <Field
            name='dialog_id'
            label={__('Select Dialog')}
            validateOnMount={true}
            validate={required({ msg: __('Required') })}
            options={this.props.dropdownOptions || []}
            placeholder={DEFAULT_PLACEHOLDER}
            component={FinalFormSelect}
          />
        </Condition>
        <Condition when="dialogOption" is='new'>
          <Field
            name='dialog_name'
            label={__('New')}
            component={FinalFormField}
            validateOnMount={true}
            validate={this.validateValue}
          />
        </Condition>
      </div>
    );
  }
}
DialogFields.propTypes = {
  dropdownOptions: PropTypes.array,
}
export default DialogFields;
