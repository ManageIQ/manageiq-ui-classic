import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';
import MiqDataTable from '../miq-data-table';
import MiqStructuredList from '../miq-structured-list';
import SettingsCompanyTagsEntryForm from '../settings-company-tags-entry-form';
import { rowData, CellAction } from '../miq-data-table/helper';
import NoRecordsFound from '../no-records-found';
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
  });

  /** Function to fetch the information needed for summary and list when the select box is changed. */
  const categoryInformation = (categoryId) => {
    miqSparkleOn();
    http.get(`/ops/category_information/${categoryId}`).then((response) => {
      const { summary, list, selectedCategory } = pageData(response, data.options);
      setData({
        ...data,
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

  /** Function to be exeuted after the add/save/cancel/delete action */
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
      // confirm box will be changed after other tab contents are changed.
      // eslint-disable-next-line no-alert
      if (window.confirm(__('Are you sure you want to delete this entry?'))) {
        miqSparkleOn();
        http.post(`/ops/ce_delete/${data.selectedCategory.id}?entry_id=${item.id}`).then((response) => {
          setData({
            ...data,
            notification: { visible: true, type: 'danger', message: response.message },
          });
          miqSparkleOff();
          add_flash(__('Category entry was successfully deleted'), response.type);
          return categoryInformation(response.category_id);
        });
      }
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

  /** Function to render the add new button */
  const renderActionButton = () => (
    <Button
      onClick={() => onSelect('new')}
      onKeyPress={() => onSelect('new')}
      title={__('Click to add a new entry')}
    >
      {__('Add Entry')}
    </Button>
  );

  /** Function to render the title bar */
  const renderTitleBar = (title, hasButton) => (
    <div className="miq-custom-tab-content-header">
      <div className="tab-content-header-title">
        <h3>{title}</h3>
      </div>
      <div className="tab-content-header-actions" />
      {
        hasButton && renderActionButton()
      }
    </div>
  );

  /** Function to render the summary. */
  const renderSummary = () => {
    const { rows, mode } = data.summary;
    return (
      <MiqStructuredList
        rows={rows}
        mode={mode}
        onClick={(dropDownData) => onDropDownChange(dropDownData)} // ToDo: onClick must be generic name
      />
    );
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
        {renderTitleBar(sprintf(__('%s Entries'), data.selectedCategory.description), true)}
        <MiqDataTable
          rows={miqRows.rowItems}
          headers={data.list.headers}
          onCellClick={(selectedRow, cellType, event) => onCellClick(selectedRow, cellType, event)}
          showPagination={false}
          mode="settings-company-tags-list"
        />
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
      {data.pageType === pageTypes.list ? renderList() : renderForm()}
    </>
  );

  /** The header and summary is displayed by default.
   * The selected category entries are listed by default in the 'MiqStructuredList'.
   * When a row is selected, the 'MiqStructuredList' is hidden and 'SettingsCompanyTagsEntryForm' is displayed.
  */
  return (
    <>
      {renderTitleBar(pageTitle, false)}
      {!data.isLoading && renderTabContent()}
    </>
  );
};

SettingsCompanyTags.propTypes = {
  pageTitle: PropTypes.string.isRequired,
  categoryId: PropTypes.number.isRequired,
};

export default SettingsCompanyTags;
