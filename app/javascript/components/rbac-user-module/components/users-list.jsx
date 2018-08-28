import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { GenericPreviewTable } from '@manageiq/react-ui-components/dist/table';
import { rowClicked, selectUsers } from '../redux/actions';
import { sendDataWithRx } from '../../../miq_observable';

class RbacUsersList extends Component {

  handleSelectUser = (selectedUsers, currentUser) => {
    this.props.selectUsers(selectedUsers);
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

  render() {
    const {
      columns,
      users,
      rowClicked,
    } = this.props;
    return (
      <div>
        <h1>{__('Access Control EVM Users')}</h1>
        <GenericPreviewTable
          rowClick={rowClicked}
          rowSelect={this.handleSelectUser}
          showIcon
          showSelect
          icon={{ type: 'pf', name: 'user' }}
          rowKey="id"
          columns={columns}
          rows={users}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ usersReducer: { rows, columns } }) => ({
  users: rows.map(({ role, current_group, ...rest }) => ({
    role: role.label,
    current_group: current_group.label,
    ...rest,
  })) ,
  columns,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  rowClicked,
  selectUsers,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RbacUsersList);