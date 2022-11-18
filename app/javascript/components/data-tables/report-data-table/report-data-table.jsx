/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import NoRecordsFound from '../../no-records-found';
import { API } from '../../../http_api';
import { tableData, reportSortDirection } from './helper';
import MiqDataTable from '../../miq-data-table';
import MiqTableToolbar from '../../miq-data-table/miq-table-toolbar';

const makeColumn = (name, label, index) => ({
  property: name,
  header: {
    label,
    props: {
      index,
      rowSpan: 1,
      colSpan: 1,
    },
  },
  cell: {
    props: {
      index: 1,
    },
  },
});

const makeFilterColumn = (name, title, _index) => ({
  id: name,
  title,
  placeholder: sprintf(__('Filter by %s'), title),
  filterType: 'text',
});

const sortColumnAndDirection = (sortingColumns) => {
  const sortBy = (sortingColumns && Object.keys(sortingColumns)[0]) || '';
  const sortDirection = (sortBy && sortingColumns[sortBy].direction) || '';

  return {
    sortBy,
    sortDirection,
  };
};

const parseReportColumns = (reportData) => reportData
  .report.col_order.map((item, index) => ({
    name: item,
    title: reportData.report.headers[index],
  }));

const parseReportRows = (reportData) => reportData
  .result_set.map((item, index) => ({
    id: index,
    ...item,
  }));

const reduceLoadedData = (state, action) => {
  const columns = action.data && action.data.report ? parseReportColumns(action.data) : [];

  // Setting the initial filter field to the first one, if not yet set.
  const filter = { ...state.filter };
  if (!filter.field && columns[0]) {
    filter.field = columns[0].name;
    filter.title = columns[0].title;
  }

  return {
    ...state,
    loading: false,
    columns,
    rows: parseReportRows(action.data),
    total: action.data.count,
    sortingColumns: action.sortingColumns,
    pagination: action.pagination,
    activeFilters: action.activeFilters,
    filter,
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'dataLoaded':
      return reduceLoadedData(state, action);
    case 'filterTypeSelected':
      return {
        ...state,
        filter: {
          string: state.filter && state.filter.string,
          field: action.field,
          title: action.title,
        },
      };
    case 'filterTextUpdate':
      return {
        ...state,
        filter: {
          ...state.filter,
          string: action.string,
        },
      };
    default:
      throw new Error();
  }
};

const initialState = {
  rows: [],
  columns: [],
  sortingColumns: {},
  total: 0,
};

const filterToString = (filter) => (
  filter && filter.field && filter.string
    ? `&filter_column=${filter.field}&filter_string=${encodeURIComponent(filter.string)}`
    : ''
);

const fetchReportPage = (dispatch, reportResultId, sortingColumns, pagination, activeFilters = null) => {
  const { sortBy, sortDirection } = sortColumnAndDirection(sortingColumns);
  const limit = pagination.perPage;
  const offset = pagination.perPage * (pagination.page - 1);

  miqSparkleOn();

  // for now, just one active filter
  const filterString = activeFilters && activeFilters[0]
    ? filterToString(activeFilters[0])
    : '';

  if (reportResultId) {
    const params = `expand_value_format=true&hash_attribute=result_set`
    + `&sort_by=${sortBy}&sort_order=${sortDirection}&`
    + `limit=${limit}&offset=${offset}${filterString}`;

    API.get(`/api/results/${reportResultId}?${params}`).then((data) => {
      dispatch({
        type: 'dataLoaded',
        data,
        sortingColumns,
        pagination,
        activeFilters,
      });

      miqSparkleOff();
    });
  } else {
    miqSparkleOff();
  }
};

