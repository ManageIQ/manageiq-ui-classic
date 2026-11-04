import {
  useState, useEffect, useCallback, useRef,
} from 'react';
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
import miqFlash from '../../helpers/miq-flash';
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
  deleteField,
  saveDisabledReason,
} from './helper';
import { defaultField, resetFieldCounters, seedFieldCounters } from './data';
import './style.scss';

const ServiceDialogForm = ({ dialogAction, emsWorkflowsEnabled = false }) => {
  const { id: dialogId, action } = dialogAction || {};

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(action !== 'new');
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [dragTabIndex, setDragTabIndex] = useState(null);

  // Draft recovery
  const { saveDraft, loadDraft, clearDraft } = useDraftRecovery(dialogId, action);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const pendingDraft = useRef(null); // holds the draft captured at mount; cleared after modal decision
  const debounceTimer = useRef(null);
  const initialSnapshot = useRef(null); // serialised state as first loaded; an unchanged dialog needs no draft

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  // Modal states
  const [tabModal, setTabModal] = useState({ open: false, tabIndex: null });
  const [sectionModal, setSectionModal] = useState({ open: false, tabIndex: null, sectionIndex: null });

  const setInitialData = (initial) => {
    initialSnapshot.current = JSON.stringify(initial);
    setData(initial);
  };

  // Load dialog data
  useEffect(() => {
    if (action === 'new') {
      resetFieldCounters();
      const draft = loadDraft();
      if (draft) {
        pendingDraft.current = draft;
        setShowDraftModal(true);
      }
      setInitialData(emptyDialog());
      setIsLoading(false);
      return;
    }

    if (!dialogId) {
      setInitialData(emptyDialog());
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
        seedFieldCounters(loaded);
        setInitialData(loaded);
      })
      .catch(() => {
        setInitialData(emptyDialog());
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dialogId, action]);

  // Debounced draft save on every data change.
  // Suppressed while showDraftModal is true so the initial load doesn't overwrite
  // the captured draft before the user makes a Restore/Discard decision.
  // Data identical to the initial state is not a draft, so any stored draft is cleared instead.
  useEffect(() => {
    if (data && !showDraftModal) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        if (JSON.stringify(data) === initialSnapshot.current) {
          clearDraft();
        } else {
          saveDraft(data);
        }
      }, 500);
    }
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [data, showDraftModal]);

  const handleAction = useCallback((actionType, payload) => {
    // section.edit without values = request to open the edit modal
    if (actionType === SD_ACTIONS.section.edit && !payload.values) {
      setSectionModal({ open: true, tabIndex: payload.tabIndex, sectionIndex: payload.sectionIndex });
      return;
    }

    const isDelete = [SD_ACTIONS.tab.delete, SD_ACTIONS.section.delete, SD_ACTIONS.field.delete].includes(actionType);
    if (isDelete && !payload.confirmed) {
      setDeleteConfirm({ actionType, payload });
      return;
    }

    // Selection changes live outside the setData updater, which must stay free of side effects.
    if (actionType === SD_ACTIONS.tab.delete) {
      setSelectedTabIndex(Math.max(0, selectedTabIndex - (payload.tabIndex <= selectedTabIndex ? 1 : 0)));
    } else if (actionType === SD_ACTIONS.tab.add && data) {
      setSelectedTabIndex((data.dialog_tabs || []).length); // focus the new tab
    }

    setData((prev) => {
      if (!prev) {
        return prev;
      }

      switch (actionType) {
        case SD_ACTIONS.tab.delete:
          return deleteTab(prev, payload.tabIndex);
        case SD_ACTIONS.tab.add: {
          const existingTabs = prev.dialog_tabs || [];
          const newTab = {
            ...defaultTab(existingTabs.length),
            ...(payload && payload.values ? payload.values : {}),
          };
          return { ...prev, dialog_tabs: [...existingTabs, newTab] };
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

        case SD_ACTIONS.field.delete:
          return deleteField(prev, payload.tabIndex, payload.sectionIndex, payload.fieldIndex);
        case SD_ACTIONS.field.edit:
          return handlePropertiesEdit(prev, payload.tabIndex, payload.sectionIndex, payload.fieldIndex, payload.values);

        default:
          return prev;
      }
    });
  }, [data, selectedTabIndex]);

  const handleSubmit = () => {
    if (!data) {
      return;
    }
    miqSparkleOn();

    const isCopy = action === 'copy';
    const isEdit = action === 'edit' && !isCopy;
    const payloadAction = isEdit ? 'edit' : 'create';
    const payload = buildDialogPayload(data, isCopy ? 'copy' : payloadAction);

    const url = isEdit && dialogId
      ? `/api/service_dialogs/${dialogId}`
      : '/api/service_dialogs';

    API.post(url, payload, { skipErrors: [400] })
      .then(() => {
        clearDraft();
        const msg = isEdit
          ? sprintf(__('Service Dialog "%s" was saved'), data.label)
          : sprintf(__('Service Dialog "%s" was added'), data.label);
        miqRedirectBack(msg, 'success', '/miq_ae_customization/explorer');
      })
      .catch((error) => {
        miqSparkleOff();
        const reason = error && error.data && error.data.error && error.data.error.message;
        if (reason) {
          miqFlash('error', sprintf(__('There was an error editing this dialog: %s'), reason));
        }
      });
  };

  const leaveEditor = () => {
    clearDraft();
    const msg = action === 'edit'
      ? sprintf(__('Edit of Service Dialog "%s" was cancelled by the user'), data ? data.label : '')
      : __('Creation of a new Service Dialog was cancelled by the user');
    miqRedirectBack(msg, 'warning', '/miq_ae_customization/explorer');
  };

  const handleCancel = () => {
    if (JSON.stringify(data) === initialSnapshot.current) {
      leaveEditor();
    } else {
      setShowAbandonConfirm(true);
    }
  };

  // Tab drag-and-drop
  const handleTabDragStart = (e, tabIndex) => {
    if (document.querySelector('.cds--modal.is-visible')) {
      e.preventDefault();
      return;
    }
    setDragTabIndex(tabIndex);
    e.dataTransfer.setData('application/sd-tab', String(tabIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTabDrop = (e, toIndex) => {
    e.preventDefault();
    // Ignore palette drags that land on a tab header
    if (e.dataTransfer.getData('text/plain')) {
      setDragTabIndex(null);
      return;
    }
    if (dragTabIndex !== null && dragTabIndex !== toIndex) {
      handleAction(SD_ACTIONS.tab.reorder, { fromIndex: dragTabIndex, toIndex });
    }
    setDragTabIndex(null);
  };

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

  const deleteConfirmModal = deleteConfirm && (() => {
    const { actionType, payload } = deleteConfirm;
    const tab = ((data && data.dialog_tabs) || [])[payload.tabIndex];
    const section = tab && (tab.dialog_groups || [])[payload.sectionIndex];
    const field = section && (section.dialog_fields || [])[payload.fieldIndex];
    const kinds = {
      [SD_ACTIONS.tab.delete]: { heading: __('Delete tab'), item: tab },
      [SD_ACTIONS.section.delete]: { heading: __('Delete section'), item: section },
      [SD_ACTIONS.field.delete]: { heading: __('Delete field'), item: field },
    };
    const { heading, item } = kinds[actionType];
    return (
      <Modal
        open
        danger
        size="sm"
        modalHeading={heading}
        primaryButtonText={__('Delete')}
        secondaryButtonText={__('Cancel')}
        onRequestSubmit={() => {
          setDeleteConfirm(null);
          handleAction(actionType, { ...payload, confirmed: true });
        }}
        onRequestClose={() => setDeleteConfirm(null)}
      >
        <p>{sprintf(__('Are you sure you want to delete "%s"?'), (item && item.label) || '')}</p>
      </Modal>
    );
  })();

  const abandonConfirmModal = showAbandonConfirm && (
    <Modal
      open
      danger
      size="sm"
      modalHeading={__('Abandon changes?')}
      primaryButtonText={__('Abandon')}
      secondaryButtonText={__('Keep editing')}
      onRequestSubmit={leaveEditor}
      onRequestClose={() => setShowAbandonConfirm(false)}
    >
      <p>{__('Your changes to this dialog have not been saved and will be lost.')}</p>
    </Modal>
  );

  // Draft recovery modal — shown before full UI so user can decide before interacting
  const draftModal = showDraftModal && (
    <Modal
      open
      modalHeading={__('Restore previous changes?')}
      primaryButtonText={__('Restore')}
      secondaryButtonText={__('Discard')}
      onRequestSubmit={() => {
        if (pendingDraft.current) {
          setData(pendingDraft.current);
        }
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

  const saveReason = saveDisabledReason(data);
  const saveDisabled = saveReason !== null;

  const currentTabIndex = Math.min(selectedTabIndex, Math.max(0, tabs.length - 1));

  return (
    <div className="service-dialog-form">
      {draftModal}
      {deleteConfirmModal}
      {abandonConfirmModal}
      {/* Header: label + description */}
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

      {/* Body: palette + canvas */}
      <div className="service-dialog-form__body">
        {/* Palette */}
        <div className="service-dialog-form__palette">
          <DynamicComponentChooser />
        </div>

        {/* Canvas */}
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
                    {/* TabOptionsMenu is a child of the Tab label span, not renderIcon.
                        Carbon renders a button-inside-button warning but there is no other
                        way to attach per-tab overflow actions with the current Tabs API. */}
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
                    className="service-dialog-form__add-section-btn"
                  >
                    {__('Add Section')}
                  </Button>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <div className="service-dialog-form__footer">
        <Button kind="primary" onClick={handleSubmit} disabled={saveDisabled}>
          {__('Save')}
        </Button>
        <Button kind="secondary" onClick={handleCancel}>
          {__('Cancel')}
        </Button>
        {saveDisabled && (
          <span className="service-dialog-form__save-hint" role="status">{saveReason}</span>
        )}
      </div>

      {/* Tab edit modal */}
      <EditTabModal
        isOpen={tabModal.open}
        tab={tabModal.tabIndex !== null ? tabs[tabModal.tabIndex] : undefined}
        onSave={saveTab}
        onClose={closeTabModal}
      />

      {/* Section edit modal */}
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
  dialogAction: PropTypes.shape({
    id: PropTypes.string,
    action: PropTypes.oneOf(['new', 'edit', 'copy']),
  }).isRequired,
  emsWorkflowsEnabled: PropTypes.bool,
};

export default ServiceDialogForm;
