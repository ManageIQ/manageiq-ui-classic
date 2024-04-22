import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Accordion, AccordionItem } from 'carbon-components-react';
import { AddAlt16 } from '@carbon/icons-react';
import MiqDataTable from '../miq-data-table';
import MiqStructuredList from '../miq-structured-list';
import SettingsCompanyTagsEntryForm from '../settings-company-tags-entry-form';
import { rowData, CellAction } from '../miq-data-table/helper';
import NoRecordsFound from '../no-records-found';
import MiqConfirmActionModal, { modalCallbackTypes } from '../miq-confirm-action-modal';
import { http } from '../../http_api';
import { categoryOptions, pageData } from './helper';

/** Component to render the 'My Company Tags' content */
const SettingsCompanyTags = ({ pageTitle, categoryId }) => {
  const pageTypes = {
    list: 'LIST',
    form: 'FORM',
  };

  const [data, setData] = useState({
    pageType: pageTypes.list,
    selectedCategory: { id: categoryId },
    selectedEntryId: undefined,
    options: undefined,
    summary: undefined,
    list: undefined,
    isLoading: true,
    listLoading: true,
    confirm: false,
  });

  /** Function to fetch the information needed for summary and list when the select box is changed. */
  const categoryInformation = (categoryId) => {
    miqSparkleOn();
    http.get(`/ops/category_information/${categoryId}`).then((response) => {
      const { summary, list, selectedCategory } = pageData(response, data.options);
      setData({
        ...data,
        confirm: false,
        summary,
        list,
        selectedCategory,
        isLoading: false,
        pageType: pageTypes.list,
      });
      miqSparkleOff();
    });
  };

  useEffect(() => {
    miqSparkleOn();
    Promise.all(
      [
        http.get(`/ops/all_categories/`), // Fetch all categories needed for the select box.
        http.get(`/ops/category_information/${categoryId}`), // Fetch information needed for the summary.
      ]// ToDo - Replace all http.get with API.get when available.
    )
      .then(([{ categories }, categoryInformationData]) => {
        const options = categoryOptions(categories);
        const { summary, list, selectedCategory } = pageData(categoryInformationData, options);
        setData({
          ...data, options, summary, list, selectedCategory, isLoading: false, listLoading: false,
        });
        miqSparkleOff();
      });
  }, [categoryId]);

  const defaultForm = () => {
    setData({
      ...data,
      pageType: pageTypes.list,
      selectedEntryId: undefined,
    });
  };

  /** Function to be executed after the add/save/cancel/delete action */
  const formCallback = (actionType, responseData) => {
    if (responseData.status === 'error') {
      return setData({
        ...data,
        notification: { visible: true, type: 'danger', message: responseData.message },
      });
    }
    switch (actionType) {
      case 'add': return categoryInformation(responseData.category_id);
      case 'save': return categoryInformation(responseData.category_id);
      default: return defaultForm();
    }
  };

  /** Function to set the pageType to form and selectedEntryId when a row items is selected. */
  const onSelect = (selectedEntryId) => {
    setData({
      ...data,
      pageType: pageTypes.form,
      selectedEntryId,
    });
  };

  /** Function to update the tab contents when the select box value is changed. */
  const onDropDownChange = ({ selectedItem }) => categoryInformation(selectedItem.id);

  /** Function to handle the delete button click event from the list. */
  const onButtonCallback = (item) => {
    if (item && item.callbackAction && item.callbackAction === 'deleteEntryCallback') {
      setData({ ...data, selectedEntryId: item.id, confirm: true });
    }
  };

  /** Function to execute the click events of from the list.
   * Like - row's click event and delete button click event.
  */
  const onCellClick = (selectedRow, cellType, _event) => {
    switch (cellType) {
      case CellAction.buttonCallback: onButtonCallback(selectedRow); break;
      case CellAction.itemClick: onSelect(selectedRow.id); break;
      default: onSelect(selectedRow.id); break;
    }
  };

  const deleteEntry = (actionType) => {
    if (actionType === modalCallbackTypes.OK) {
      miqSparkleOn();
      http.post(`/ops/ce_delete/${data.selectedCategory.id}?entry_id=${data.selectedEntryId}`).then((response) => {
        setData({
          ...data,
          confirm: false,
          notification: { visible: true, type: 'danger', message: response.message },
        });
        miqSparkleOff();
        add_flash(__('Category entry was successfully deleted'), response.type);
        return categoryInformation(response.category_id);
      });
    } else {
      setData({ ...data, confirm: false });
    }
  };

  /** Function to render the add new button */
  const renderActionButton = () => (
    <div className="custom-accordion-buttons">
      <Button
        onClick={() => onSelect('new')}
        onKeyPress={() => onSelect('new')}
        renderIcon={AddAlt16}
        size="sm"
        title={__('Click to add a new entry')}
      >
        {__('Add Entry')}
      </Button>
    </div>
  );

  /** Function to render the summary. */
  const renderSummary = () => {
    const { rows, mode } = data.summary;
    return (
      <MiqStructuredList
        rows={rows}
        title={pageTitle}
        mode={mode}
        onClick={(dropDownData) => onDropDownChange(dropDownData)} // ToDo: onClick must be generic name
      />
    );
  };

  /** Function to render a confirmation-modal-box. */
  const renderConfirmModal = () => {
    const modalData = {
      open: data.confirm,
      confirm: __('Are you sure you want to delete this entry?'),
      callback: (actionType) => deleteEntry(actionType),
    };
    return <MiqConfirmActionModal modalData={modalData} />;
  };

  /** Function to render the entries list with a header and button. */
  const renderList = () => {
    if (!data.list) {
      return null;
    }
    const headerKeys = data.list.headers.map((item) => item.key);
    const miqRows = rowData(headerKeys, data.list.rows, false);
    return (
      <>
        <input type="hidden" id="ignore_form_changes" />
        {renderActionButton()}
        <MiqDataTable
          rows={miqRows.rowItems}
          headers={data.list.headers}
          onCellClick={(selectedRow, cellType, event) => onCellClick(selectedRow, cellType, event)}
          showPagination={false}
          mode="settings-company-tags-list"
        />
        {
          data.confirm && renderConfirmModal()
        }
        {miqRows.rowItems.length === 0 && <NoRecordsFound />}
      </>
    );
  };

  /** Function to render a form to add/edit the entries individually. */
  const renderForm = () => {
    if (!data.selectedEntryId || !data.selectedCategory) {
      return null;
    }
    return (
      <SettingsCompanyTagsEntryForm
        categoryId={data.selectedCategory.id}
        entryId={data.selectedEntryId}
        callbackAction={(actionType, responseData) => formCallback(actionType, responseData)}
      />
    );
  };

  /** Function to render the summary and list/form */
  const renderTabContent = () => (
    <>
      {data.summary && data.options && renderSummary()}
      <Accordion align="start" className="miq-custom-accordion">
        <AccordionItem title={sprintf(__('%s Entries'), data.selectedCategory.description)} open>
          {data.pageType === pageTypes.list ? renderList() : renderForm()}
        </AccordionItem>
      </Accordion>

    </>
  );

  /** The header and summary is displayed by default.
   * The selected category entries are listed by default in the 'MiqStructuredList'.
   * When a row is selected, the 'MiqStructuredList' is hidden and 'SettingsCompanyTagsEntryForm' is displayed.
  */
  return (
    <>
      {!data.isLoading && renderTabContent()}
    </>
  );
};

SettingsCompanyTags.propTypes = {
  pageTitle: PropTypes.string.isRequired,
  categoryId: PropTypes.number.isRequired,
};

export default SettingsCompanyTags;
