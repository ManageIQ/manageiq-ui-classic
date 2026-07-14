import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Loading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TextInput,
  TextArea,
  Modal,
} from '@carbon/react';
import { AddAlt } from '@carbon/react/icons';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import DynamicComponentChooser from './dynamic-component-chooser';
import TabOptionsMenu from './tab-options-menu';
import EditTabModal from './edit-tab-modal';
import EditSectionModal from './edit-section-modal';
import {
  SD_ACTIONS,
  emptyDialog,
  defaultTab,
  defaultSection,
  deleteTab,
  deleteSection,
  dropTab,
  dropSection,
  dropComponent,
  buildDialogPayload,
  handlePropertiesEdit,
} from './helper';
import { defaultField } from './data';
import './style.scss';

// Lazy-load DynamicSection to avoid circular deps at build time
// (DynamicSection will be created in Sub-Task 3 — placeholder for now)
let DynamicSection;
try {
  DynamicSection = require('./dynamic-section').default;
} catch (_e) {
  DynamicSection = null;
}

// ── Section placeholder used until Sub-Task 3 DynamicSection is available ────
const SectionPlaceholder = ({ section, tabIndex, sectionIndex, onAction }) => (
  <div className="dynamic-section">
    <div className="dynamic-section__header">
      <span className="dynamic-section__title">{section.label}</span>
      <div className="dynamic-section__actions">
        <Button
          size="sm"
          kind="ghost"
          hasIconOnly
          renderIcon={AddAlt}
          iconDescription={__('Edit section')}
          onClick={() => onAction(SD_ACTIONS.section.edit, { tabIndex, sectionIndex })}
        />
        <Button
          size="sm"
          kind="ghost"
          hasIconOnly
          renderIcon={AddAlt}
          iconDescription={__('Delete section')}
          onClick={() => onAction(SD_ACTIONS.section.delete, { tabIndex, sectionIndex })}
        />
      </div>
    </div>
    <div
      className="dynamic-section__body"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const fieldType = e.dataTransfer.getData('text/plain');
        if (fieldType) onAction(SD_ACTIONS.field.add, { tabIndex, sectionIndex, fieldType });
      }}
    >
      {(!section.dialog_fields || section.dialog_fields.length === 0) && (
        <div className="dynamic-section__placeholder">
          {__('Drag fields here')}
        </div>
      )}
      {(section.dialog_fields || []).map((field, fieldIndex) => (
        <div key={field.name || fieldIndex} className="dynamic-field">
          <span>{field.label || field.name}</span>
        </div>
      ))}
    </div>
  </div>
);

SectionPlaceholder.propTypes = {
  section: PropTypes.shape({
    label: PropTypes.string,
    dialog_fields: PropTypes.array,
  }).isRequired,
  tabIndex: PropTypes.number.isRequired,
  sectionIndex: PropTypes.number.isRequired,
  onAction: PropTypes.func.isRequired,
};

