/* eslint-disable no-undef */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../../miq-data-table';
import { CellAction } from '../../miq-data-table/helper';
import {
  tableData, addSelected, removeSelected,
} from './helper';

const TimeProfileTable = ({
  initialData,
}) => {
  const { headers, rows } = tableData(initialData);

  /** Function to find an item from initialData. */
  const findItem = (item) => initialData.find((row) => row.id.toString() === item.id.toString());

  /** The id's used for carbon-table checkbox selections. eg ['111','222','333']. */
  const itemIds = initialData.map((item) => item.id);

  /** The clickId's are used for ManageIQ.gridchecks. eg ['aen-111','aen-222','aen-333'].
   * These ids are used for click events of MiqToolbar. */
  const clickIds = initialData.map((item) => item.clickId);

  const [selectionIds, setSelectionIds] = useState([]);

  /** Function to update the checkbox selections states */
  const updateSelection = (selectedClickIds, selectedItemIds) => {
    ManageIQ.gridChecks = selectedClickIds;
    miqSetToolbarCount(selectedClickIds.length);
    setSelectionIds(selectedItemIds);
  };

  /** Function to check all checkboxes in table row from the data received from initialData. */
  const selectAll = () => updateSelection(clickIds, itemIds);

  /** Function to uncheck all checkboxes in table row */
  const unSelectAll = () => updateSelection([], []);

  /** Function to handle the select/unselect event when checkbox in table header is clicked. */
  const onSelectAll = (event) => {
    if (event.target.checked) {
      if (selectionIds.length > 0) {
        event.target.checked = false;
        unSelectAll();
      } else {
        selectAll();
      }
    } else {
      unSelectAll();
    }
  };

  /** Function to execute the row's click event to render item's show page. */
  const onItemClick = (selectedRow) => {
    if (selectedRow && selectedRow.clickable) {
      DoNav(`/configuration/timeprofile_edit/${selectedRow.id}`);
    }
  };

  /** Function to add item into carbon-table checkbox and ManageIQ.gridChecks. */
  const addItem = ({ id, clickId }) => ({
    selectedItemIds: addSelected(selectionIds, id),
    selectedClickIds: addSelected(ManageIQ.gridChecks || [], clickId),
  });

  /** Function to remove item from carbon-table checkbox and ManageIQ.gridChecks. */
  const removeItem = ({ id, clickId }) => ({
    selectedItemIds: removeSelected(selectionIds, id),
    selectedClickIds: removeSelected(ManageIQ.gridChecks || [], clickId),
  });

  /** Function to handle the select/unselect event when the checkbox in a row is clicked. */
  const onItemSelect = (item, target) => {
    const { selectedItemIds, selectedClickIds } = (target.checked) ? addItem(item) : removeItem(item);
    updateSelection(selectedClickIds, selectedItemIds);
  };

  /** Function to handle the cell event actions. */
  const onCellClick = (selectedRow, cellType, event) => {
    switch (cellType) {
      case CellAction.selectAll: onSelectAll(event); break;
      case CellAction.itemSelect: onItemSelect(findItem(selectedRow), event.target); break;
      case CellAction.itemClick: onItemClick(findItem(selectedRow)); break;
      default: onItemClick(findItem(selectedRow)); break;
    }
  };

  return (
    <MiqDataTable
      rows={rows.rowItems}
      headers={headers}
      onCellClick={(selectedRow, cellType, event) => onCellClick(selectedRow, cellType, event)}
      gridChecks={selectionIds}
      rowCheckBox
      mode="time-profile"
    />
  );
};

TimeProfileTable.propTypes = {
  initialData: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default TimeProfileTable;
