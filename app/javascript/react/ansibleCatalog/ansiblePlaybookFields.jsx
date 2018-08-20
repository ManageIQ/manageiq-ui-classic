/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import { Field } from 'react-final-form';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { required } from 'redux-form-validators';
import { FieldArray } from 'react-final-form-arrays';
import { Button } from 'patternfly-react';
import { FinalFormSelect } from '@manageiq/react-ui-components/dist/forms';
import * as catalogActions from './catalogActions';
import { ExtraVarRow } from './extraVarRow';
import { DEFAULT_PLACEHOLDER, ANSIBLE_PLAYBOOK_FIELDS_PROPS } from './constants';
import { renderFormField, getAnsiblePlaybookFields } from './helpers';

export class AnsiblePlaybookFields extends React.Component {
  constructor(props) {
    super(props);

    const { formValues, prefix } = this.props;
    this.state = {
      isProvisioning: prefix === 'provision',
      repoId: formValues[`${prefix}_repository_id`],
    };
  }
  componentDidMount() {
    const { formValues, prefix } = this.props;

    if (formValues[`${prefix}_cloud_type`]) {
      this.updateCloudCredentialsList(formValues[`${prefix}_cloud_type`]);
    }
    if (this.state.repoId) {
      this.updatePlaybookList();
    }
  }

  updatePlaybookList() {
    const { region, loadPlaybooks, prefix } = this.props;
    if (!this.state.repoId) {
      return;
    }
    loadPlaybooks(region, this.state.repoId, prefix);
  }
  updateCloudCredentialsList(cloudType) {
    this.props.loadCloudCredentials(this.props.prefix, cloudType);
  }

  addExtraVarToState() {
    this.props.addExtraVars(`${this.props.prefix}_extra_vars`, undefined);
  }

  render() {
    const {
      prefix, data, changeField, children, formValues,
    } = this.props;
    const { isProvisioning } = this.state;
    const dropdowns = data.dropdowns || {};
    const extraVarsField = `${prefix}_extra_vars`;
    const formFields = getAnsiblePlaybookFields(this.props, this.state.isProvisioning);
    const { initialValues } = this.props;
    return (
      <div className="row">
        <div className="col-md-12 col-lg-6">
          <Field
            label={__('Repository')}
            name={`${prefix}_repository_id`}
            validateOnMount={isProvisioning}
            validate={isProvisioning ? required({ msg: __('Required') }) : undefined}
            render={({ input, meta }) => (
              <FinalFormSelect
                inputColumnSize={8}
                labelColumnSize={3}
                name={`${prefix}_repository_id`}
                searchable
                options={dropdowns.repos || []}
                placeholder={DEFAULT_PLACEHOLDER}
                validateOnMount={isProvisioning}
                validate={isProvisioning ? required({ msg: __('Required') }) : undefined}
                label={__('Repository')}
                input={{
                  ...input,
                  onChange: (value) => {
                    if (value) {
                      this.setState({ repoId: value }, this.updatePlaybookList);
                      changeField(`${prefix}_playbook_id`, '');
                    }
                    input.onChange(value);
                  },
                }}
                meta={meta}
              />)}
          />
          { formFields.map(field => renderFormField(field, formValues)) }
          <Field
            name={`${prefix}_cloud_type`}
            label={__('Cloud Type')}
            render={({ input, meta }) => (
              <FinalFormSelect
                inputColumnSize={8}
                labelColumnSize={3}
                name={`${prefix}_cloud_type`}
                options={dropdowns.cloudTypes || []}
                label={__('Cloud Type')}
                placeholder={DEFAULT_PLACEHOLDER}
                input={{
                  ...input,
                  onChange: (value) => {
                    if (value) {
                      this.updateCloudCredentialsList(value);
                    }
                    input.onChange(value);
                  },
                }}
                meta={meta}
              />)}
          />
          {
            (formValues[`${prefix}_cloud_type`] !== '') &&
            <Field
              inputColumnSize={8}
              labelColumnSize={3}
              name={`${prefix}_cloud_credential_id`}
              label={__('Cloud Credentials')}
              component={FinalFormSelect}
              options={dropdowns[`${prefix}_cloudCredentials`] || []}
              placeholder={DEFAULT_PLACEHOLDER}
            />
          }
        </div>
        <div className="col-md-12 col-lg-6">
          <div className="form-group">
            <div className="col-xs-2">
              <label className="control-label">{__('Variables & Default Values')}</label>
            </div>
            <div className="col-xs-8">
              <div>
                <Button
                  type="button"
                  bsStyle="primary"
                  onClick={() => { this.addExtraVarToState(); }
                  }
                >
                  {__('Add')}
                </Button>
              </div>
              <table className="table table-bordered table-striped">
                <thead>
                  {formValues[extraVarsField].length > 0 &&
                  <tr>
                    <th>{__('Variable')}</th>
                    <th>{__('Default')}</th>
                    <th>{__('Action')}</th>
                  </tr>
                  }
                </thead>
                <tbody>
                  <FieldArray
                    name={extraVarsField}
                    isEqual={(prevValues, newValues) => {
                      const fieldValuesChanged = JSON.stringify(formValues[extraVarsField]) !== JSON.stringify(initialValues[extraVarsField]);
                      const fieldSizeChanged = prevValues.length !== newValues.length;
                      return !fieldValuesChanged && !fieldSizeChanged;
                    }}
                  >
                    {({ fields }) =>
                      fields.map((name, index) => (
                        <ExtraVarRow
                          fieldName={name}
                          key={name}
                          fieldIndex={index}
                          removeField={fields.remove}
                          changeField={changeField}
                          extraVarsField={extraVarsField}
                          values={formValues[extraVarsField]}
                        />
                      ))}
                  </FieldArray>
                </tbody>
              </table>
            </div>
          </div>
          {children}
        </div>
      </div>
    );
  }
}

AnsiblePlaybookFields.propTypes = ANSIBLE_PLAYBOOK_FIELDS_PROPS;
const mapStateToProps = state => ({
  data: state.ansibleCatalog || {},
});
const actions = { ...catalogActions };
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AnsiblePlaybookFields);