// ── Main component ────────────────────────────────────────────────────────────
const ServiceDialogForm = ({ dialogData, dialogAction, emsWorkflowsEnabled }) => {
  const { id: dialogId, action } = dialogAction || {};

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(action !== 'new');
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isDraggingTab, setIsDraggingTab] = useState(false);
  const [dragTabIndex, setDragTabIndex] = useState(null);

  // Modal states
  const [tabModal, setTabModal] = useState({ open: false, tabIndex: null });
  const [sectionModal, setSectionModal] = useState({ open: false, tabIndex: null, sectionIndex: null });

  // ── Load dialog data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (action === 'new') {
      setData(emptyDialog());
      setIsLoading(false);
      return;
    }

    if (!dialogId) {
      setData(emptyDialog());
      setIsLoading(false);
      return;
    }

    API.get(`/api/service_dialogs/${dialogId}?expand=resources&attributes=content,dialog_tabs`)
      .then((response) => {
        const content = response.content && response.content[0] ? response.content[0] : response;
        const loaded = {
          id: response.id,
          label: action === 'copy' ? sprintf(__('Copy of %s'), response.label) : (response.label || ''),
          description: response.description || '',
          dialog_tabs: (content.dialog_tabs || []).map((tab, ti) => ({
            ...tab,
            position: ti,
            dialog_groups: (tab.dialog_groups || []).map((group, gi) => ({
              ...group,
              position: gi,
              dialog_fields: (group.dialog_fields || []).map((field, fi) => ({
                ...field,
                position: fi,
                _version: 1,
              })),
            })),
          })),
        };
        setData(loaded);
        setIsLoading(false);
      })
      .catch(() => {
        setData(emptyDialog());
        setIsLoading(false);
      });
  }, [dialogId, action]);

  // ── Action dispatcher ───────────────────────────────────────────────────────
  const handleAction = useCallback((actionType, payload) => {
    setData((prev) => {
      if (!prev) return prev;

      switch (actionType) {
        case SD_ACTIONS.tab.delete: {
          const newData = deleteTab(prev, payload.tabIndex);
          setSelectedTabIndex(Math.max(0, selectedTabIndex - (payload.tabIndex <= selectedTabIndex ? 1 : 0)));
          return newData;
        }
        case SD_ACTIONS.tab.add:
          return {
            ...prev,
            dialog_tabs: [
              ...(prev.dialog_tabs || []),
              defaultTab((prev.dialog_tabs || []).length),
            ],
          };
        case SD_ACTIONS.tab.edit: {
          const tabs = [...(prev.dialog_tabs || [])];
          tabs[payload.tabIndex] = { ...tabs[payload.tabIndex], ...payload.values };
          return { ...prev, dialog_tabs: tabs };
        }
        case SD_ACTIONS.tab.reorder:
          return dropTab(prev, payload.fromIndex, payload.toIndex);

        case SD_ACTIONS.section.add: {
          const tabs = [...(prev.dialog_tabs || [])];
          const tab = { ...tabs[payload.tabIndex] };
          const groups = [...(tab.dialog_groups || [])];
          groups.push(defaultSection(groups.length));
          tab.dialog_groups = groups;
          tabs[payload.tabIndex] = tab;
          return { ...prev, dialog_tabs: tabs };
        }
        case SD_ACTIONS.section.delete: {
          return deleteSection(prev, payload.tabIndex, payload.sectionIndex);
        }
        case SD_ACTIONS.section.edit: {
          const tabs = [...(prev.dialog_tabs || [])];
          const tab = { ...tabs[payload.tabIndex] };
          const groups = [...(tab.dialog_groups || [])];
          groups[payload.sectionIndex] = { ...groups[payload.sectionIndex], ...payload.values };
          tab.dialog_groups = groups;
          tabs[payload.tabIndex] = tab;
          return { ...prev, dialog_tabs: tabs };
        }
        case SD_ACTIONS.section.reorder:
          return dropSection(prev, payload.tabIndex, payload.fromIndex, payload.toIndex);

        case SD_ACTIONS.field.add:
          return dropComponent(prev, payload.tabIndex, payload.sectionIndex, payload.fieldType, defaultField);

        case SD_ACTIONS.field.delete: {
          const tabs = [...(prev.dialog_tabs || [])];
          const tab = { ...tabs[payload.tabIndex] };
          const groups = [...(tab.dialog_groups || [])];
          const group = { ...groups[payload.sectionIndex] };
          const fields = [...(group.dialog_fields || [])];
          fields.splice(payload.fieldIndex, 1);
          group.dialog_fields = fields.map((f, i) => ({ ...f, position: i }));
          groups[payload.sectionIndex] = group;
          tab.dialog_groups = groups;
          tabs[payload.tabIndex] = tab;
          return { ...prev, dialog_tabs: tabs };
        }
        case SD_ACTIONS.field.edit:
          return handlePropertiesEdit(prev, payload.fieldName, payload.values);

        default:
          return prev;
      }
    });
  }, [selectedTabIndex]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!data) return;
    miqSparkleOn();

    const isCopy = action === 'copy';
    const isEdit = action === 'edit' && !isCopy;
    const payloadAction = isEdit ? 'edit' : 'create';
    const payload = buildDialogPayload(data, isCopy ? 'copy' : payloadAction);

    const url = isEdit && dialogId
      ? `/api/service_dialogs/${dialogId}`
      : '/api/service_dialogs';

    API.post(url, payload)
      .then(() => {
        const msg = isEdit
          ? sprintf(__('Service Dialog "%s" was saved'), data.label)
          : sprintf(__('Service Dialog "%s" was added'), data.label);
        miqRedirectBack(msg, 'success', '/miq_ae_customization/explorer');
      })
      .catch(() => {
        miqSparkleOff();
      });
  };

  // ── Cancel ──────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    const msg = action === 'edit'
      ? sprintf(__('Edit of Service Dialog "%s" was cancelled by the user'), data ? data.label : '')
      : __('Creation of a new Service Dialog was cancelled by the user');
    miqRedirectBack(msg, 'warning', '/miq_ae_customization/explorer');
  };

  // ── Tab drag-and-drop ───────────────────────────────────────────────────────
  const handleTabDragStart = (e, tabIndex) => {
    if (document.querySelector('.cds--modal.is-visible')) {
      e.preventDefault();
      return;
    }
    setDragTabIndex(tabIndex);
    setIsDraggingTab(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTabDrop = (e, toIndex) => {
    e.preventDefault();
    if (dragTabIndex !== null && dragTabIndex !== toIndex) {
      handleAction(SD_ACTIONS.tab.reorder, { fromIndex: dragTabIndex, toIndex });
    }
    setDragTabIndex(null);
    setIsDraggingTab(false);
  };

  // ── Tab modal handlers ──────────────────────────────────────────────────────
  const openTabEditModal = (tabIndex) => {
    setTabModal({ open: true, tabIndex });
  };

  const closeTabModal = () => setTabModal({ open: false, tabIndex: null });

  const saveTab = (values) => {
    if (tabModal.tabIndex === null) {
      handleAction(SD_ACTIONS.tab.add);
    } else {
      handleAction(SD_ACTIONS.tab.edit, { tabIndex: tabModal.tabIndex, values });
    }
    closeTabModal();
  };

  // ── Section modal handlers ──────────────────────────────────────────────────
  const openSectionEditModal = (tabIndex, sectionIndex) => {
    setSectionModal({ open: true, tabIndex, sectionIndex });
  };

  const closeSectionModal = () => setSectionModal({ open: false, tabIndex: null, sectionIndex: null });

  const saveSection = (values) => {
    if (sectionModal.sectionIndex === null) {
      handleAction(SD_ACTIONS.section.add, { tabIndex: sectionModal.tabIndex });
    } else {
      handleAction(SD_ACTIONS.section.edit, {
        tabIndex: sectionModal.tabIndex,
        sectionIndex: sectionModal.sectionIndex,
        values,
      });
    }
    closeSectionModal();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="service-dialog-form__loading">
        <Loading withOverlay={false} small />
      </div>
    );
  }

  const tabs = (data && data.dialog_tabs) || [];
  const SectionComp = DynamicSection || SectionPlaceholder;

  const selectedTab = tabs[selectedTabIndex] || tabs[0];
  const currentTabIndex = Math.min(selectedTabIndex, Math.max(0, tabs.length - 1));

  return (
    <div className="service-dialog-form">
      {/* ── Header: label + description ── */}
      <div className="service-dialog-form__header">
        <div className="service-dialog-form__header-fields">
          <TextInput
            id="dialog-label"
            labelText={__('Label')}
            value={(data && data.label) || ''}
            onChange={(e) => setData((prev) => ({ ...prev, label: e.target.value }))}
          />
          <TextArea
            id="dialog-description"
            labelText={__('Description')}
            value={(data && data.description) || ''}
            rows={2}
            onChange={(e) => setData((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </div>

      {/* ── Body: palette + canvas ── */}
      <div className="service-dialog-form__body">
        {/* Palette */}
        <div className="service-dialog-form__palette">
          <DynamicComponentChooser />
        </div>

        {/* Canvas: tabs */}
        <div className="service-dialog-form__canvas">
          <Tabs
            selectedIndex={currentTabIndex}
            onChange={({ selectedIndex }) => setSelectedTabIndex(selectedIndex)}
            className="service-dialog-form__tabs"
          >
            <TabList aria-label={__('Dialog tabs')} scrollIntoView={false}>
              {tabs.map((tab, ti) => (
                <Tab
                  key={tab.id || tab.label || ti}
                  draggable
                  onDragStart={(e) => handleTabDragStart(e, ti)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleTabDrop(e, ti)}
                >
                  <span className="service-dialog-form__tab-label">
                    {tab.label}
                    {/* TabOptionsMenu is placed here — as a span child of the tab button label,
                        not as renderIcon. The OverflowMenu button is a descendant of the Tab
                        button, which causes a console warning but is unavoidable with Carbon v11
                        Tabs API when needing per-tab options. */}
                    <TabOptionsMenu
                      onEdit={() => openTabEditModal(ti)}
                      onDelete={() => handleAction(SD_ACTIONS.tab.delete, { tabIndex: ti })}
                    />
                  </span>
                </Tab>
              ))}
              {/* Add tab button */}
              <Button
                size="sm"
                kind="ghost"
                hasIconOnly
                renderIcon={AddAlt}
                iconDescription={__('Add tab')}
                className="service-dialog-form__add-tab-btn"
                onClick={() => openTabEditModal(null)}
              />
            </TabList>

            <TabPanels>
              {tabs.map((tab, ti) => (
                <TabPanel key={tab.id || tab.label || ti}>
                  {(tab.dialog_groups || []).map((section, si) => (
                    <SectionComp
                      key={section.id || section.label || si}
                      section={section}
                      tabIndex={ti}
                      sectionIndex={si}
                      onAction={handleAction}
                      emsWorkflowsEnabled={emsWorkflowsEnabled}
                    />
                  ))}
                  <Button
                    size="sm"
                    kind="tertiary"
                    renderIcon={AddAlt}
                    onClick={() => openSectionEditModal(ti, null)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    {__('Add Section')}
                  </Button>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </div>
      </div>

      {/* ── Footer: save + cancel ── */}
      <div className="service-dialog-form__footer">
        <Button kind="primary" onClick={handleSubmit}>
          {action === 'edit' ? __('Save') : __('Add')}
        </Button>
        <Button kind="secondary" onClick={handleCancel}>
          {__('Cancel')}
        </Button>
      </div>

      {/* ── Tab edit modal ── */}
      <EditTabModal
        isOpen={tabModal.open}
        tab={tabModal.tabIndex !== null ? tabs[tabModal.tabIndex] : undefined}
        onSave={saveTab}
        onClose={closeTabModal}
      />

      {/* ── Section edit modal ── */}
      <EditSectionModal
        isOpen={sectionModal.open}
        section={
          sectionModal.tabIndex !== null && sectionModal.sectionIndex !== null
            ? (tabs[sectionModal.tabIndex] || {}).dialog_groups?.[sectionModal.sectionIndex]
            : undefined
        }
        onSave={saveSection}
        onClose={closeSectionModal}
      />
    </div>
  );
};

ServiceDialogForm.propTypes = {
  dialogData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    label: PropTypes.string,
    description: PropTypes.string,
  }),
  dialogAction: PropTypes.shape({
    id: PropTypes.string,
    action: PropTypes.oneOf(['new', 'edit', 'copy']),
  }).isRequired,
  emsWorkflowsEnabled: PropTypes.bool,
};

ServiceDialogForm.defaultProps = {
  dialogData: undefined,
  emsWorkflowsEnabled: false,
};

export default ServiceDialogForm;
