import React from 'react';
import { Form, Field, FormSpy} from 'react-final-form';
import { Form as PfForm, Button, TabContainer, TabContent, Spinner, TabPane, Nav, NavItem, MessageDialog, Icon } from 'patternfly-react';
import AnsiblePlaybookFields from './ansiblePlaybookFields';
import arrayMutators from 'final-form-arrays';
import FormButtons from '../../forms/form-buttons';
import * as helpers from './helpers';
import {ANSIBLE_FIELDS, DEFAULT_PLACEHOLDER, CATALOG_ITEM_PROPS, DROPDOWN_OPTIONS} from './constants';
import { FinalFormSelect } from '@manageiq/react-ui-components/dist/forms';
import { DialogFields } from './dialogFields';
import {cloneDeep} from 'lodash';

export class AnsibleCatalogItemForm extends React.Component {
constructor(props) {
    super(props);
    const initialValues = helpers.setFormDefaultValues()
    this.state = {
      initialValues,
      formValues: cloneDeep(initialValues),
      isLoading: true,
      isNew: true,
      showCopyProvisionDialog: false,
    }
  }
  componentDidMount(){
    const { loadCatalogs, loadDialogs, loadRepos, loadCredentials, loadCloudTypes,
      loadCatalogItem, loadCloudCredential, region, catalogItemFormId, availableCatalogs } = this.props;
    loadCatalogs(availableCatalogs);
    loadDialogs();
    loadRepos(region);
    loadCredentials('Machine');
    loadCredentials('Vault');
    loadCloudTypes();
    if (catalogItemFormId){
      this.setState({isNew: false});
      loadCatalogItem(catalogItemFormId).then(() => {
        const {ansibleCatalog} = this.props;
        const {initialValues} = this.state;
        const catalogItem = ansibleCatalog.catalogItem;
        loadCloudCredential(catalogItem.config_info.provision.cloud_credential_id).then(() => {
                    ['name','description','long_description','service_template_catalog_id'].forEach((field) => {
                      if (catalogItem[field]){
                        initialValues[field] = catalogItem[field];
                      }
                    });
                    ANSIBLE_FIELDS.forEach((field) => {
                      ['provision', 'retirement'].forEach(prefix => {
                        if (catalogItem.config_info[prefix][field]){
                          initialValues[`${prefix}_${field}`] = catalogItem.config_info[prefix][field];
                        }
                      });
                   });
                   initialValues['provision_extra_vars'] = helpers.formatExtraVars(initialValues['provision_extra_vars']);
                   initialValues['retirement_extra_vars'] = helpers.formatExtraVars(initialValues['retirement_extra_vars']);
                   initialValues.dialog_id = (catalogItem.config_info.provision.dialog_id? catalogItem.config_info.provision.dialog_id: '');
                   initialValues.remove_resources = (catalogItem.config_info.retirement.remove_resources ?
                     catalogItem.config_info.retirement.remove_resources : initialValues.remove_resources);
                   this.setState({initialValues,formValues:cloneDeep(initialValues), isLoading: false});
        });
      });
    } else {
      this.setState({isLoading: false});
    }
  }

  submitForm = (values) => {
    const {isNew} = this.state;
    const {catalogItemFormId} = this.props;
    const { name, description, display, long_description, service_template_catalog_id } = values;
    const provisionFields = {}, retirementFields = {};
    ANSIBLE_FIELDS.forEach((field) => {
      const isIdField = field.includes('_id');
      if (isIdField) { //blank ids passed to api cause failures
        ['provision', 'retirement'].forEach(prefix => {
          const value = values[`${prefix}_${field}`];
          if (value) {
            (prefix === 'provision' ? provisionFields[field] = value: retirementFields[field] = value);
          }
        });
      } else {
        provisionFields[field] = values[`provision_${field}`];
        retirementFields[field] = values[`retirement_${field}`];
      }
    });

    const provision = {
      dialog_id: values['dialog_id'],
      ...provisionFields,
      extra_vars: helpers.buildExtraVarsObj(provisionFields.extra_vars),
    };

    if (values.dialogOption === 'new') {
      provision.new_dialog_name = values.dialog_name;
      delete provision.dialog_id;
    }

    const retirement = {
      ...retirementFields,
      extra_vars: helpers.buildExtraVarsObj(retirementFields.extra_vars),
      remove_resources: values.remove_resources,
    };

    const catalogItem = {
      action: (isNew ? 'create': 'edit'),
      resource: {
        name,
        description,
        long_description,
        display,
        service_template_catalog_id,
        prov_type: 'generic_ansible_playbook',
        type: 'ServiceTemplateAnsiblePlaybook',
        config_info: {
            provision,
            retirement
        }
      }
    };
    helpers.submitCatalogForm(`/api/service_templates/${!isNew? catalogItemFormId:''}`, isNew, catalogItem, catalogItemFormId);
  }

