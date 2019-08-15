import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import * as resolve from 'table-resolver';
import {
  customHeaderFormattersDefinition,
  EmptyState,
  Filter,
  Form,
  FormControl,
  Paginator,
  PAGINATION_VIEW,
  sortableHeaderCellFormatter,
  Table,
  TABLE_SORT_DIRECTION,
  TableCell,
} from 'patternfly-react';

import { API } from '../http_api';

const cellFormatter = value => (
  <TableCell style={{ cursor: 'default' }} className={value.style_class}>
    {value.value}
  </TableCell>
);

cellFormatter.propTypes = {
  value: PropTypes.shape({
    value: PropTypes.node,
    style_class: PropTypes.string,
  }),
};

cellFormatter.defaultProps = {
  value: null,
};

const makeColumn = (name, label, index) => ({
  property: name,
  header: {
    label,
    props: {
      index,
      rowSpan: 1,
      colSpan: 1,
    },
    customFormatters: [sortableHeaderCellFormatter],
  },
  cell: {
    props: {
      index: 1,
    },
    formatters: [cellFormatter],
  },
});

const makeFilterColumn = (name, title, _index) => ({
  id: name,
  title: title,
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

const parseReportColumns = reportData => reportData
  .report.col_order.map((item, index) => ({
    name: item,
    title: reportData.report.headers[index],
  }));

const parseReportRows = reportData => reportData
  .result_set.map((item, index) => ({
    id: index,
    ...item,
  }));

const reduceLoadedData = (state, action) => {
  const columns = parseReportColumns(action.data);

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
    filter
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

const filterToString = filter => (
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

  API.get(`/api/results/${reportResultId}?\
expand_value_format=true&\
hash_attribute=result_set&\
sort_by=${sortBy}&sort_order=${sortDirection}&\
limit=${limit}&offset=${offset}${filterString}`).then((data) => {
    dispatch({
      type: 'dataLoaded',
      data,
      sortingColumns,
      pagination,
      activeFilters,
    });

    miqSparkleOff();
  });
};

const ReportDataTable = (props) => {
  const { perPageDefault, perPageOptions } = props;
  const initState = {
    ...initialState,
    pagination: {
      page: 1,
      perPage: perPageDefault,
      perPageOptions,
    },
  };

  const [state, dispatch] = useReducer(reducer, initState);

  useEffect(() => fetchReportPage(dispatch, props.reportResultId, state.sortingColumns, state.pagination), []);

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

  // Until the API is available for multi-field filtereing there's only one filter,
  // so removing a single filter removes all of them.
  const renderActiveFilters = () => (
    <React.Fragment>
      <Filter.ActiveLabel>{__('Active Filters:')}</Filter.ActiveLabel>
      <Filter.List>
        {state.activeFilters.map(item => (
          <Filter.Item
            key={item.field}
            onRemove={fetchNoFilters}
            filterData={item}
          >
            {`${item.title}: ${item.string}`}
          </Filter.Item>
        ))}
      </Filter.List>
      <a
        href="#"
        onClick={(e) => {
          fetchNoFilters();
          e.preventDefault();
        }}
      >
        {__('Clear All Filters')}
      </a>
    </React.Fragment>
  );


  const setPage = page => fetchReportPage(
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

  const onSort = (e, column, sortDirection) => fetchReportPage(
    dispatch,
    props.reportResultId,
    {
      [column.property]: {
        direction:
          sortDirection === TABLE_SORT_DIRECTION.ASC
            ? TABLE_SORT_DIRECTION.DESC
            : TABLE_SORT_DIRECTION.ASC,
        position: 0,
      },
    },
    state.pagination,
    state.activeFilters,
  );

  const filterTypeSelected = field => dispatch({
    type: 'filterTypeSelected',
    field: field && field.id,
    title: field && field.title,
  });

  const filterTextUpdate = event => dispatch({
    type: 'filterTextUpdate',
    string: event.target.value,
  });

  const filterKeyPress = (keyEvent) => {
    if (keyEvent.key === 'Enter') {
      // Navigate to page 1 when searching.
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
      keyEvent.stopPropagation();
      keyEvent.preventDefault();
    }
  };

  const filterColumn = filterColumns.find(c => c.id === (state.filter && state.filter.field)) || filterColumns[0];

  return (
    <React.Fragment>
      <div className="row toolbar-pf table-view-pf-toolbar report-toolbar">
        <form className="col-xs-12 col-md-6">
          <Form.InputGroup>
            <Filter.TypeSelector
              filterTypes={filterColumns}
              currentFilterType={filterColumn}
              onFilterTypeSelected={filterTypeSelected}
            />
            <FormControl
              type="text"
              value={state.filter && state.filter.text}
              placeholder={__('search text')}
              onChange={filterTextUpdate}
              onKeyPress={filterKeyPress}
            />
          </Form.InputGroup>
        </form>
        {state.activeFilters && state.activeFilters.length > 0 && (
          <div className="col-xs-12 toolbar-pf-results">
            {renderActiveFilters()}
          </div>)}
      </div>
      {state.total > 0 && (
        <React.Fragment>
          <Table.PfProvider
            striped
            bordered
            hover
            dataTable
            columns={columns}
            components={{
              header: {
                // Enables pf-react's custom header formatters extensions to reactabular.
                cell: cellProps => customHeaderFormattersDefinition({
                  cellProps,
                  columns,
                  sortingColumns: state.sortingColumns,
                  rows: state.rows,
                  onSort,
                }),
              },
            }}
          >
            <Table.Header headerRows={resolve.headerRows({ columns })} />
            <Table.Body rows={state.rows} rowKey="id" />
          </Table.PfProvider>
          <Paginator
            viewType={PAGINATION_VIEW.TABLE}
            pagination={state.pagination}
            itemCount={state.total}
            onPageSet={setPage}
            onPerPageSelect={perPageSelect}
          />
        </React.Fragment>)}
      {state.total === 0 && (
        <EmptyState className="report-empty-state">
          <EmptyState.Title>{ __('No records found') }</EmptyState.Title>
        </EmptyState>)}
    </React.Fragment>
  );
};

ReportDataTable.propTypes = {
  reportResultId: PropTypes.number.isRequired,
  perPageOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  perPageDefault: PropTypes.number.isRequired,
};

export default ReportDataTable;
