import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import * as resolve from 'table-resolver';

import {
  customHeaderFormattersDefinition,
  Paginator,
  PAGINATION_VIEW,
  sortableHeaderCellFormatter,
  tableCellFormatter,
  Table,
  TABLE_SORT_DIRECTION,
} from 'patternfly-react';

import { cleanVirtualDom } from '../miq-component/helpers';

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
    formatters: [tableCellFormatter],
  },
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

const reducer = (state, action) => {
  switch (action.type) {
    case 'loadedData':
      return {
        ...state,
        loading: false,
        total: action.data.count,
        columns: parseReportColumns(action.data),
        rows: parseReportRows(action.data),
        sortingColumns: action.sortingColumns,
        pagination: action.pagination,
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
  pagination: {
    page: 1,
    perPage: 25,
    perPageOptions: [25, 50, 100],
  },
};

const fetchReportPage = (dispatch, reportResultId, sortingColumns, pagination) => {
  const { sortBy, sortDirection } = sortColumnAndDirection(sortingColumns);
  const limit = pagination.perPage;
  const offset = pagination.perPage * (pagination.page - 1);

  miqSparkleOn();

  API.get(`/api/results/${reportResultId}?\
hash_attribute=result_set&\
sort_by=${sortBy}&sort_order=${sortDirection}&\
limit=${limit}&offset=${offset}`).then((data) => {
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
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => fetchReportPage(dispatch, props.reportResultId, state.sortingColumns, state.pagination), []);

  const columns = state.columns.map((item, index) => makeColumn(item.name, item.label, index));

  const setPage = page => fetchReportPage(
    dispatch,
    props.reportResultId,
    state.sortingColumns,
    {
      ...state.pagination,
      page,
    },
  );

  const perPageSelect = (perPage, _e) => {
    const newPagination = {
      ...state.pagination,
      perPage,
      page: 1,
    };
    fetchReportPage(dispatch, props.reportResultId, state.sortingColumns, newPagination);
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

    fetchReportPage(dispatch, props.reportResultId, newSortingColumns, state.pagination);
  };

  return (
    <React.Fragment>
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
};

export default ReportDataTable;
