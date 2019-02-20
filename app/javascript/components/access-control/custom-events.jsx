import React, { Component, Fragment } from 'react';
import { GenericPreviewTable } from '@manageiq/react-ui-components/dist/table';
import PropTypes from 'prop-types';
import {
  PaginationRow,
  paginate,
  PAGINATION_VIEW,
  Button,
  ButtonGroup,
  Grid,
  Row,
  Col,
} from 'patternfly-react';

const columns = [{
  property: 'button_name',
  label: 'Button Name',
}, {
  property: 'automate_entry_point',
  label: 'Automate Entry point',
}, {
  property: 'username',
  label: 'Username',
}, {
  property: 'created_on',
  label: 'Created On',
}, {
  property: 'message',
  label: 'Message',
}];

class CustomEvents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pagination: {
        page: 1,
        perPage: 10,
        perPageOptions: [5, 10, 20, 50, 100, 1000],
      },
      pageChangeValue: 1,
      sortableColumnPropery: null,
      sortOrderAsc: true,
    };
  }

   onPerPageSelect = perPage =>
     this.setState(({ pagination }) =>
       ({ pagination: { ...pagination, perPage, page: 1 }, pageChangeValue: 1 }));

  onNextPage = () =>
    this.setState(({ pagination }) => ({
      pagination: { ...pagination, page: pagination.page + 1 },
      pageChangeValue: pagination.page + 1,
    }));

  onPreviousPage = () =>
    this.setState(({ pagination }) => ({
      pagination: { ...pagination, page: pagination.page - 1 },
      pageChangeValue: pagination.page - 1,
    }));

  onLastPage = () => this.setState(({ pagination }) => ({
    pagination: { ...pagination, page: this.totalPages(this.props.events, pagination.perPage) },
    pageChangeValue: this.totalPages(this.props.events, pagination.perPage),
  }));

   handlePageInputChange = (value) => {
     const page = Number(value);
     if (!Number.isNaN(value) && value !== '' && page > 0 && page <= this.totalPages(this.props.events, this.state.pagination.perPage)) {
       this.setState(prevState =>
         ({ pagination: { ...prevState.pagination, page }, pageChangeValue: page }));
     }
   }

   totalPages = (rows, perPage) => Math.ceil(rows.length / perPage);

   handleSortColumn = property => this.setState(prevState => ({
     sortableColumnPropery: property,
     sortOrderAsc: prevState.sortableColumnPropery === property ? !prevState.sortOrderAsc : true,
   }));

   sortEvents = (events, asc, property) => {
     if (property) {
       return events.sort((a, b) => {
         if (!a[property]) return true;
         if (!b[property]) return true;
         return asc
           ? a[property].toLowerCase() > b[property].toLowerCase()
           : a[property].toLowerCase() < b[property].toLowerCase();
       });
     }
     return events;
   }

   render() {
     const {
       events,
       onEventClick,
     } = this.props;
     const {
       pagination, pageChangeValue, sortOrderAsc, sortableColumnPropery,
     } = this.state;
     const {
       amountOfPages, itemCount, itemsStart, itemsEnd, rows,
     } = paginate(pagination)(this.sortEvents(events, sortOrderAsc, sortableColumnPropery));
     return (
       <Fragment>
         <h3>Custom Button Events</h3>
         <GenericPreviewTable
           showIcon
           rowClick={() => {}}
           rowSelect={() => {}}
           icon={{ type: 'fa', name: 'star' }}
           columns={columns}
           rows={rows}
           rowKey="id"
         />
         <PaginationRow
           pagination={pagination}
           pageInputValue={pageChangeValue}
           viewType={PAGINATION_VIEW.TABLE}
           amountOfPages={amountOfPages}
           itemCount={itemCount}
           itemsStart={itemsStart}
           itemsEnd={itemsEnd}
           onPerPageSelect={this.onPerPageSelect}
           onPreviousPage={this.onPreviousPage}
           onNextPage={this.onNextPage}
           onFirstPage={() => this.setState(({ pagination }) =>
             ({ pagination: { ...pagination, page: 1 }, pageChangeValue: 1 }))}
           onLastPage={this.onLastPage}
           onPageInput={({ target: { value } }) => this.setState({ pageChangeValue: value })}
           onSubmit={() => this.handlePageInputChange(pageChangeValue)}
         />
         <div style={{ marginTop: 8 }}>
           <Button className="pull-right" onClick={() => onEventClick('user-info')}>Back</Button>
         </div>
       </Fragment>
     );
   }
}

CustomEvents.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CustomEvents;
