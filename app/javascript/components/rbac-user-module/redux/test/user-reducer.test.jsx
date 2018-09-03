import usersReducer from '../users-reducer';
import * as actionTypes from '../action-types';

describe('Users reducer', () => {
  let columns;
  beforeAll(() => {
    columns = [{
      property: 'name',
      label: 'Full Name',
    }, {
      property: 'userid',
      label: 'Username',
    }, {
      property: 'email',
      label: 'E-mail',
    }, {
      property: 'current_group',
      label: 'Current Group',
    }, {
      property: 'role',
      label: 'Role',
    }, {
      property: 'lastlogon',
      label: 'Last Logon',
    }, {
      property: 'lastlogoff',
      label: 'Last Logoff',
    }];
  });

  it('should return initial state', () => {
    expect(usersReducer(undefined, {})).toEqual({
      isLoaded: false,
      isFetching: false,
      isValid: true,
      flashMessages: [],
      columns,
    });
  });

  it('should remove flash messages', () => {
    const initialState = {
      flashMessages: [{
        flashId: 555,
      }],
    };
    const expectedState = { flashMessages: [] };
    expect(usersReducer(initialState, {
      type: actionTypes.REMOVE_FLASH_MESSAGE,
      flashMessage: { flashId: 555 },
    })).toEqual(expectedState);
  });

  it('should add flash message', () => {
    const initialState = {
      flashMessages: [],
    };
    const expectedState = {
      flashMessages: [{ flashId: 555 }],
    };
    expect(usersReducer(initialState, {
      type: actionTypes.ADD_FLASH_MESSAGE,
      flashMessage: { flashId: 555 },
    })).toEqual(expectedState);
  });

  it('should store tag categories', () => {
    const actionPayload = [{
      id: 1,
      label: 'foo',
    }, {
      id: 2,
      label: 'bar',
    }, {
      id: 3,
      label: 'pedro',
    }];
    const initialState = {};
    const expectedState = { categories: [...actionPayload] };
    expect(usersReducer(initialState, {
      type: actionTypes.STORE_TAG_CATEGORIES,
      categories: [...actionPayload],
    })).toEqual(expectedState);
  });

  it('should store users tree', () => {
    const actionPayload = [{
      id: 1,
      label: 'foo',
    }, {
      id: 2,
      label: 'bar',
    }, {
      id: 3,
      label: 'pedro',
    }];
    const initialState = {};
    const expectedState = { usersTree: [...actionPayload] };
    expect(usersReducer(initialState, {
      type: actionTypes.STORE_USERS_TREE,
      usersTree: [...actionPayload],
    })).toEqual(expectedState);
  });

  it('should store users groups', () => {
    const actionPayload = [{
      id: 1,
      label: 'foo',
    }, {
      id: 2,
      label: 'bar',
    }, {
      id: 3,
      label: 'pedro',
    }];
    const initialState = {};
    const expectedState = { groups: [...actionPayload] };
    expect(usersReducer(initialState, {
      type: actionTypes.STORE_GROUPS,
      groups: [...actionPayload],
    })).toEqual(expectedState);
  });

  it('should reset sected users to undefined', () => {
    const initialState = {
      selectedUsers: [{
        label: 'foo',
        id: 'bar',
      }],
    };
    const expectedState = { selectedUsers: undefined };
    expect(usersReducer(initialState, {
      type: actionTypes.RESET_SELECTED_USERS,
    })).toEqual(expectedState);
  });

  it('should reset sected users to action payload', () => {
    const initialState = {
      selectedUsers: [{
        label: 'foo',
        id: 'bar',
      }],
    };
    const expectedState = { selectedUsers: [1, 2, 3] };
    expect(usersReducer(initialState, {
      type: actionTypes.RESET_SELECTED_USERS,
      selectedUsers: [1, 2, 3],
    })).toEqual(expectedState);
  });

  it('should add user to selected users', () => {
    const initialState = {
      selectedUsers: [{ id: 'foo' }, { id: 'bar' }],
    };
    const expectedState = {
      selectedUsers: [{ id: 'foo' }, { id: 'bar' }, { id: 'new user', selected: true }],
    };
    expect(usersReducer(initialState, {
      type: actionTypes.SELECT_USERS,
      selectedUser: { id: 'new user', selected: true },
    })).toEqual(expectedState);
  });

  it('should remove user to selected users', () => {
    const initialState = {
      selectedUsers: [{ id: 'foo' }, { id: 'bar' }, { id: 'new user' }],
    };
    const expectedState = {
      selectedUsers: [{ id: 'foo' }, { id: 'bar' }],
    };
    expect(usersReducer(initialState, {
      type: actionTypes.SELECT_USERS,
      selectedUser: { id: 'new user', selected: false },
    })).toEqual(expectedState);
  });

  it('should store users data', () => {
    const initialState = {
      isLoaded: false,
      isFetching: false,
      isValid: true,
      flashMessages: [],
      columns,
    };
    const payload = {
      data: {
        rows: [{ id: 1 }, { id: 2 }, { id: 3 }],
      },
    };
    const expectedState = {
      isLoaded: true,
      isFetching: false,
      isValid: true,
      flashMessages: [],
      columns,
      rows: [{ id: 1 }, { id: 2 }, { id: 3 }],
    };
    expect(usersReducer(initialState, {
      type: actionTypes.LOAD_DATA,
      ...payload,
    })).toEqual(expectedState);
  });

  it('should set fething to false', () => {
    let initialState = { isFetching: false };
    let expectedState = { isFetching: true };
    expect(usersReducer(initialState, {
      type: actionTypes.SAVE_USER,
    })).toEqual(expectedState);

    initialState = { isFetching: false };
    expectedState = { isFetching: true };
    expect(usersReducer(initialState, {
      type: actionTypes.FETCH_DATA,
    })).toEqual(expectedState);
  });

  it('should set isValid to true', () => {
    const initialState = { isValid: false, isFetching: true };
    const expectedState = { isValid: true, isFetching: false };
    expect(usersReducer(initialState, {
      type: actionTypes.FETCH_SUCESFULL,
    })).toEqual(expectedState);
  });

  it('should set isValid to false', () => {
    const initialState = { isValid: true, isFetching: true };
    const expectedState = { isValid: false, isFetching: false };
    expect(usersReducer(initialState, {
      type: actionTypes.REQUEST_FAILED,
    })).toEqual(expectedState);
  });
});
