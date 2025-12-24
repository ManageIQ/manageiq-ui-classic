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
  const nextSectionId = useRef(1); /** Counter for generating unique section IDs */
  const nextTabId = useRef(1); /** Counter for generating unique tab IDs */

  // Helper function to calculate the maximum section ID across all tabs
  const getMaxSectionId = (tabs) => tabs.reduce((max, tab) => {
    const tabMax = tab.sections ? Math.max(...tab.sections.map((s) => s.sectionId), 0) : 0;
    return Math.max(max, tabMax);
  }, 0);

  // Helper function to calculate the maximum tab ID
  const getMaxTabId = (tabs) => tabs.reduce((max, tab) => {
    if (tab.tabId !== 'new' && typeof tab.tabId === 'number') {
      return Math.max(max, tab.tabId);
    }
    return max;
  }, 0);

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
      // Fetch the complete dialog structure from the API
      API.get(`/api/service_dialogs/${dialogData.id}?expand=resources&attributes=content,dialog_tabs`)
        .then((response) => {
          if (response.content && response.content[0]) {
            const fullDialogData = response.content[0];

            // Extract dialog tabs from the API response
            const dialogTabs = fullDialogData.dialog_tabs || [];

            if (dialogTabs.length > 0) {
              const formattedTabs = dialogTabs.map((tab, index) => {
                const formattedTab = {
                  tabId: index,
                  name: tab.label,
                  sections: (tab.dialog_groups || []).map((group, groupIndex) => {
                    const fields = (group.dialog_fields || []).map(field => {
                      const componentId = getComponentIdFromType(field.type);

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

                return formattedTab;
              });

              // Add the "Create new tab" option
              formattedTabs.push(createNewTab());

              // Update nextSectionId to be higher than any existing sectionId
              nextSectionId.current = getMaxSectionId(formattedTabs) + 1;
              // Update nextTabId to be higher than any existing tabId
              nextTabId.current = getMaxTabId(formattedTabs) + 1;

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
        });
    } else if (dialogData && dialogData.dialog_tabs && dialogData.dialog_tabs.length > 0) {
      // If dialog_tabs is already available in the passed data, use it

      const formattedTabs = dialogData.dialog_tabs.map((tab, index) => ({
        tabId: index,
        name: tab.label,
        sections: (tab.dialog_groups || []).map((group, groupIndex) => ({
          tabId: index,
          sectionId: groupIndex,
          title: group.label,
          description: group.description || '',
          fields: (group.dialog_fields || []).map((field) => ({
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

      // Update nextSectionId to be higher than any existing sectionId
      nextSectionId.current = getMaxSectionId(formattedTabs) + 1;
      // Update nextTabId to be higher than any existing tabId
      nextTabId.current = getMaxTabId(formattedTabs) + 1;

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
    const newTabId = nextTabId.current;
    nextTabId.current += 1;
    data.formFields.splice(-1, 0, defaultTabContents(newTabId));
    setData({
      ...data,
      formFields: [...data.formFields],
    });
  };

  const getTab = (id) => data.formFields.find((t) => t.tabId === id);

  /** Function to add a section */
  const addSection = (tabPosition) => {
    const { sections } = selectedTab(data.formFields, tabPosition);
    const newSectionId = nextSectionId.current++;
    sections.push(defaultSectionContents(tabPosition, newSectionId));
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
      key={`tab${tab.tabId.toString()}`}
      draggable={tab.tabId !== 'new'}
      onDragStart={(event) => {
        if (tab.tabId !== 'new') {
          onSectionAction({ event, type: SD_ACTIONS.onDragStartTab, tab, tabPosition });
        }
      }}
      onDragEnter={(event) => {
        if (tab.tabId !== 'new' && draggedItem.current && draggedItem.current.type === dragItems.TAB) {
          event.preventDefault();
          onSectionAction({ event, type: SD_ACTIONS.onDragEnterTab, tab, tabPosition });
        }
      }}
      onDragOver={(event) => {
        if (tab.tabId !== 'new' && draggedItem.current && draggedItem.current.type === dragItems.TAB) {
          event.preventDefault();
        }
      }}
      onDrop={(event) => {
        if (tab.tabId !== 'new' && draggedItem.current && draggedItem.current.type === dragItems.TAB) {
          event.preventDefault();
          const formFields = [...data.formFields];
          dropTab(formFields, draggedItem.current, dragEnterItem.current);
          setData({
            ...data,
            formFields,
          });
          resetDragRefs();
        }
      }}
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

  // Helper function to navigate back to the explorer page
  const navigateToExplorer = () => {
    window.location.href = '/miq_ae_customization/explorer';
  };

  // Helper function to clean up field data for submission
  const cleanupField = (field) => {
    // Create a clean copy without React-specific or UI-specific properties
    const cleanField = { ...field };
    
    // Remove properties that shouldn't be sent to the backend
    delete cleanField.componentId;
    delete cleanField.fieldsToRefresh;
    delete cleanField.categories;
    delete cleanField.selectedCategory;
    delete cleanField.subCategories;
    
    return {
      name: cleanField.name || `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      description: cleanField.description || '',
      data_type: cleanField.dataType || 'string',
      notes: cleanField.notes || '',
      notes_display: cleanField.notesDisplay || '',
      display: cleanField.display || 'edit',
      display_method: cleanField.displayMethod || null,
      display_method_options: cleanField.displayMethodOptions || {},
      required: cleanField.required || false,
      required_method: cleanField.requiredMethod || null,
      required_method_options: cleanField.requiredMethodOptions || {},
      default_value: cleanField.value || '',
      values: cleanField.values || null,
      values_method: cleanField.valuesMethod || null,
      values_method_options: cleanField.valuesMethodOptions || {},
      options: {
        protected: cleanField.protected || false,
        show_past_days: cleanField.showPastDates || false,
        sort_by: cleanField.sortBy || 'description',
        sort_order: cleanField.sortOrder || 'ascending',
        force_multi_value: cleanField.multiselect || false
      },
      label: cleanField.label || 'Field Label',
      position: cleanField.position || 0,
      validator_type: cleanField.validatorType || '',
      validator_rule: cleanField.validatorRule || null,
      reconfigurable: cleanField.reconfigurable || false,
      dynamic: cleanField.dynamic || false,
      show_refresh_button: cleanField.showRefresh || false,
      load_values_on_init: cleanField.loadOnInit || false,
      read_only: cleanField.readOnly || false,
      auto_refresh: cleanField.autoRefresh || false,
      trigger_auto_refresh: cleanField.triggerAutoRefresh || false,
      visible: cleanField.visible !== undefined ? cleanField.visible : true,
      type: cleanField.type || 'DialogFieldTextBox'
    };
  };

  const formatDialogFields = (fields) =>
    fields.map((field, fieldIndex) => cleanupField({ ...field, position: fieldIndex }));

  const formatDialogGroups = (sections) =>
    sections.map((section, sectionIndex) => ({
      label: section.title,
      description: section.description || '',
      position: sectionIndex,
      dialog_fields: formatDialogFields(section.fields),
    }));

  const formatDialogTabs = (tabs) => {
    let position = 0;
    return tabs.reduce((acc, tab) => {
      if (tab.tabId !== 'new') {
        acc.push({
          label: tab.name,
          position,
          dialog_groups: formatDialogGroups(tab.sections),
        });
        position += 1;
      }
      return acc;
    }, []);
  };

  const prepareDialogFormData = () => ({
    label: data.label,
    description: data.description,
    dialog_tabs: formatDialogTabs(data.formFields),
  });

  const isEditMode = () =>
    dialogData && dialogData.id && dialogAction && dialogAction.action === 'edit';

  const updateDialog = (dialogFormData) =>
    API.post(`/api/service_dialogs/${dialogData.id}`, {
      action: 'edit',
      resource: dialogFormData,
    })
      .then(navigateToExplorer)
      .catch((error) => {
        console.error('Error updating dialog:', error);
      });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dialogFormData = prepareDialogFormData();

    if (isEditMode()) {
      updateDialog(dialogFormData);
    } else {
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
          <Button
            variant="contained"
            type="button"
            onClick={navigateToExplorer}
            kind="secondary"
          >
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
