import usersReducer from '../users-reducer';
import * as actionTypes from '../action-types';
import usersColumns from '../users-table-columns';

describe('Users reducer', () => {
  let columns;
  const testPayload = [{
    id: 1,
    label: 'foo',
  }, {
    id: 2,
    label: 'bar',
  }, {
    id: 3,
    label: 'pedro',
  }];
  const selectedUsersMock = [{
    label: 'foo',
    id: 'bar',
  }];
  beforeAll(() => {
    columns = [...usersColumns];
  });

  it('should return initial state', () => {
    expect(usersReducer(undefined, {})).toEqual({
      isLoaded: false,
      isFetching: false,
      isValid: true,
      flashMessages: [],
      columns,
      userCustomEvents: {},
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
    const actionPayload = testPayload;
    const initialState = {};
    const expectedState = { categories: [...actionPayload] };
    expect(usersReducer(initialState, {
      type: actionTypes.STORE_TAG_CATEGORIES,
      categories: [...actionPayload],
    })).toEqual(expectedState);
  });

  it('should store users tree', () => {
    const actionPayload = testPayload;
    const initialState = {};
    const expectedState = { usersTree: [...actionPayload] };
    expect(usersReducer(initialState, {
      type: actionTypes.STORE_USERS_TREE,
      usersTree: [...actionPayload],
    })).toEqual(expectedState);
  });

  it('should store users groups', () => {
    const actionPayload = testPayload;
    const initialState = {};
    const expectedState = { groups: [...actionPayload] };
    expect(usersReducer(initialState, {
      type: actionTypes.STORE_GROUPS,
      groups: [...actionPayload],
    })).toEqual(expectedState);
  });

  it('should reset selected users to undefined', () => {
    const initialState = { selectedUsers: selectedUsersMock };
    const expectedState = { selectedUsers: undefined };
    expect(usersReducer(initialState, {
      type: actionTypes.RESET_SELECTED_USERS,
    })).toEqual(expectedState);
  });

  it('should reset selected users to action payload', () => {
    const initialState = { selectedUsers: selectedUsersMock };
    const expectedState = { selectedUsers: [1, 2, 3] };
    expect(usersReducer(initialState, {
      type: actionTypes.RESET_SELECTED_USERS,
      selectedUsers: [1, 2, 3],
    })).toEqual(expectedState);
  });

  it('should add user to selected users', () => {
    const initialState = { selectedUsers: selectedUsersMock };
    const expectedState = {
      selectedUsers: [...selectedUsersMock, { id: 'new user', selected: true }],
    };
    expect(usersReducer(initialState, {
      type: actionTypes.SELECT_USERS,
      selectedUser: { id: 'new user', selected: true },
    })).toEqual(expectedState);
  });

  it('should remove user to selected users', () => {
    const initialState = { selectedUsers: [...selectedUsersMock, { id: 'new user' }] };
    const expectedState = { selectedUsers: selectedUsersMock };
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