  closeCopyProvisionDialog = () => {
    this.setState({showCopyProvisionDialog: false});
  }
  copyFormValues = (args, state, utils) => {
    ANSIBLE_FIELDS.forEach((field) => {
      utils.changeValue(state, `retirement_${field}`, () => state.formState.values[`provision_${field}`])
    });
    this.props.duplicateDropdowns(['playbooks', 'cloudCredentials']);
    this.closeCopyProvisionDialog();
  }
  handleCancel = () => {
    const message = (this.state.isNew ? __('Add of Catalog Item was cancelled by the user') :
      __('Edit of Catalog Item was cancelled by the user'));
    miqFlashLater({ message });
    window.location.href = '/catalog/explorer/';
  };
  handleResetClick = (reset) => {
    const {initialValues} = this.state;
    window.add_flash( __('All changes have been reset'),'warn');
    reset(initialValues);
    this.setState({extraVarsChanged: false,isLoading:true, formValues: cloneDeep(initialValues)}, this.reloadForm);
  }
  reloadForm=() =>{
    this.setState({isLoading: false});
  }

  render() {
    const { region, ansibleCatalog } = this.props;
    const { isLoading, isNew } = this.state;
    const dropdowns = ansibleCatalog.dropdowns || {};
    const formFields = helpers.getAnsibleCatalogItemFields(dropdowns);
    const formMutators = { ...arrayMutators, copyValues: this.copyFormValues };
    return (
      <div>
        <div id="flash_msg_div" />
        {(isLoading ? (<Spinner loading size="lg" />) :
          (<Form
            initialValues={this.state.formValues}
            onSubmit={this.submitForm}
            mutators={{
              ...formMutators
            }}
            render={({ invalid,
              values,
              submitting,
              pristine,
              dirty,
              handleSubmit,
              form: { change, reset, mutators: { push, copyValues } } }) => (
                <PfForm horizontal onSubmit={handleSubmit}>
                  <MessageDialog
                    onHide={this.closeCopyProvisionDialog}
                    show={this.state.showCopyProvisionDialog}
                    primaryAction={copyValues}
                    primaryActionButtonContent={__('Copy')}
                    secondaryAction={this.closeCopyProvisionDialog}
                    secondaryActionButtonContent={__('Cancel')}
                    title={__('Copy from Provisioning')}
                    icon={(<Icon type="pf" name="warning-triangle-o" />)}
                    primaryContent={helpers.provisionDialogMessage()}
                  />
                  {
                    formFields.map(fields => (helpers.renderFormField(fields, values)))
                  }
                  <TabContainer defaultActiveKey={1} id="ansibleCatalogForm">
                    <div>
                      <Nav bsClass={'nav nav-tabs nav-tabs-pf'}>
                        <NavItem eventKey={1}>{__('Provisioning')}</NavItem>
                        <NavItem eventKey={2}>{__('Retirement')}</NavItem>
                      </Nav>
                      <TabContent animation>
                        <TabPane eventKey={1} mountOnEnter={true} unmountOnExit={true}>
                          <AnsiblePlaybookFields
                            region={region}
                            prefix='provision'
                            addExtraVars={push}
                            initialValues={this.state.initialValues}
                            formValues={values}
                            changeField={change}
                          >
                            <DialogFields dropdownOptions={dropdowns.dialogs} />
                          </AnsiblePlaybookFields>
                        </TabPane>
                        {/* Retirement tab */}
                        <TabPane eventKey={2} mountOnEnter={true}>
                          <div>
                            <div className="col-xs-1" />
                            <div className="col-xs-11 provisioning-copy-button">
                              <Button
                                type="button"
                                bsStyle="link"
                                onClick={() => this.setState({ showCopyProvisionDialog: true })}>
                                <Icon type="fa" name="paste" />
                                &nbsp;
                          {__('Copy from Provisioning')}
                              </Button>
                            </div>
                          </div>
                          <AnsiblePlaybookFields
                            region={region}
                            prefix='retirement'
                            addExtraVars={push}
                            initialValues={this.state.initialValues}
                            formValues={values}
                            changeField={change}
                          >
                            <Field
                              name='remove_resources'
                              component={FinalFormSelect}
                              label={__('Remove Resources?')}
                              options={helpers.getResourceOptions(values)}
                              placeholder={DEFAULT_PLACEHOLDER}
                            />
                          </AnsiblePlaybookFields>
                        </TabPane>
                      </TabContent>
                    </div>
                  </TabContainer>
                  <FormButtons
                    newRecord={isNew}
                    saveable={(!invalid && !submitting && dirty) || this.state.extraVarsChanged}
                    saveClicked={handleSubmit}
                    addClicked={handleSubmit}
                    cancelClicked={this.handleCancel}
                    resetClicked={() => { this.handleResetClick(reset); }}
                    pristine={pristine}
                  />
                </PfForm>
              )}
          />
          )
        )}
      </div>
    );
  }
}

AnsibleCatalogItemForm.propTypes = CATALOG_ITEM_PROPS;
AnsibleCatalogItemForm.defaultProps = {
  catalogItemFormId: null
};
export default AnsibleCatalogItemForm;
