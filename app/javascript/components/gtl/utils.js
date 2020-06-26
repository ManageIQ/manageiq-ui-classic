import * as React from 'react';
import PropTypes from 'prop-types';

import {
  Paginator,
  PaginationRow,
  PAGINATION_VIEW,
  Toolbar,
} from 'patternfly-react';

// overriding this here, to make per page drop down open downwards,
// pf-react paginator component has a bug, it doesnt pass this value to PaginationRow component
PaginationRow.defaultProps.pageSizeDropUp = false;

export const renderDataTableToolbar = () => {
  return (
    <Toolbar
    // onClick={onClick}
    // onViewClick={onViewClick}
    />
  );
};

// fixme: Grid view paginator has sorting!
export const renderPagination = ({
  pagination,
  total,
  onPageSet,
  onPerPageSelect,
}) => (
  <Paginator
    viewType={PAGINATION_VIEW.TABLE}
    pagination={pagination}
    itemCount={total}
    onPageSet={onPageSet}
    onPerPageSelect={onPerPageSelect}
  />
);

renderPagination.propTypes = {
  pagination: PropTypes.shape({
    page: PropTypes.number,
    perPage: PropTypes.number,
    perPageOptions: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  total: PropTypes.number.isRequired,
  onPageSet: PropTypes.func.isRequired,
  onPerPageSelect: PropTypes.func.isRequired,
};

