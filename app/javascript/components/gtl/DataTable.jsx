import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { renderDataTableToolbar } from './utils';
import { renderPagination } from './utils';

const classNames = require('classnames');

const getNodeIconType = (row, columnKey) =>
  row && row.cells && ['image', 'icon']
    .find(item => Object.prototype.hasOwnProperty.call(row.cells[columnKey], item)
      && !!row.cells[columnKey][item]);

const isFilteredBy = (settings, column) => settings.sort_col === column.col_idx;

export const DataTable = ({
  rows,
  columns,
  inEditMode,
  noCheckboxes,
  settings,
  isLoading,
  pagination,
  total,
  onSelectAll,
  onSort,
  onItemClick,
  onItemSelect,
  onItemButtonClick,
  onPerPageSelect,
  onPageSet,
  showPagination,
}) => {

  const selectAll = () => {
    const [checkedItems, setCheckedItems] = useState({}); //plain object as state

    const localOnSelectAll = (ev) => {
      if (ev.target.classList.contains('is-checkbox-cell') ||
        ev.target.parentElement.classList.contains('is-checkbox-cell')) {
        return;
      }

      onSelectAll(rows, ev.target);
      setCheckedItems({...checkedItems, [ev.target.name]: ev.target.checked});
      ev.stopPropagation();
    };

    return (
      <input type="checkbox"
             name={'selectAll'}
             key={'selectAll'}
             checked={!!checkedItems['selectAll']}
             onChange={localOnSelectAll}
             onKeyPress={localOnSelectAll}
             role="checkbox"
             aria-checked="false"
             tabIndex="0"
             aria-labelledby="selectAll"
             title="Check All"/>
    );
  };

  const renderTableHeader = () => (
    <thead className="miq-thead">
      <tr>
        {!inEditMode() && !noCheckboxes() &&
        <th className="narrow table-view-pf-select">
          <label className="hiddenCheckboxLabel" id="selectAll" aria-hidden="true">{__('Select All')}</label>
          {selectAll()}
        </th>
        }
        {columns.map((column, index) =>
          (noCheckboxes() || inEditMode() || (index !== 0 && !noCheckboxes())) &&
            <th
              onClick={onSort({headerId: column.col_idx, isAscending: settings.sort_dir == "ASC" })}
              onKeyPress={onSort({headerId: column.col_idx, isAscending: settings.sort_dir == "ASC" })}
              tabIndex="0"
              className={classNames({ narrow: column.is_narrow, 'table-view-pf-select': column.is_narrow })}
              key={`header_${index}`}
            >
              {column.header_text}
              {isFilteredBy(settings, column) &&
                <div className="pull-right">
                  <i className={
                    classNames('fa', {
                      'fa-sort-asc': !(settings.sort_dir == "ASC"),
                      'fa-sort-desc': !(!!settings.sort_dir == "ASC"),
                    })}
                  />
                </div>
              }
            </th>)
        }
      </tr>
    </thead>
  );

  const localOnItemSelected = row => ev => {
    onItemSelect(row, ev.target.checked);
    ev.stopPropagation();
  };

  const classNameRow = (row) => {
    if (row.clickable === false) return 'simple-row';
    if (row.clickable === null) return 'clickable-row';
    return '';
  };

  const localOnClickItem = row => ev => {
    if (ev.target.classList.contains('is-checkbox-cell') ||
       ev.target.parentElement.classList.contains('is-checkbox-cell')) {
      return;
    }

    ev.stopPropagation();
    ev.preventDefault();
    onItemClick(row);
  };

  const renderTableBody = () => (
    <tbody>
      {rows.map(row => (
        <tr
          className={row.selected ? `active ${classNameRow(row)}` : classNameRow(row)}
          key={`check_${row.id}`}
          onClick={localOnClickItem(row)}
          onKeyPress={localOnClickItem(row)}
          tabIndex={(row.clickable === false) ? '' : '0'}
        >
          {columns.map((column, columnKey) => (
            <td
              key={`td_${columnKey}`}
              className={classNames({
                narrow: row.cells[columnKey].is_checkbox || row.cells[columnKey].icon || row.cells[columnKey].is_button,
                'is-checkbox-cell': row.cells[columnKey].is_checkbox,
              })}
            >
              { row.cells[columnKey].is_checkbox && !settings.hideSelect && !inEditMode() &&
              <label className="hiddenCheckboxLabel" id={`check_${row.id}`} aria-hidden="true">{`check_${row.id}`}</label> &&
              <input
                  onChange={localOnItemSelected(row)}
                  onKeyPress={localOnItemSelected(row)}
                  role="checkbox"
                  aria-checked="false"
                  tabIndex="0"
                  aria-labelledby={`check_${row.id}`}
                  type="checkbox"
                  name={`check_${row.id}`}
                  value={row.id}
                  checked={row.checked || false}
                  className="list-grid-checkbox"
                />
              }
              { getNodeIconType(row, columnKey) === 'icon' &&
                <i
                  className={row.cells[columnKey].icon}
                  title={row.cells[columnKey].title}
                >
                  <i ng-if="row.cells[columnKey].icon2" className={row.cells[columnKey].icon2} />
                </i>
              }
              { getNodeIconType(row, columnKey) === 'image' &&
                <img
                  src={row.cells[columnKey].picture || row.cells[columnKey].image}
                  alt={row.cells[columnKey].title}
                  title={row.cells[columnKey].title}
                />
              }
              { row.cells[columnKey].text && !row.cells[columnKey].is_button &&
                <span>
                  {row.cells[columnKey].text}
                </span>
              }
              { row.cells[columnKey].is_button && row.cells[columnKey].onclick &&
                <button
                  className="btn btn-primary"
                  disabled={row.cells[columnKey].disabled}
                  title={row.cells[columnKey].title}
                  alt={row.cells[columnKey].title}
                  onClick={onItemButtonClick(row)}
                  onKeyPress={onItemButtonClick(row)}
                  tabIndex="0"
                >
                  {row.cells[columnKey].text}
                </button>
              }
            </td>))}
        </tr>
      ))}
    </tbody>);

  const renderTable = () => (
    <table className="table table-bordered table-striped table-hover miq-table-with-footer miq-table">
      { renderTableHeader() }
      { renderTableBody() }
    </table>
  );

  const isVisible = settings && settings.sort_dir && (isLoading || rows.length !== 0);

  return (
    <div className="miq-data-table">
      { isLoading && <div className="spinner spinner-lg" /> }
      { renderDataTableToolbar() }
      { (!inEditMode() || showPagination()) && isVisible
      && renderPagination({
        pagination, total, onPerPageSelect, onPageSet,
      })
      }
      { rows.length !== 0 && renderTable() }
    </div>
  );
};

DataTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.any).isRequired,
  columns: PropTypes.arrayOf(PropTypes.any).isRequired,
  settings: PropTypes.any.isRequired,
  pagination: PropTypes.any.isRequired,
  total: PropTypes.number.isRequired,
  inEditMode: PropTypes.func.isRequired,
  noCheckboxes: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  onSelectAll: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  onItemClick: PropTypes.func.isRequired,
  onItemSelect: PropTypes.func.isRequired,
  onItemButtonClick: PropTypes.func.isRequired,
  onPerPageSelect: PropTypes.func.isRequired,
  onPageSet: PropTypes.func.isRequired,
};

export default DataTable;