const ReportDataTable = (props) => {
  const { perPageDefault, perPageOptions, reportType } = props;
  const initState = {
    ...initialState,
    pagination: {
      page: 1,
      perPage: perPageDefault,
      perPageOptions,
    },
  };

  const [state, dispatch] = useReducer(reducer, initState);

  useEffect(() => {
    fetchReportPage(dispatch, props.reportResultId, state.sortingColumns, state.pagination);
  }, []);

  const columns = state.columns.map((item, index) => makeColumn(item.name, item.title, index));
  const filterColumns = state.columns.map((item, index) => makeFilterColumn(item.name, item.title, index));

  // When clearing the filters, we just empty the activeFilters and
  // keep the current filter setting.
  const fetchNoFilters = () =>
    fetchReportPage(
      dispatch,
      props.reportResultId,
      state.sortingColumns,
      state.pagination,
      null,
    );

  const onPageChange = (page, perPage) => fetchReportPage(
    dispatch,
    props.reportResultId,
    state.sortingColumns,
    {
      ...state.pagination,
      page,
      perPage,
    },
    state.activeFilters,
  );

  const onToolBarSearch = (searchText, eventKey) => {
    if (eventKey === 'Enter') {
      const newPagination = {
        ...state.pagination,
        page: 1,
      };
      const activeFilters = state.filter.string !== ''
        // The currently edited filter becomes the only one active filter.
        ? [{ ...state.filter }]
        // Empty string means no filter.
        : [];
      fetchReportPage(dispatch, props.reportResultId, state.sortingColumns, newPagination, activeFilters);
    } else {
      dispatch({
        type: 'filterTextUpdate',
        string: searchText,
      });
    }
  };

  const setPage = (page) => fetchReportPage(
    dispatch,
    props.reportResultId,
    state.sortingColumns,
    {
      ...state.pagination,
      page,
    },
    state.activeFilters,
  );

  const perPageSelect = (perPage, _e) => fetchReportPage(
    dispatch,
    props.reportResultId,
    state.sortingColumns,
    {
      ...state.pagination,
      perPage, // When setting new page size,
      page: 1, // go to page 1.
    },
    state.activeFilters,
  );

  /** Function to sort the carbon table. */
  const onSort = (property) => {
    fetchReportPage(
      dispatch,
      props.reportResultId,
      {
        [property]: {
          direction: reportSortDirection(property, state.sortingColumns),
          position: 0,
        },
      },
      state.pagination,
      state.activeFilters,
    );
  };

  const onMenuSelect = (menuId) => {
    const field = filterColumns.find((item) => item.id === menuId);
    dispatch({
      type: 'filterTypeSelected',
      field: field && field.id,
      title: field && field.title,
    });
  };

  const pageOptions = {
    totalItems: state.total,
    onPerPageSelect: perPageSelect,
    onPageSet: setPage,
    pageSizes: state.pagination.perPageOptions,
    pageSize: state.pagination.perPage,
    page: state.pagination.page,
    onPageChange: (page, perPage) => onPageChange(page, perPage),
  };

  const { miqHeaders, miqRows } = tableData(columns, state.rows, state.sortingColumns);

  const hasSearch = reportType === 'data';

  const toolbarMenu = filterColumns.map((item) => ({ id: item.id, title: item.title, text: item.title }));

  const renderToolBar = () => (
    <div className="report-table-toolbar">
      <MiqTableToolbar
        toolbarMenu={toolbarMenu}
        onMenuSelect={(menuId) => onMenuSelect(menuId)}
        onToolBarSearch={(searchText, eventKey) => onToolBarSearch(searchText, eventKey)}
        clearFilter={fetchNoFilters}
      />
    </div>
  );

  return (
    <>
      {
        hasSearch && renderToolBar()
      }
      {state.total > 0 && (
        <MiqDataTable
          headers={miqHeaders}
          rows={miqRows}
          mode="report-data-table"
          showPagination
          sortable
          pageOptions={pageOptions}
          onSort={(headerItem) => onSort(headerItem.key)}
        />
      )}
      {hasSearch && state.total === 0 && <NoRecordsFound />}
    </>
  );
};

ReportDataTable.propTypes = {
  reportResultId: PropTypes.number.isRequired,
  perPageOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  perPageDefault: PropTypes.number.isRequired,
  reportType: PropTypes.string.isRequired,
};

export default ReportDataTable;
