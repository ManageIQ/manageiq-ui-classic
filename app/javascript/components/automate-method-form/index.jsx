import React, { useState, useEffect } from 'react';
import { Dropdown, Loading } from 'carbon-components-react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { createSchema } from './schema';
import { handleInputParameterUpdate } from './automate-method-input-parameter/helper';
import componentMapper from '../../forms/mappers/componentMapper';
import AutomateMethodInputParameter from './automate-method-input-parameter';
import AutomateMethodCodeMirror from './automate-method-code-mirror';
import AutomateMethodInputParameterForm from './automate-method-input-parameter/automate-method-input-parameter-form';
import AutomateMethodContext from './automate-method-context';
import { http } from '../../http_api';
import './style.scss';

const AutomateMethodForm = ({ availableLocations, levels }) => {
  const mapper = {
    ...componentMapper,
    'automate-method-code-mirror': AutomateMethodCodeMirror,
    'automate-method-input-parameter': AutomateMethodInputParameter,
  };

  const [formData, setFormData] = useState({
    loading: false,
    apiResponse: undefined,
    selectedType: undefined,
    manager_id: undefined,
    workflowTemplates: undefined,
    levels,
    codeEditor: undefined,
    inputParameter: {
      modal: false,
      selectedId: undefined,
      items: [],
    },
  });

  /** Fetching data based on selected type */
  useEffect(() => {
    if (formData.selectedType && formData.selectedType.id) {
      http.get(`/miq_ae_class/method_form_fields/new?location=${formData.selectedType.id}`).then((apiResponse) => {
        setFormData({
          ...formData,
          loading: false,
          apiResponse,
        });
      });
    }
  }, [formData.selectedType]);

  /** Fetching templates based on manager_id */
  useEffect(() => {
    if (formData.manager_id) {
      const collectionClass = 'collection_class=ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationScript';
      const filter = `filter[]=manager_id=${formData.manager_id}`;
      const sort = `sort_by=name&sort_order=asc`;
      const url = `/api/configuration_scripts?expand=resources&${collectionClass}&${filter}&${sort}`;
      API.get(url).then((response) => {
        miqSparkleOn();
        setFormData({
          ...formData,
          workflowTemplates: response,
        });
        miqSparkleOff();
      });
    } else {
      setFormData({
        ...formData,
        workflowTemplates: undefined,
      });
    }
  }, [formData.manager_id]);

  /** Function to update input parameters */
  const updateInputParameter = (actionType, data) => {
    setFormData({
      ...formData,
      inputParameter: handleInputParameterUpdate(actionType, data, formData),
    });
  };

  /** Function to render code editor */
  const updateCodeEditor = (data) => {
    setFormData({
      ...formData,
      codeEditor: data,
    });
  };

  const onSubmit = (values) => {
    let extraVars;
    if (formData.inputParameter.items) {
      extraVars = formData.inputParameter.items.map((item) => Object.values(item));
    }
    console.log({ ...values, extra_vars: extraVars });
  };

  /** Function to render automate types dropdown */
  const renderAutomateTypes = () => (
    <div className="mainClass">
      <h3>{__('Main Info')}</h3>
      <Dropdown
        id="choose"
        label="Choose"
        items={availableLocations.map((item) => ({ id: item[1], label: item[0] }))}
        itemToString={(item) => (item ? item.label : '')}
        onChange={({ selectedItem }) => setFormData({
          ...formData,
          loading: true,
          selectedType: selectedItem,
        })}
        titleText={formData.selectedType ? formData.selectedType.label : ''}
      />
    </div>
  );

  /** Function to render input parameter modal */
  const renderInputParameterModal = ({ inputParameter }) => (
    <AutomateMethodInputParameterForm
      recordId={formData.inputParameter.selectedId}
      modalStatus={inputParameter.modal}
    />
  );

  const renderLoader = () => (
    <div className="loadingSpinner">
      <Loading active small withOverlay={false} className="loading" />
    </div>
  );

  const renderFormContents = () => (
    <>
      {
        formData.selectedType && (
          <AutomateMethodContext.Provider value={{ formData, updateInputParameter, updateCodeEditor }}>
            <MiqFormRenderer
              initialValues={formData}
              schema={createSchema(formData, setFormData)}
              componentMapper={mapper}
              onSubmit={onSubmit}
            />
            {
              formData.inputParameter.modal && renderInputParameterModal(formData)
            }
          </AutomateMethodContext.Provider>
        )
      }
    </>
  );

  return (
    <div className="automate-method-form">
      {
        renderAutomateTypes()
      }
      {
        formData.loading
          ? renderLoader()
          : renderFormContents()
      }
    </div>
  );
};

export default AutomateMethodForm;

AutomateMethodForm.propTypes = {
  availableLocations: PropTypes.arrayOf(PropTypes.any).isRequired,
  levels: PropTypes.shape({}).isRequired,
};
