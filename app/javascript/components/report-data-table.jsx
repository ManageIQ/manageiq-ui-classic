import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import * as resolve from 'table-resolver';
import {
  customHeaderFormattersDefinition,
  Filter,
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
  <TableCell className={value.style_class}>
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

const makeFilterColumn = (name, label, _index) => ({
  id: name,
  title: label,
  placeholder: sprintf(__('Filter by %s'), label),
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
    label: reportData.report.headers[index],
  }));

const parseReportRows = reportData => reportData
  .result_set.map((item, index) => ({
    id: index,
    ...item,
  }));

const processLoadedData = (state, action) => {
  const columns = parseReportColumns(action.data);
  const filter = { ...state.filter };
  if (!filter.field) {
    filter.field = columns[0] && columns[0].name;
  }

  return {
    ...state,
    loading: false,
    filter,
    columns,
    rows: parseReportRows(action.data),
    total: action.data.count,
    sortingColumns: action.sortingColumns,
    pagination: action.pagination,
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'loadedData':
      return processLoadedData(state, action);
    case 'filterSelected':
      return {
        ...state,
        filter: {
          string: state.filter && state.filter.string,
          field: action.field,
        },
      };
    case 'filterTextUpdate':
      return {
        ...state,
        filter: {
          string: action.string,
          field: state.filter && state.filter.field,
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

const fetchReportPage = (dispatch, reportResultId, sortingColumns, pagination, filter = {}) => {
  const { sortBy, sortDirection } = sortColumnAndDirection(sortingColumns);
  const limit = pagination.perPage;
  const offset = pagination.perPage * (pagination.page - 1);

  miqSparkleOn();

  const filterString = (filter && filter.field && filter.string)
    ? `&filter_column=${filter.field}&filter_string=${encodeURIComponent(filter.string)}`
    : '';

  API.get(`/api/results/${reportResultId}?\
expand_value_format=true&\
hash_attribute=result_set&\
sort_by=${sortBy}&sort_order=${sortDirection}&\
limit=${limit}&offset=${offset}${filterString}`).then((data) => {
    dispatch({
      type: 'loadedData',
      data,
      sortingColumns,
      pagination,
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

  const columns = state.columns.map((item, index) => makeColumn(item.name, item.label, index));
  const filterColumns = state.columns.map((item, index) => makeFilterColumn(item.name, item.label, index));

  const setPage = page => fetchReportPage(
    dispatch,
    props.reportResultId,
    state.sortingColumns,
    {
      ...state.pagination,
      page,
    },
    state.filter,
  );

  const perPageSelect = (perPage, _e) => {
    const newPagination = {
      ...state.pagination,
      perPage,
      page: 1,
    };
    fetchReportPage(dispatch, props.reportResultId, state.sortingColumns, newPagination, state.filter);
  };

  const onSort = (e, column, sortDirection) => {
    const newSortingColumns = {
      [column.property]: {
        direction:
          sortDirection === TABLE_SORT_DIRECTION.ASC
            ? TABLE_SORT_DIRECTION.DESC
            : TABLE_SORT_DIRECTION.ASC,
        position: 0,
      },
    };

    fetchReportPage(dispatch, props.reportResultId, newSortingColumns, state.pagination, state.filter);
  };

  const filterTypeSelected = field => dispatch({
    type: 'filterSelected',
    field: field && field.id,
  });

  const filterTextUpdate = event => dispatch({
    type: 'filterTextUpdate',
    string: event.target.value,
  });

  const filterKeyPress = (keyEvent) => {
    if (keyEvent.key === 'Enter') {
      fetchReportPage(dispatch, props.reportResultId, state.sortingColumns, state.pagination, state.filter);
      keyEvent.stopPropagation();
      keyEvent.preventDefault();
    }
  };

  const filterColumn = filterColumns.find(c => c.id === (state.filter && state.filter.field)) || filterColumns[0];

  return (
    <React.Fragment>
      <div className="row toolbar-pf table-view-pf-toolbar">
        <form className="toolbar-pf-actions">
          <div className="form-group toolbar-pf-filter">
            <Filter>
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
            </Filter>
          </div>
        </form>
      </div>
      <Table.PfProvider
        striped
        bordered
        hover
        dataTable
        columns={columns}
        components={{
          header: {
            // enables our custom header formatters extensions to reactabular
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
    </React.Fragment>
  );
};

ReportDataTable.propTypes = {
  reportResultId: PropTypes.number.isRequired,
  perPageOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  perPageDefault: PropTypes.number.isRequired,
};

export default ReportDataTable;
