import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import PropTypes from 'prop-types';
import {
  Modal, Button, ModalBody, Accordion, AccordionItem,
} from 'carbon-components-react';
import { AddAlt16 } from '@carbon/icons-react';
import NotificationMessage from '../notification-message';
import MiqDataTable from '../miq-data-table';
import NamespaceSelector from './NamespaceSelector';
import { CellAction } from '../miq-data-table/helper';
import { formatListMethods, methodListHeaders, namespaceUrls } from './helper';

/** Component to render a tree and to select an embedded method. */
const AeInlineMethod = ({ type, selected }) => {
  const queryClient = new QueryClient();

  const [data, setData] = useState({
    isModalOpen: false,
    selectedIds: selected ? selected.map((item) => item.id.toString()) : [],
    rows: selected ? formatListMethods(selected) : [],
    notification: false,
  });

  useEffect(() => {
    setData({ ...data, notification: data.selectedIds.length > 20 });
  }, [data.selectedIds]);

  /** Function to show/hide the modal. */
  const showModal = (status) => setData({ ...data, isModalOpen: status });

  /** Function to handle the select-all check-box click event. */
  const onSelectAll = (selectedItems, checked) => setData({ ...data, selectedIds: checked ? [...selectedItems] : [] });

  /** Function to handle the list row selection events.
   * selectedItem is passed as an array. */
  const onItemSelect = (selectedItems, checked) => {
    if (checked) {
      data.selectedIds.push(selectedItems[0].id);
    } else {
      data.selectedIds = data.selectedIds.filter((item) => item !== selectedItems[0].id);
    }
    setData({ ...data, selectedIds: [...data.selectedIds] });
  };

  /** Function to add/remove an selected items. */
  const onSelectMethod = (selectedItems, cellType, checked) => {
    switch (cellType) {
      case CellAction.selectAll: onSelectAll(selectedItems, checked); break;
      default: onItemSelect(selectedItems, checked); break;
    }
  };

  /** Updates the ruby form with the selected methods. */
  const updateRubyForm = (ids) => $.get(`${namespaceUrls.aeMethodOperationsUrl}?&ids=${ids}`);

  /** Function to handle the click events for the list. */
  const onCellClickHandler = (item) => {
    if (item && item.callbackAction && item.callbackAction === 'removeMethod') {
      const ids = data.selectedIds.filter((id) => id !== item.id);
      setData({
        rows: data.rows.filter((row) => row.id !== item.id),
        selectedIds: ids,
      });
      updateRubyForm(ids.map((str) => parseInt(str, 10)));
    }
  };

  /** Function to handle the modal submit action. */
  const submitModal = () => {
    if (data.selectedIds.length > 0) {
      const ids = data.selectedIds.map((str) => parseInt(str, 10));
      http.get(`${namespaceUrls.aeMethodsUrl}?ids=${ids}`)
        .then(({ methods }) => {
          setData({
            ...data, rows: formatListMethods(methods), isModalOpen: false,
          });
          updateRubyForm(ids);
        });
    } else {
      setData({
        ...data, rows: [], isModalOpen: false,
      });
    }
  };

  /** Function to render the modal with namespace selector component. */
  const renderModalSelector = () => (
    <Modal
      size="lg"
      modalHeading={data.selectedIds.length === 0 ? __('Select methods') : `${__('Selected methods')} - ${data.selectedIds.length}`}
      className="ae-inline-method-modal"
      open={data.isModalOpen}
      primaryButtonText={__('OK')}
      secondaryButtonText={__('Cancel')}
      onRequestClose={() => showModal(false)}
      onRequestSubmit={() => submitModal()}
      onSecondarySubmit={() => showModal(false)}
      primaryButtonDisabled={data.selectedIds.length > 20 || data.selectedIds.length === 0}
    >
      <ModalBody>
        {
          data.isModalOpen
               && (
                 <QueryClientProvider client={queryClient}>
                   {
                     data.notification && <NotificationMessage type="error" message={__('Cannot select more than 20 items')} />
                   }
                   <NamespaceSelector
                     onSelectMethod={({ selectedItems, cellType, checked }) => onSelectMethod(selectedItems, cellType, checked)}
                     selectedIds={data.selectedIds}
                   />
                 </QueryClientProvider>
               )
        }
      </ModalBody>
    </Modal>
  );

  /** Function to render the contents of the list. */
  const renderList = () => (data.rows && data.rows.length > 0
    ? (
      <div className="miq-inline-method-list-container">
        <MiqDataTable
          headers={methodListHeaders}
          stickyHeader
          rows={data.rows}
          mode="miq-inline-method-list"
          sortable={false}
          onCellClick={(selectedRow) => onCellClickHandler(selectedRow)}
        />
      </div>
    )
    : (
      <div className="ae-inline-methods-notification">
        <NotificationMessage type="info" message={__('No methods selected.')} />
      </div>
    ));

  const renderAddButton = () => (
    <div className="custom-form-buttons">
      {
        data.selectedIds.length > 0 && (
          <div className="custom-form-buttons-label">
            {__('Listing')}
            {` ${data.selectedIds.length} `}
            {__('Method(s)')}
          </div>
        )
      }
      <Button
        id="add-method"
        kind="primary"
        title={__('Add Method')}
        renderIcon={AddAlt16}
        onClick={() => showModal(true)}
        size="sm"
      >
        {__('Add method')}
      </Button>
    </div>
  );

  const renderAccordionContents = () => (
    <Accordion align="start" className="miq-custom-form-accordion">
      <AccordionItem title={__('Embedded Methods')} open>
        {renderAddButton()}
        {renderList()}
      </AccordionItem>
    </Accordion>
  );

  return (
    <div className="custom-form-wrapper">
      {renderAccordionContents()}
      {renderModalSelector()}
    </div>
  );
};

export default AeInlineMethod;

AeInlineMethod.propTypes = {
  type: PropTypes.string.isRequired,
  selected: PropTypes.arrayOf(PropTypes.any),
};

AeInlineMethod.defaultProps = {
  selected: undefined,
};
