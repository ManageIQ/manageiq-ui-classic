import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
} from 'carbon-components-react';
import {
  Close16, Edit16, Minimize16, Maximize16,
} from '@carbon/icons-react';
import DynamicField from './dynamic-field';
import { SD_ACTIONS } from './helper';
import NotificationMessage from '../notification-message';

/** Component to render a section. */
const DynamicSection = ({ section, sectionAction }) => {
  const [sectionData, setSectionData] = useState({ maximize: true });

  const { sectionId, tabId, title } = section;

  const onSectionWindow = () => {
    setSectionData({
      ...sectionData,
      maximize: !sectionData.maximize,
    });
  };

  const onSectionAction = (type, event) => sectionAction({
    event, section, type,
  });

  const onFieldAction = ({ event, type, fieldPosition }) => sectionAction({
    event, section, type, fieldPosition,
  });

  const renderMinMaxButton = () => (
    <Button
      renderIcon={sectionData.maximize ? Minimize16 : Maximize16}
      kind="ghost"
      iconDescription={__('Edit')}
      onClick={() => onSectionWindow()}
      onKeyPress={() => onSectionWindow()}
      title={sectionData.maximize ? __('Minimize') : __('Maximize')}
    />
  );

  const renderEditButton = () => (
    <Button
      renderIcon={Edit16}
      kind="ghost"
      iconDescription={__('Edit')}
      onClick={(event) => onSectionAction(SD_ACTIONS.section.edit, event)}
      onKeyPress={(event) => onSectionAction(SD_ACTIONS.section.edit, event)}
      title={__('Edit section')}
    />
  );

  const renderRemoveButton = () => (
    <Button
      renderIcon={Close16}
      kind="ghost"
      iconDescription={__('Remove')}
      onClick={(event) => onSectionAction(SD_ACTIONS.section.delete, event)}
      onKeyPress={(event) => onSectionAction(SD_ACTIONS.section.delete, event)}
      title={__('Remove section')}
    />
  );

  const renderHelpText = () => (
    <NotificationMessage
      type="info"
      message={__('Drag items here to add to the dialog. At least one item is required before saving')}
    />
  );

  const renderSectionTitle = () => (
    <div className="dynamic-section-title-wrapper">
      <div className="dynamic-section-title">
        {title}
      </div>
      <div className="dynamic-section-actions">
        {renderMinMaxButton()}
        {renderEditButton()}
        {renderRemoveButton()}
      </div>
    </div>
  );

  const renderSectionContents = () => (
    <div className="dynamic-section-contents">
      {
        section.fields.map((field, fieldPosition) => (
          <div
            className="dynamic-form-field-wrapper"
            key={`field-${fieldPosition.toString()}`}
            draggable
            onDragEnter={(event) => onFieldAction({ event, fieldPosition, type: SD_ACTIONS.onDragEnterField })}
            onDragStart={(event) => onFieldAction({ event, fieldPosition, type: SD_ACTIONS.onDragStartField })}
          >
            <DynamicField
              key={fieldPosition.toString()}
              fieldData={{ field, fieldPosition, section }}
              onFieldAction={(newFieldData) => onFieldAction(newFieldData)}
            />
          </div>
        ))
      }
      {
        section.fields.length === 0 && renderHelpText()
      }
    </div>
  );

  return (
    <div
      className="dynamic-section"
      draggable
      onDragStart={(event) => onSectionAction(SD_ACTIONS.onDragStartSection, event)}
      onDragEnter={(event) => onSectionAction(SD_ACTIONS.onDragEnterSection, event)}
      onDrop={(event) => onSectionAction(SD_ACTIONS.onDrop, event)}
      onDragOver={(event) => onSectionAction(SD_ACTIONS.onDragOverListener, event)}
      tab={tabId}
      section={sectionId}
      id={`dynamic-tab-${tabId}-section-${sectionId.toString()}`}
      key={`dynamic-tab-${tabId}-section-${sectionId.toString()}`}
    >
      {renderSectionTitle()}
      {sectionData.maximize && renderSectionContents()}

    </div>
  );
};

DynamicSection.propTypes = {
  section: PropTypes.shape({
    tabId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    fields: PropTypes.arrayOf(PropTypes.any).isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  sectionAction: PropTypes.func.isRequired,
};

export default DynamicSection;
