/* eslint-disable radix */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Tabs, Tab, Button, TextInput, TextArea,
} from 'carbon-components-react';
import { AddAlt16 } from '@carbon/icons-react';
import {
  dynamicComponents, defaultTabContents, defaultSectionContents, createNewTab, dragItems, saveServiceDialog
} from './data';
import TabOptionsMenu from './tab-options-menu';
import DynamicComponentChooser from './dynamic-component-chooser';
import './style.scss';
import DynamicSection from './dynamic-section';
import {
  selectedTab, SD_ACTIONS, dropField, dropSection, dropTab, dropComponent,
} from './helper';
import EditTabModal from './edit-tab-modal';
import EditSectionModal from './edit-section-modal';

// Helper function to determine componentId from field type
const getComponentIdFromType = (type) => {
  switch (type) {
    case 'DialogFieldTextBox':
      return 1;
    case 'DialogFieldTextAreaBox':
      return 2;
    case 'DialogFieldCheckBox':
      return 3;
    case 'DialogFieldDropDownList':
      return 4;
    case 'DialogFieldRadioButton':
      return 5;
    case 'DialogFieldDateControl':
      return 6;
    case 'DialogFieldDateTimeControl':
      return 7;
    case 'DialogFieldTagControl':
      return 8;
    default:
      return 1; // Default to text box
  }
};


