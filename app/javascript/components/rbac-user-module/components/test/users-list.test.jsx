import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import { Table } from 'patternfly-react';
import UsersList, { RbacUsersList } from '../users-list';
import { usersMock, columns } from '../../redux/test/usersMockData';

describe('Users list component', () => {
  const mockStore = configureStore();
  let store;
  let userActionMock;
  let initialProps;
  beforeEach(() => {
    userActionMock = jest.fn();
    store = mockStore({
      usersReducer: {
        rows: usersMock.map(item => ({
          ...item,
          current_group: {
            label: item.current_group.description,
            id: item.current_group.id,
            onClick: userActionMock,
          },
          role: {
            label: item.current_group.miq_user_role.name,
            id: item.current_group.miq_user_role.id,
            onClick: userActionMock,
          },
          miq_groups: item.miq_groups.map(group => group.id),
          groups: item.miq_groups.map(group => ({
            label: group.description,
            icon: 'group',
            groupId: group.id,
            value: group.id,
            onClick: userActionMock,
          })),
        })),
        columns: [...columns],
      },
    });
    initialProps = {
      columns: [],
      users: [],
      selectedUsers: [],
      resetSelectedUsers: jest.fn(),
      rowClicked: jest.fn(),
      selectUser: jest.fn(),
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<UsersList store={store} />).dive();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should change number of items per page in table', () => {
    const wrapper = mount(<RbacUsersList {...initialProps} />);
    wrapper.instance().onPerPageSelect(44);
    expect(wrapper.state().pagination.perPage).toEqual(44);
  });

  it('should change pagination to next page', () => {
    const wrapper = mount(<RbacUsersList {...initialProps} />);
    wrapper.instance().onNextPage();
    expect(wrapper.state().pagination.page).toEqual(2);
  });

  it('should change pagination to previouse page', () => {
    const wrapper = mount(<RbacUsersList {...initialProps} />);
    wrapper.instance().onPreviousPage();
    expect(wrapper.state().pagination.page).toEqual(0);
  });

  it('should change pagination to last possible page', () => {
    const wrapper = mount(<RbacUsersList
      {...initialProps}
      users={[{
        id: 1,
        }, {
          id: 2,
        }, {
          id: 3,
        }, {
          id: 4,
        }, {
          id: 5,
        }, {
          id: 6,
        }, {
          id: 7,
        }, {
          id: 8,
        }, {
          id: 9,
        }, {
          id: 10,
        }, {
          id: 11,
        }, {
          id: 12,
        },
      ]}
    />);
    wrapper.instance().onPerPageSelect(2);
    wrapper.update();
    wrapper.instance().onLastPage();
    wrapper.update();
    expect(wrapper.state().pagination.page).toEqual(6);
  });

  it('should reset selecte users on mount', () => {
    const resetSelectedUsers = jest.fn();
    mount(<RbacUsersList {...initialProps} resetSelectedUsers={resetSelectedUsers} />);
    expect(resetSelectedUsers).toHaveBeenCalled();
  });

  it('should cal select user on table row click', () => {
    const selectUser = jest.fn();
    const wrapper = mount(<RbacUsersList {...initialProps} users={[{ id: 1, name: 'Should select this user' }]} selectUser={selectUser} />);
    wrapper.instance().handleSelectUser([], { foo: 'foo' });
    expect(selectUser).toHaveBeenCalledWith({ foo: 'foo' });
  });

  it('should change page number on input change', () => {
    const wrapper = mount(<RbacUsersList
      {...initialProps}
      users={[{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]}
    />);
    const input = wrapper.find('input.pagination-pf-page');
    input.simulate('change', { target: { value: 2 } });
    wrapper.update();
    expect(wrapper.state().pageChangeValue).toEqual(2);
    wrapper.setState(prevState => ({ pagination: { ...prevState.pagination, perPage: 1 } }));
    wrapper.instance().handlePageInputChange(wrapper.state().pageChangeValue);
    wrapper.update();
    expect(wrapper.state().pagination.page).toEqual(2);
  });

  it('should set column sorting options', () => {
    const wrapper = mount(<RbacUsersList {...initialProps} />);
    wrapper.instance().handleSortColumn('foo');
    expect(wrapper.state().sortableColumnPropery).toEqual('foo');
    wrapper.instance().handleSortColumn('foo');
    expect(wrapper.state().sortableColumnPropery).toEqual('foo');
    expect(wrapper.state().sortOrderAsc).toEqual(false);
  });

  it('should sort users by given propery', () => {
    const property = 'name';
    const rows = [{ name: 'x' }, { name: 'a' }, { name: 't' }, { name: 'z' }];
    const wrapper = mount(<RbacUsersList {...initialProps} />);
    expect(wrapper.instance().sortUsers(rows, true, property)).toEqual([{ name: 'a' }, { name: 't' }, { name: 'x' }, { name: 'z' }]);
  });
});
