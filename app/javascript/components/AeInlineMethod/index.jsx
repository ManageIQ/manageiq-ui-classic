import React, { useState } from 'react';
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
const AeInlineMethod = ({ type }) => {
  const [data, setData] = useState({
    isModalOpen: false,
    selectedIds: [],
    rows: [],
  });

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

  /** Function to handle the click events for the list. */
  const onCellClickHandler = (item) => {
    if (item && item.callbackAction && item.callbackAction === 'removeMethod') {
      setData({
        rows: data.rows.filter((row) => row.id !== item.id),
        selectedIds: data.selectedIds.filter((id) => id !== item.id),
      });
    }
  };

  /** Function to handle the modal submit action. */
  const submitModal = () => {
    if (data.selectedIds.length > 0) {
      http.get(`${namespaceUrls.aeMethodsUrl}?ids=${data.selectedIds.map((str) => parseInt(str, 10))}`)
        .then(({ methods }) => setData({ ...data, rows: formatListMethods(methods), isModalOpen: false }));
    } else {
      setData({ ...data, rows: [], isModalOpen: false });
    }
  };

  /** Function to render the modal with namespace selector component. */
  const renderModalSelector = () => (
    <Modal
      size="lg"
      modalHeading={__('Select item')}
      className="ae-inline-method-modal"
      open={data.isModalOpen}
      primaryButtonText={__('OK')}
      secondaryButtonText={__('Cancel')}
      onRequestClose={() => showModal(false)}
      onRequestSubmit={() => submitModal()}
      onSecondarySubmit={() => showModal(false)}
    >
      <ModalBody>
        {
          data.isModalOpen
               && (
                 <NamespaceSelector
                   onSelectMethod={({ selectedItems, cellType, checked }) => onSelectMethod(selectedItems, cellType, checked)}
                   selectedIds={data.selectedIds}
                 />
               )
        }
      </ModalBody>
    </Modal>
  );

  /** Function to render the contents of the list. */
  const renderList = () => (data.rows && data.rows.length > 0
    ? (
      <MiqDataTable
        headers={methodListHeaders}
        rows={data.rows}
        mode="miq-inline-method-list"
        sortable={false}
        onCellClick={(selectedRow) => onCellClickHandler(selectedRow)}
      />
    )
    : (
      <div className="ae-inline-methods-notification">
        <NotificationMessage type="info" message={__('No methods selected.')} />
      </div>
    ));

  const renderAddButton = () => (
    <div className="custom-form-buttons">
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

  const renderCustomContents = () => (
    <Accordion align="start" className="miq-custom-form-accordion">
      <AccordionItem title={__('Methods')} open>
        {renderAddButton()}
        {renderList()}
      </AccordionItem>
    </Accordion>
  );

  return (
    <div className="custom-form-wrapper">
      {renderCustomContents()}
      {renderModalSelector()}
    </div>
  );
};

export default AeInlineMethod;

AeInlineMethod.propTypes = {
  type: PropTypes.string.isRequired,
};
