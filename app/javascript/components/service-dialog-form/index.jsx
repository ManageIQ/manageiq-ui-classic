/* eslint-disable radix */
import React, { useState, useRef } from 'react';
import {
  Tabs, Tab, Button,
} from 'carbon-components-react';
import { AddAlt16 } from '@carbon/icons-react';
import {
  dynamicComponents, defaultTabContents, defaultSectionContents, createNewTab, dragItems,
} from './data';
import TabOptionsMenu from './tab-options-menu';
import DynamicComponentChooser from './dynamic-component-chooser';
import './style.scss';
import DynamicSection from './dynamic-section';
import {
  selectedTab, SD_ACTIONS, dropField, dropSection, dropComponent,
} from './helper';

const ServiceDialogForm = () => {
  let dragEnterItem = useRef(); /** Stores the information of component where the dragged item is being hovered before release. */
  let draggedItem = useRef(); /** Stores the information of component being dragged. */
  let hoverItem = useRef(); /** Stores the tab and section position during the drop event. */

  const [data, setData] = useState({
    list: dynamicComponents,
    formFields: [defaultTabContents(0), createNewTab()],
  });

  const onDragEnterSection = ({ section }) => {
    if (draggedItem.type === dragItems.SECTION) {
      dragEnterItem = { section };
    }
  };

  /** Function which gets executed when a dragged field item is on top of another field item. */
  const onDragEnterField = ({ section, fieldPosition }) => {
    if (draggedItem.type === dragItems.FIELD) {
      dragEnterItem = { section, fieldPosition };
    }
  };

  /** Function which gets executed once when a compnent dragging has started */
  const onDragStartComponent = (event, type) => {
    draggedItem = { componentId: parseInt(event.currentTarget.id), type };
  };

  const onDragStartSection = ({ section }) => {
    if (draggedItem && draggedItem.type === dragItems.FIELD) {
      return;
    }
    draggedItem = { sectionId: section.sectionId, type: dragItems.SECTION };
  };

  /** Function which gets executed once when a dragging has started */
  const onDragStartField = ({ fieldPosition, section: { sectionId } }) => {
    if (draggedItem && draggedItem.type === dragItems.SECTION) {
      return;
    }
    draggedItem = { fieldPosition, sectionId, type: dragItems.FIELD };
  };

  /** Function which gets executed on dropping an item */
  const onDrop = () => {
    if (draggedItem && hoverItem) {
      const tab = selectedTab([...data.formFields], hoverItem.tabPosition);
      const section = [...tab.sections].find((section) => section.sectionId === hoverItem.sectionPosition);
      switch (draggedItem.type) {
        case dragItems.COMPONENT:
          dropComponent(section, draggedItem);
          break;
        case dragItems.FIELD:
          dropField(section, draggedItem, dragEnterItem);
          break;
        case dragItems.SECTION:
          dropSection(tab, draggedItem, dragEnterItem);
          break;
        default:
          break;
      }
      setData({
        ...data,
        formFields: [...data.formFields],
      });
      hoverItem = undefined;
      draggedItem = undefined;
    }
  };

  /** Function which gets executed while the element is being dragged.
   * This function works like a listener */
  const onDragOverListener = ({ event }) => {
    event.preventDefault();
    const tabPosition = parseInt(event.currentTarget.getAttribute('tab'));
    const sectionPosition = parseInt(event.currentTarget.getAttribute('section'));
    hoverItem = { tabPosition, sectionPosition };
  };

  /** Function to add a tab as the second last item
   * Last item will always be 'Create new tab'.
   */
  const addTab = () => {
    data.formFields.splice(1, 0, defaultTabContents(data.formFields.length - 1));
    const newFormFields = data.formFields.sort((t1, t2) => t1.tabId - t2.tabId);
    setData({
      ...data,
      formFields: [...newFormFields],
    });
  };

  /** Function to add a section */
  const addSection = (tabPosition) => {
    const { sections } = selectedTab(data.formFields, tabPosition);
    sections.push(defaultSectionContents(tabPosition, sections.length));
    setData({
      ...data,
      formFields: [...data.formFields],
    });
  };

  /** Function to edit a section */
  const editSection = ({ tabId, sectionId }) => {
    const section = selectedTab(data.formFields, tabId).sections;
    console.log(section, sectionId);
  };

  /** Function to delete a section */
  const deleteSection = ({ tabId, sectionId }) => {
    const tab = selectedTab(data.formFields, tabId);
    tab.sections = tab.sections.filter((section) => section.sectionId !== sectionId);
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

  const editTab = () => console.log('edit tab');

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
        return editTab(tab);
      case SD_ACTIONS.tab.delete:
        return deleteTab(tab);
      default:
        return null;
    }
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
        return editSection(actionData);
      case SD_ACTIONS.section.delete:
        return deleteSection(actionData);
      case SD_ACTIONS.textAreaOnchange:
        return console.log('textAreaOnchange');
      case SD_ACTIONS.textInputOnchange:
        return console.log('textInputOnchange');
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
  const renderSections = ({ tabIb, sections }) => sections && sections.map((section, sectionPosition) => (
    <DynamicSection
      key={sectionPosition.toString()}
      section={section}
      sectionAction={(actionType, event) => onSectionAction(actionType, tabIb, section.sectionId, event)}
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
    <Tab key={`tab${tabPosition.toString()}`} label={tab.name} onClick={() => onTabSelect(tab.tabId)}>
      <section className="dynamic-sections-wrapper">
        {renderTabName(tab)}
        {renderSections(tab)}
        {renderAddSectionButton(tab.tabId)}
      </section>

    </Tab>
  ));

  /** Function to render the tab contents. */
  const renderTabContents = () => (
    <div className="dynamic-tabs-wrapper">
      <Tabs className="miq_custom_tabs" id="dynamic-tabs">
        {renderTabs()}
      </Tabs>
    </div>
  );
  return (
    <div className="drag-and-drop-wrapper">
      <DynamicComponentChooser
        list={data.list}
        onDragStartComponent={(event, type) => onDragStartComponent(event, type)}
      />
      {
        renderTabContents()
      }
    </div>
  );
};

export default ServiceDialogForm;