const ServiceDialogForm = ({ dialogData, dialogAction }) => {
  const dragEnterItem = useRef(null); /** Stores the information of component where the dragged item is being hovered before release. */
  const draggedItem = useRef(null); /** Stores the information of component being dragged. */
  const hoverItem = useRef(null); /** Stores the tab and section position during the drop event. */

  // State to store the dialog data
  const [data, setData] = useState({
    list: dynamicComponents,
    formFields: [defaultTabContents(0), createNewTab()],
    label: dialogData ? dialogData.label || '' : '',
    description: dialogData ? dialogData.description || '' : '',
  });

  // Effect to fetch dialog data when editing
  useEffect(() => {
    // If we're editing an existing dialog, fetch its complete structure
    if (dialogData && dialogData.id && dialogAction && dialogAction.action === 'edit') {
      console.log('Fetching complete dialog structure for editing...');
      
      // Fetch the complete dialog structure from the API
      API.get(`/api/service_dialogs/${dialogData.id}?expand=resources&attributes=content,dialog_tabs`)
        .then((response) => {
          console.log('API response:', response);

          if (response.content && response.content[0]) {
            const fullDialogData = response.content[0];
            console.log('Full dialog data:', fullDialogData);

            // Extract dialog tabs from the API response
            const dialogTabs = fullDialogData.dialog_tabs || [];
            console.log('Dialog tabs from API:', dialogTabs);

            if (dialogTabs.length > 0) {
              const formattedTabs = dialogTabs.map((tab, index) => {
                console.log(`Processing tab ${index}:`, tab);

                const formattedTab = {
                  tabId: index,
                  name: tab.label,
                  sections: (tab.dialog_groups || []).map((group, groupIndex) => {
                    console.log(`Processing group ${groupIndex} in tab ${index}:`, group);

                    const fields = (group.dialog_fields || []).map(field => {
                      console.log(`Processing field in group ${groupIndex}:`, field);
                      console.log(`Field default_value:`, field.default_value);
                      console.log(`Field value:`, field.value);
                      console.log(`Field values:`, field.values);
                      console.log(`Field options:`, field.options);

                      const componentId = getComponentIdFromType(field.type);
                      console.log(`Mapped field type ${field.type} to componentId ${componentId}`);
                      
                      return {
                        // Ensure each field has componentId based on its type
                        componentId,
                        ...field,
                        // Make sure field has all required properties
                        name: field.name || `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                        label: field.label || 'Field',
                        position: field.position || 0,
                        visible: field.visible !== undefined ? field.visible : true,
                        required: field.required || false,
                        readOnly: field.read_only || false
                      };
                    });
                    
                    console.log(`Processed fields for group ${groupIndex}:`, fields);
                    
                    return {
                      tabId: index,
                      sectionId: groupIndex,
                      title: group.label,
                      description: group.description || '',
                      fields,
                      order: group.position || 0,
                    };
                  }),
                };
                
                console.log(`Formatted tab ${index}:`, formattedTab);
                return formattedTab;
              });
              
              // Add the "Create new tab" option
              formattedTabs.push(createNewTab());
              
              // Update the state with the fetched data
              setData({
                list: dynamicComponents,
                formFields: formattedTabs,
                label: dialogData.label || '',
                description: dialogData.description || '',
              });
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching dialog data:', error);
        });
    } else if (dialogData && dialogData.dialog_tabs && dialogData.dialog_tabs.length > 0) {
      // If dialog_tabs is already available in the passed data, use it
      console.log('Using dialog tabs from props:', dialogData.dialog_tabs);
      
      const formattedTabs = dialogData.dialog_tabs.map((tab, index) => ({
        tabId: index,
        name: tab.label,
        sections: (tab.dialog_groups || []).map((group, groupIndex) => ({
          tabId: index,
          sectionId: groupIndex,
          title: group.label,
          description: group.description || '',
          fields: (group.dialog_fields || []).map(field => ({
            componentId: getComponentIdFromType(field.type),
            ...field,
            name: field.name || `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            label: field.label || 'Field',
            position: field.position || 0,
            visible: field.visible !== undefined ? field.visible : true,
            required: field.required || false,
            readOnly: field.read_only || false
          })),
          order: group.position || 0,
        })),
      }));
      
      // Add the "Create new tab" option
      formattedTabs.push(createNewTab());
      
      setData({
        list: dynamicComponents,
        formFields: formattedTabs,
        label: dialogData.label || '',
        description: dialogData.description || '',
      });
    }
  }, [dialogData, dialogAction]);

  const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);

  const evaluateSubmitButton = () => {
    // checks if any of the sections in any tabs has fields added
    const hasFields = data.formFields.some((tab) =>
      tab.sections.some((section) => section.fields.length > 0));

    // checks if dialog label is present
    const hasDialogLabel = (Object.prototype.hasOwnProperty.call(data, 'label') && data.label.trim() !== '');

    setIsSubmitButtonEnabled(hasDialogLabel && hasFields);
  };

  useEffect(() => {
    evaluateSubmitButton();
  }, [data]);

  const onTabAction = (type, event) => tabAction({
    event, type,
  });

  const onDragEnterSection = ({ section }) => {
    if (draggedItem.current.type === dragItems.SECTION) {
      dragEnterItem.current = { section };
    }
  };

  /** Function which gets executed when a dragged field item is on top of another field item. */
  const onDragEnterField = ({ section, fieldPosition }) => {
    if (draggedItem.current.type === dragItems.FIELD) {
      dragEnterItem.current = { section, fieldPosition };
    }
  };

  /** Function which gets executed when a component dragging has started */
  const onDragStartComponent = (event, type) => {
    draggedItem.current = { componentId: parseInt(event.currentTarget.id), type };
  };

  /** Function which gets executed when a section dragging has started */
  const onDragStartSection = ({ section }) => {
    if (draggedItem.current && draggedItem.current.type && draggedItem.current.type !== dragItems.SECTION) {
      return;
    }
    draggedItem.current = { sectionId: section.sectionId, type: dragItems.SECTION };
  };

  /** Function which gets executed when a tab dragging has started */
  const onDragStartTab = ({ tab }) => {
    if (draggedItem.current && draggedItem.current.type && draggedItem.current.type !== dragItems.TAB) {
      return;
    }
    draggedItem.current = { tabId: tab.tabId, type: dragItems.TAB };
  };

  const onDragEnterTab = ({ tab }) => {
    if (draggedItem.current && draggedItem.current.type === dragItems.TAB) {
      dragEnterItem.current = { tab };
    }
  };

  /** Function which gets executed when a field dragging has started */
  const onDragStartField = ({ fieldPosition, section: { sectionId } }) => {
    if (draggedItem.current && draggedItem.current.type && draggedItem.current.type !== dragItems.FIELD) {
      return;
    }
    draggedItem.current = { fieldPosition, sectionId, type: dragItems.FIELD };
  };

  const resetDragRefs = () => {
    dragEnterItem.current = null;
    draggedItem.current = null;
    hoverItem.current = null;
  };

  /** Function which gets executed on dropping an item */
  const onDrop = () => {
    if (draggedItem.current && hoverItem.current) {
      const formFields = [...data.formFields];
      const tab = selectedTab(formFields, hoverItem.current.tabPosition);
      const section = [...tab.sections].find((section) => section.sectionId === hoverItem.current.sectionPosition);
      switch (draggedItem.current.type) {
        case dragItems.COMPONENT:
          dropComponent(section, draggedItem.current);
          break;
        case dragItems.FIELD:
          dropField(section, draggedItem.current, dragEnterItem.current);
          break;
        case dragItems.SECTION:
          dropSection(tab, draggedItem.current, dragEnterItem.current);
          break;
        case dragItems.TAB:
          dropTab(formFields, draggedItem.current, dragEnterItem.current);
          break;
        default:
          break;
      }
      setData({
        ...data,
        formFields,
      });

      resetDragRefs();
    }
  };

  /** Function which gets executed while the element is being dragged.
   * This function works like a listener */
  const onDragOverListener = ({ event }) => {
    event.preventDefault();
    const tabPosition = parseInt(event.currentTarget.getAttribute('tab'));
    const sectionPosition = parseInt(event.currentTarget.getAttribute('section'));
    hoverItem.current = { tabPosition, sectionPosition };
  };

  /** Function to add a tab as the second last item
   * Last item will always be 'Create new tab'.
   */
  const addTab = () => {
    data.formFields.splice(-1, 0, defaultTabContents(data.formFields.length - 1));
    const newFormFields = data.formFields.sort((t1, t2) => t1.tabId - t2.tabId);
    setData({
      ...data,
      formFields: [...newFormFields],
    });
  };

  const getTab = (id) => data.formFields.find((t) => t.tabId === id);

  /** Function to add a section */
  const addSection = (tabPosition) => {
    const { sections } = selectedTab(data.formFields, tabPosition);
    sections.push(defaultSectionContents(tabPosition, sections.length));
    setData({
      ...data,
      formFields: [...data.formFields],
    });
  };

  /** Function to delete a section */
  const deleteSection = ({ section: { tabId, sectionId } }) => {
    const tab = selectedTab(data.formFields, tabId);
    tab.sections = tab.sections.filter((section) => section.sectionId !== sectionId);
    setData({
      ...data,
      formFields: [...data.formFields],
    });
  };

  /** Function to delete a field */
  const deleteField = ({ section, fieldPosition }) => {
    const otherFields = section.fields.filter((_field, index) => index !== fieldPosition);
    section.fields = otherFields;
    setData({
      ...data,
      formFields: [...data.formFields],
    });
  };

  /** Function to handle the tab click event. */
  const onTabSelect = (tabId) => {
    if (tabId === 'new') {
      addTab();
    }
  };

  const [showTabEditModal, setTabEditModal] = useState(false);
  const [selTab, setSelTab] = useState(null);

  const [showSectionEditModal, setSectionEditModal] = useState(false);
  const [selSection, setSelSection] = useState(null);

  
  const onModalHide = () => setTabEditModal(false);
  const onModalShow = () => {
    setTabEditModal(true);
  };

  /** Function to delete a tab */
  const deleteTab = (tab) => {
    setData({
      ...data,
      formFields: [...data.formFields].filter((item) => item.tabId !== tab.tabId),
    });
  };

  /** Function to handle the tab Actions from menu. */
  const tabAction = (actionType, tab) => {
    switch (actionType) {
      case SD_ACTIONS.tab.edit:
        setSelTab(tab);
        setTabEditModal(true);
        break;
      case SD_ACTIONS.tab.delete:
        return deleteTab(tab);
      default:
        return null;
    }
  };

  /** Function to handle text area field update */
  const handlePropertiesEdit = ({ section, fieldPosition, inputProps }) => {
    const { tabId, sectionId } = section;

    const fieldVal = data.formFields[tabId].sections[sectionId].fields[fieldPosition];
    const newFieldVal = { ...fieldVal, ...inputProps };

    data.formFields[tabId].sections[sectionId].fields[fieldPosition] = newFieldVal;
    setData({
      ...data,
    });
  };

  /** Function to handle the call back actions from section. */
  /** TODO: Change this to Redux */
  // TODO: fieldPosition will only appeare for field drag and drop. Needs to change the logic.
  const onSectionAction = (actionData) => {
    switch (actionData.type) {
      case SD_ACTIONS.onDrop:
        return onDrop();
      case SD_ACTIONS.onDragOverListener:
        return onDragOverListener(actionData);
      case SD_ACTIONS.onDragEnterSection:
        return onDragEnterSection(actionData);
      case SD_ACTIONS.onDragEnterField:
        return onDragEnterField(actionData);
      case SD_ACTIONS.onDragStartField:
        return onDragStartField(actionData);
      case SD_ACTIONS.onDragStartSection:
        return onDragStartSection(actionData);
      case SD_ACTIONS.section.edit:
        setSelSection(actionData.section);
        setSectionEditModal(true);
        break;
      case SD_ACTIONS.section.delete:
        return deleteSection(actionData);
      case SD_ACTIONS.field.delete:
        return deleteField(actionData);
      case SD_ACTIONS.field.edit:
        return handlePropertiesEdit(actionData);
      case SD_ACTIONS.onDragEnterTab:
        return onDragEnterTab(actionData);
      case SD_ACTIONS.onDragStartTab:
        return onDragStartTab(actionData);
      default:
        return undefined;
    }
  };

  /* *****************************************
   * Render function begins from here
   * ***************************************** */

  /** Function to render the Tab's name. */
  const renderTabName = (tab) => (
    <div className="dynamic-tab-name">
      <TabOptionsMenu
        tabId={tab.tabId}
        onTabAction={(actionType) => tabAction(actionType, tab)}
      />
      <h2>{tab.name}</h2>
    </div>
  );

  /** Function to render the sections under a tab. */
  const renderSections = ({ tabId, sections }) => sections && sections.map((section, sectionPosition) => (
    <DynamicSection
      key={sectionPosition.toString()}
      section={section}
      // event, section, type, fieldPosition, inputProps,
      sectionAction={(type, event, inputProps) => onSectionAction(type, tabId, section.sectionId, event, inputProps)}
    />
  ));

  /** Function to render the add section button */
  const renderAddSectionButton = (tabPosition) => (
    <div className="add-section-button-wrapper">
      <Button
        renderIcon={AddAlt16}
        kind="primary"
        iconDescription={__('Add Section')}
        className="add-section-button"
        onClick={() => addSection(tabPosition)}
        onKeyPress={() => addSection(tabPosition)}
        title={__('Click to add a new section')}
      >
        {__(`Add Section`)}
      </Button>
    </div>
  );

  /** Function to render the tabs from the tabLabels props */
  const renderTabs = () => data.formFields.map((tab, tabPosition) => (
    <Tab
      key={`tab${tabPosition.toString()}`}
      draggable
      onDragStart={(event) => onSectionAction({ event, type: SD_ACTIONS.onDragStartTab, tab, tabPosition })}
      // onDragEnter={(event) => onSectionAction({ event, type: SD_ACTIONS.onDragEnterTab, tab, tabPosition })}
      label={tab.name}
      onClick={() => onTabSelect(tab.tabId)}
    >
      {tab.tabId !== 'new'
      && (
        <section className="dynamic-sections-wrapper">
          {renderTabName(tab)}
          {renderSections(tab)}
          {renderAddSectionButton(tab.tabId)}
        </section>
      )}
    </Tab>
  ));

  /** Function to render the tab contents. */
  const renderTabContents = () => (
    <div
      className="dynamic-tabs-wrapper"
    >
      <Tabs className="miq_custom_tabs" id="dynamic-tabs">
        {renderTabs()}
      </Tabs>
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If dialogAction contains an id and action is 'edit', we're updating an existing dialog
    if (dialogAction && dialogAction.id && dialogAction.action === 'edit') {
      // Update existing dialog
      API.put(`/api/service_dialogs/${dialogAction.id}`, {
        action: 'edit',
        resource: {
          label: data.label,
          description: data.description,
          dialog_tabs: data.formFields
            .filter(tab => tab.tabId !== 'new') // Filter out the "Create new tab" option
            .map((tab, index) => ({
              label: tab.name,
              position: index,
              dialog_groups: tab.sections.map((section, sectionIndex) => ({
                label: section.title,
                description: section.description || '',
                position: sectionIndex,
                dialog_fields: section.fields.map((field, fieldIndex) => {
                  // Make sure we have all required properties for each field
                  const fieldData = {
                    ...field,
                    position: fieldIndex,
                    name: field.name || `field_${Date.now()}_${fieldIndex}`,
                    label: field.label || 'Field Label',
                    type: field.type || 'DialogFieldTextBox',
                    data_type: field.dataType || 'string'
                  };
                  
                  return fieldData;
                })
              }))
            }))
        }
      }).then(() => {
        window.location.href = '/miq_ae_customization/explorer';
      }).catch(error => {
        console.error('Error updating dialog:', error);
      });
    } else {
      // Create new dialog
      saveServiceDialog(data);
    }
  };

  const updateTabInfo = (data, tabId) => {
    setData((prevData) => {
      const updatedFormFields = prevData.formFields.map((tab) => {
        if (tab.tabId === tabId) {
          return { ...tab, name: data.tab_name };
        }
        return tab;
      });

      return {
        ...prevData,
        formFields: updatedFormFields,
      };
    });
  };

  const updateSectionInfo = (data) => {
    setData((prevData) => {
      const updatedFormFields = prevData.formFields.map((tab) => {
        if (tab.tabId !== selSection.tabId) return tab;

        const updatedSections = tab.sections.map((sec) => {
          if (sec.sectionId !== selSection.sectionId) return sec;
          return {
            ...sec,
            title: data.section_name,
            description: data.section_description,
          };
        });
        return {
          ...tab,
          sections: updatedSections,
        };
      });
      return {
        ...prevData,
        formFields: updatedFormFields,
      };
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="service-dialog-main-wrapper">
        <h2>{__('General')}</h2>
        <div className="service-dialog-info">
          <TextInput
            id="dialogName"
            className="dialog-name"
            labelText={__('Dialog\'s name')}
            value={data.label}
            title={__('Search by Name within results')}
            onChange={(event) => setData({
              ...data,
              label: event.target.value,
            })}
          />
          <TextArea
            id="dialogDescription"
            className="dialog-description"
            labelText={__('Dialog\'s description')}
            value={data.description}
            onChange={(event) => setData({
              ...data,
              description: event.target.value,
            })}
          />
        </div>
        {/* Component chooser and Drag and Drop section */}
        <div className="drag-and-drop-wrapper">
          <DynamicComponentChooser
            list={data.list}
            onDragStartComponent={(event, type) => onDragStartComponent(event, type)}
          />
          {
            renderTabContents()
          }
        </div>
        {/* Form submit/cancel buttons */}
        <div className="custom-button-wrapper">
          <Button
            disabled={!isSubmitButtonEnabled}
            kind="primary"
            className="btnRight"
            type="submit"
            variant="contained"
          >
            { __('Submit')}
          </Button>
          <Button variant="contained" type="button" onClick={() => console.log('this is on cancel')} kind="secondary">
            { __('Cancel')}
          </Button>
        </div>
        {showTabEditModal && selTab && (
          <EditTabModal
            tabInfo={{ name: selTab.name, description: selTab.description }}
            usedTabNames={data.formFields.map((t) => t.name)}
            showModal={showTabEditModal}
            onSave={(e, editedValues) => {
              updateTabInfo(editedValues, selTab.tabId);
              setTabEditModal(false);
              setSelTab(null);
            }}
            onModalHide={() => {
              setTabEditModal(false);
              setSelTab(null);
            }}
          />
        )}
        {showSectionEditModal && selSection && (
          <EditSectionModal
            sectionInfo={{ name: selSection.title, description: selSection.description }}
            usedSectionNames={getTab(selSection.tabId).sections.map((sec) => sec.title) || []}
            showModal={showSectionEditModal}
            onSave={(e, editedValues) => {
              updateSectionInfo(editedValues, selSection.sectionId);
              setSectionEditModal(false);
              setSelSection(null);
            }}
            onModalHide={() => {
              setSectionEditModal(false);
              setSelSection(null);
            }}
          />
        )}

      </div>
    </form>
  );
};

export default ServiceDialogForm;
