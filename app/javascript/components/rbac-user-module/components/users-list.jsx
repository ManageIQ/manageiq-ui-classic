import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { GenericPreviewTable } from '@manageiq/react-ui-components/dist/table';
import { PaginationRow, paginate, PAGINATION_VIEW } from 'patternfly-react';
import { rowClicked, selectUser, resetSelectedUsers } from '../redux/actions';
import { sendDataWithRx } from '../../../miq_observable';

class RbacUsersList extends Component {
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
    }
  }
  
  componentWillMount() {
    this.props.resetSelectedUsers();
  }
  

  handleSelectUser = (selectedUsers, currentUser) => {
    this.props.selectUser(currentUser);
    sendDataWithRx({
      rowSelect: {
        checked: currentUser.selected,
        selected: currentUser.selected,
        id: currentUser.id,
        long_id: currentUser.id,
        tree_id: `u-${currentUser.id}`,
      },
    });
  }

  totalPages = (rows, perPage) => Math.ceil(rows.length / perPage);

  onPerPageSelect = perPage => this.setState(({ pagination }) => ({ pagination: { ...pagination, perPage, page: 1  }, pageChangeValue: 1 }));
  onNextPage = () => this.setState(({ pagination }) => ({ pagination: { ...pagination, page: pagination.page + 1}, pageChangeValue: pagination.page + 1 }));
  onPreviousPage = () => this.setState(({ pagination }) => ({ pagination: { ...pagination, page: pagination.page - 1}, pageChangeValue: pagination.page - 1 }));
  onLastPage = () => this.setState(({ pagination }) =>({
    pagination: { ...pagination, page: this.totalPages(this.props.users, pagination.perPage) },
    pageChangeValue: this.totalPages(this.props.users, pagination.perPage)
  }));

  handlePageInputChange = value => {
    const page = Number(value);
    if (!Number.isNaN(value) && value !== '' && page > 0 && page <= this.totalPages(this.props.users, this.state.pagination.perPage)) {
      this.setState(prevState => ({ pagination: { ...prevState.pagination, page }, pageChangeValue: page }));
    }
  }

  handleSortColumn = property => this.setState((prevState) => ({
    sortableColumnPropery: property,
    sortOrderAsc: prevState.sortableColumnPropery === property ? !prevState.sortOrderAsc : true
  }));

  sortUsers = (users, asc, property) => {
    if (property) {
      return users.sort((a, b) => {
        if (!a[property]) return true;
        if (!b[property]) return true;
        return asc ? a[property].toLowerCase() > b[property].toLowerCase() : a[property].toLowerCase() < b[property].toLowerCase();
      });
    }
    return users;
  }

  render() {
    const {
      columns,
      users,
      rowClicked,
      selectedUsers,
    } = this.props;
    const { pagination, pageChangeValue, sortOrderAsc, sortableColumnPropery } = this.state;
    const { amountOfPages, itemCount, itemsStart, itemsEnd, rows } = paginate(pagination)(this.sortUsers(users.map(user => ({
      ...user,
      selected: !!selectedUsers.find(({ id }) => id === user.id),
    })), sortOrderAsc, sortableColumnPropery));
    return (
      <div>
        <h1>{__('Access Control EVM Users')}</h1>
        <GenericPreviewTable
          rowClick={rowClicked}
          rowSelect={(rows, lastUser) => this.handleSelectUser(rows.length > 0 ? rows : undefined, lastUser)}
          showIcon
          showSelect
          icon={{ type: 'pf', name: 'user' }}
          rowKey="id"
          columns={columns}
          rows={rows}
          customSort={this.handleSortColumn}
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
          onFirstPage={() => this.setState(({ pagination }) => ({ pagination: {...pagination, page: 1}, pageChangeValue: 1 }))}
          onLastPage={this.onLastPage}
          onPageInput={({ target: { value } }) => this.setState({ pageChangeValue: value })}
          onSubmit={() => this.handlePageInputChange(pageChangeValue)}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ usersReducer: { rows, columns, selectedUsers = [] } }) => ({
  users: rows.map(({ role, current_group, ...rest }) => ({
    role: role.label,
    current_group: current_group.label,
    ...rest,
  })) ,
  columns,
  selectedUsers,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  rowClicked,
  selectUser,
  resetSelectedUsers,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RbacUsersList);