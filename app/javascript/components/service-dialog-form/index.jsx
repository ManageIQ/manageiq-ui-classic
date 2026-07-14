import { useState, useEffect, useCallback, useRef } from 'react';
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
import DynamicSection from './dynamic-section';
import TabOptionsMenu from './tab-options-menu';
import EditTabModal from './edit-tab-modal';
import EditSectionModal from './edit-section-modal';
import useDraftRecovery from './use-draft-recovery';
import {
  SD_ACTIONS,
  emptyDialog,
  defaultTab,
  defaultSection,
  deleteTab,
  deleteSection,
  dropTab,
  dropSection,
  dropField,
  dropComponent,
  buildDialogPayload,
  handlePropertiesEdit,
} from './helper';
import { defaultField } from './data';
import './style.scss';

// ── Main component ────────────────────────────────────────────────────────────
const ServiceDialogForm = ({ dialogData, dialogAction, emsWorkflowsEnabled }) => {
  const { id: dialogId, action } = dialogAction || {};

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(action !== 'new');
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isDraggingTab, setIsDraggingTab] = useState(false);
  const [dragTabIndex, setDragTabIndex] = useState(null);

  // Draft recovery
  const { saveDraft, loadDraft, clearDraft } = useDraftRecovery(dialogId, action);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const pendingDraft = useRef(null);  // holds the draft captured at mount; cleared after modal decision
  const debounceTimer = useRef(null);

  // Modal states
  const [tabModal, setTabModal] = useState({ open: false, tabIndex: null });
  const [sectionModal, setSectionModal] = useState({ open: false, tabIndex: null, sectionIndex: null });

  // ── Load dialog data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (action === 'new') {
      const draft = loadDraft();
      if (draft) {
        pendingDraft.current = draft;
        setShowDraftModal(true);
      }
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
        const draft = loadDraft();
        if (draft) {
          pendingDraft.current = draft;
          setShowDraftModal(true);
        }
        setData(loaded);
      })
      .catch(() => {
        setData(emptyDialog());
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dialogId, action]);

  // ── Debounced draft save on every data change ──────────────────────────────
  // Suppressed while showDraftModal is true so the initial load can't overwrite
  // the captured draft before the user makes a Restore/Discard decision.
  useEffect(() => {
    if (!data || showDraftModal) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveDraft(data);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [data, showDraftModal]);

  // ── Action dispatcher ───────────────────────────────────────────────────────
  const handleAction = useCallback((actionType, payload) => {
    // section.edit without values = request to open the edit modal
    if (actionType === SD_ACTIONS.section.edit && !payload.values) {
      setSectionModal({ open: true, tabIndex: payload.tabIndex, sectionIndex: payload.sectionIndex });
      return;
    }

    setData((prev) => {
      if (!prev) return prev;

      switch (actionType) {
        case SD_ACTIONS.tab.delete: {
          const newData = deleteTab(prev, payload.tabIndex);
          setSelectedTabIndex(Math.max(0, selectedTabIndex - (payload.tabIndex <= selectedTabIndex ? 1 : 0)));
          return newData;
        }
        case SD_ACTIONS.tab.add: {
          const newTab = {
            ...defaultTab((prev.dialog_tabs || []).length),
            ...(payload && payload.values ? payload.values : {}),
          };
          return { ...prev, dialog_tabs: [...(prev.dialog_tabs || []), newTab] };
        }
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
          const newSection = {
            ...defaultSection(groups.length),
            ...(payload.values || {}),
          };
          groups.push(newSection);
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

        case SD_ACTIONS.field.reorder:
          return dropField(prev, payload.tabIndex, payload.sectionIndex, payload.fromIndex, payload.toIndex);

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
        clearDraft();
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
    clearDraft();
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
    e.dataTransfer.setData('application/sd-tab', String(tabIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTabDrop = (e, toIndex) => {
    e.preventDefault();
    // Ignore palette drags that land on a tab header
    if (e.dataTransfer.getData('text/plain')) {
      setDragTabIndex(null);
      setIsDraggingTab(false);
      return;
    }
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
      handleAction(SD_ACTIONS.tab.add, { values });
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
      handleAction(SD_ACTIONS.section.add, { tabIndex: sectionModal.tabIndex, values });
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

  // Draft recovery modal — shown before full UI so user can decide before interacting
  const draftModal = showDraftModal && (
    <Modal
      open
      modalHeading={__('Restore previous changes?')}
      primaryButtonText={__('Restore')}
      secondaryButtonText={__('Discard')}
      onRequestSubmit={() => {
        if (pendingDraft.current) setData(pendingDraft.current);
        pendingDraft.current = null;
        clearDraft();
        setShowDraftModal(false);
      }}
      onSecondarySubmit={() => {
        pendingDraft.current = null;
        clearDraft();
        setShowDraftModal(false);
      }}
      onRequestClose={() => {
        pendingDraft.current = null;
        clearDraft();
        setShowDraftModal(false);
      }}
    >
      <p>{__('Unsaved changes from a previous session were found. Would you like to restore them?')}</p>
    </Modal>
  );

  if (isLoading) {
    return (
      <div className="service-dialog-form__loading">
        <Loading withOverlay={false} small />
      </div>
    );
  }

  const tabs = (data && data.dialog_tabs) || [];

  const selectedTab = tabs[selectedTabIndex] || tabs[0];
  const currentTabIndex = Math.min(selectedTabIndex, Math.max(0, tabs.length - 1));

  return (
    <div className="service-dialog-form">
      {draftModal}
      {/* ── Header: General section — label + description ── */}
      <div className="service-dialog-form__header">
        <h4 className="service-dialog-form__general-heading">{__('General')}</h4>
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
                <TabPanel
                  key={tab.id || tab.label || ti}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromStr = e.dataTransfer.getData('application/sd-section');
                    if (fromStr !== '') {
                      const fromIndex = parseInt(fromStr, 10);
                      const toIndex = (tab.dialog_groups || []).length - 1;
                      if (!Number.isNaN(fromIndex) && fromIndex !== toIndex) {
                        handleAction(SD_ACTIONS.section.reorder, { tabIndex: ti, fromIndex, toIndex });
                      }
                    }
                  }}
                >
                  {(tab.dialog_groups || []).map((section, si) => (
                    <DynamicSection
                      key={section.id || section.label || si}
                      section={section}
                      tabIndex={ti}
                      sectionIndex={si}
                      onAction={handleAction}
                      emsWorkflowsEnabled={emsWorkflowsEnabled}
                      dialogData={data}
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
