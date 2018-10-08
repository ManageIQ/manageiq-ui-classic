import fetchMock from 'fetch-mock';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';
import * as actionTypes from '../action-types';
import * as endpoints from '../endpoints';
import { usersMock, categoriesMock } from './usersMockData';

describe('Rbac user redux actions', () => {
  it('should create loadUsersData action', () => {
    const data = ['foo', 'bar'];
    const expectedAction = {
      type: actionTypes.LOAD_DATA,
      data,
    };
    expect(actions.loadUsersData(data)).toEqual(expectedAction);
  });

  it('should create storeuserGroups action', () => {
    const groups = ['foo, bar'];
    const expectedAction = {
      type: actionTypes.STORE_GROUPS,
      groups,
    };
    expect(actions.storeUserGroups(groups)).toEqual(expectedAction);
  });

  it('should create selectuser action', () => {
    const user = { foo: 'bar' };
    const expectedAction = {
      type: actionTypes.SELECT_USERS,
      selectedUser: user,
    };
    expect(actions.selectUser(user)).toEqual(expectedAction);
  });
});

describe('Rbac user async actions', () => {
  const sucesfullFlashMessage = expect.objectContaining({
    flashId: expect.any(Number),
    type: 'success',
  });
  const routeToRootAction = expect.objectContaining({
    type: '@@router/CALL_HISTORY_METHOD',
    payload: expect.objectContaining({
      args: ['/'],
    }),
  });
  let mockStore;
  let middlewares;
  beforeEach(() => {
    middlewares = [thunk];
    mockStore = configureMockStore(middlewares);
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('requestUsers async action should succes and dispatch correct actions', () => {
    fetchMock
      .getOnce(endpoints.getUsersUrl, {
        resources: [...usersMock],
      });
    const store = mockStore({});
    return store.dispatch(actions.requestUsers()).then(() => {
      const createdActions = store.getActions();
      expect(createdActions).toHaveLength(3);
      expect(createdActions[0]).toEqual({ type: actionTypes.FETCH_DATA });
      const expectedUser = [expect.objectContaining({
        id: '10000000000001',
        current_group: expect.objectContaining({
          label: 'EvmGroup-super_administrator',
        }),
        role: expect.objectContaining({
          label: 'EvmRole-super_administrator',
        }),
        miq_groups: ['10000000000002', '10000000000003', '10000000000008'],
      })];
      expect(createdActions[1]).toEqual(expect.objectContaining({
        type: actionTypes.LOAD_DATA,
        data: expect.objectContaining({
          rows: expect.arrayContaining(expectedUser),
        }),
      }));
      expect(createdActions[2]).toEqual({ type: actionTypes.FETCH_SUCESFULL });
    });
  });

  it('requestUsers should fail', () => {
    fetchMock
      .getOnce(endpoints.getUsersUrl, { status: 500 });
    const store = mockStore({});
    const expectedActions = [{
      type: actionTypes.FETCH_DATA,
    }, {
      type: actionTypes.REQUEST_FAILED,
    }];
    return store.dispatch(actions.requestUsers()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('handleUpdateUsersTree action should succes', () => {
    const store = mockStore({});
    fetchMock
      .getOnce(endpoints.updateMiqUserTreeUrl, ['foo', 'bar']);
    const expectedActions = [{
      type: actionTypes.STORE_USERS_TREE,
      usersTree: ['foo', 'bar'],
    }];
    expect.assertions(1);

    return store.dispatch(actions.handleUpdateUsersTree()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('saveUser action should succes and redirect to index page route', () => {
    const store = mockStore({
      router: {
        location: {},
      },
    });
    fetchMock
      .getOnce(endpoints.updateMiqUserTreeUrl, ['test']);
    fetchMock
      .postOnce(endpoints.modifyUserUrl(), ['foo', 'bar']);
    fetchMock
      .getOnce(endpoints.getUsersUrl, { resources: [...usersMock] });
    const expectedActions = [{
      type: actionTypes.SAVE_USER,
    }, {
      type: actionTypes.FETCH_DATA,
    }, {
      data: {
        rows: expect.any(Array),
      },
      type: actionTypes.LOAD_DATA,
    }, {
      type: actionTypes.FETCH_SUCESFULL,
    }, {
      type: actionTypes.STORE_USERS_TREE,
      usersTree: ['test'],
    }, {
      flashMessage: sucesfullFlashMessage,
      type: actionTypes.ADD_FLASH_MESSAGE,
    }, routeToRootAction,
    ];
    return store.dispatch(actions.saveUser({ foo: 'bar' })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('saveUser action should fail', () => {
    const store = mockStore({
      router: {
        location: {},
      },
    });
    fetchMock
      .postOnce(endpoints.modifyUserUrl(), { status: 500 }, { error: { message: 'foo' } });
    const expectedActions = [{
      type: actionTypes.SAVE_USER,
    }, {
      flashMessage: expect.objectContaining({
        flashId: expect.any(Number),
        type: 'error',
      }),
      type: actionTypes.ADD_FLASH_MESSAGE,
    }];
    return store.dispatch(actions.saveUser({ foo: 'bar' })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('loadTagsCategories should update tag categories', () => {
    const store = mockStore({});
    fetchMock
      .getOnce(endpoints.getTagCategoriesUrl, categoriesMock);
    const expectedActions = [{
      type: actionTypes.STORE_TAG_CATEGORIES,
      categories: expect.arrayContaining(categoriesMock.map(cat => ({
        value: cat.id, label: cat.description, name: cat.name,
      }))),
    }];
    return store.dispatch(actions.loadTagsCategories()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should not request tree data if present in store state', () => {
    const store = mockStore({
      usersReducer: {
        usersTree: [{}],
      },
      router: {
        location: {},
      },
    });
    const userId = 123;
    const expectedActions = [
      expect.objectContaining({
        type: '@@router/CALL_HISTORY_METHOD',
        payload: expect.objectContaining({
          args: [`/preview/${userId}`],
        }),
      }),
    ];
    store.dispatch(actions.rowClicked({ id: userId }));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('should request tree data if not present in store state', () => {
    const store = mockStore({
      usersReducer: {},
      router: {
        location: {},
      },
    });
    const userId = 123;
    fetchMock.getOnce(endpoints.updateMiqUserTreeUrl, [{
      key: `u-${userId}`,
    }]);
    const expectedActions = [
      expect.objectContaining({
        type: '@@router/CALL_HISTORY_METHOD',
        payload: expect.objectContaining({
          args: [`/preview/${userId}`],
        }),
      }), {
        type: actionTypes.STORE_USERS_TREE,
        usersTree: [{
          key: `u-${userId}`,
          state: { selected: true },
        }],
      },
    ];
    return store.dispatch(actions.rowClicked({ id: userId })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('deleteMultipleusers should succes and dispatch correct actions', () => {
    const store = mockStore({});
    fetchMock
      .postOnce(endpoints.modifyUserUrl(), {});
    fetchMock
      .getOnce(endpoints.updateMiqUserTreeUrl, []);
    fetchMock
      .getOnce(endpoints.getUsersUrl, { resources: [] });
    const expectedActions = [{
      type: actionTypes.DELETE_USER,
    }, expect.objectContaining({
      flashMessage: sucesfullFlashMessage,
      type: actionTypes.ADD_FLASH_MESSAGE,
    }), expect.objectContaining({
      flashMessage: sucesfullFlashMessage,
      type: actionTypes.ADD_FLASH_MESSAGE,
    }), {
      type: actionTypes.FETCH_DATA,
    }, {
      type: actionTypes.LOAD_DATA,
      data: { rows: [] },
    }, {
      type: actionTypes.FETCH_SUCESFULL,
    }, expect.objectContaining({
      type: actionTypes.STORE_USERS_TREE,
      usersTree: [],
    })];
    return store.dispatch(actions.deleteMultipleusers([
      { id: 1, miq_groups: [] },
      { id: 2, miq_groups: [] }])).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('deleteMultipleusers should fail', () => {
    const store = mockStore({});
    fetchMock
      .postOnce(endpoints.modifyUserUrl, { status: 500 });
    const expectedActions = [{
      type: actionTypes.DELETE_USER,
    }, {
      type: actionTypes.REQUEST_FAILED,
    }];
    return store.dispatch(actions.deleteMultipleusers([])).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('loadGroups should succes and dispatch correct actions', () => {
    const store = mockStore({});
    fetchMock
      .getOnce(endpoints.getUserGroupsUrl, {
        resources: [{
          description: 'foo',
          id: 'bar',
        }],
      });
    const expectedActions = [{
      type: actionTypes.LOAD_GROUPS,
    }, {
      type: actionTypes.STORE_GROUPS,
      groups: [{
        label: 'foo',
        value: 'bar',
      }],
    }, {
      type: actionTypes.FETCH_SUCESFULL,
    }];
    return store.dispatch(actions.loadGroups()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('loadGroups should fail', () => {
    const store = mockStore({});
    fetchMock
      .getOnce(endpoints.getUserGroupsUrl, { status: 500 });
    const expectedActions = [{
      type: actionTypes.LOAD_GROUPS,
    }, {
      type: actionTypes.REQUEST_FAILED,
    }];
    return store.dispatch(actions.loadGroups()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('editUser should succes and dispatch correct actions', () => {
    const store = mockStore({
      router: {
        location: {},
      },
    });
    const userId = 123;
    fetchMock
      .putOnce(endpoints.modifyUserUrl(123), {});
    fetchMock
      .getOnce(endpoints.updateMiqUserTreeUrl, []);
    fetchMock
      .getOnce(endpoints.getUsersUrl, { resources: [] });
    const expectedActions = [{
      type: actionTypes.EDIT_USER,
    }, {
      type: '@@router/CALL_HISTORY_METHOD',
      payload: expect.objectContaining({
        args: [],
        method: 'goBack',
      }),
    }, expect.objectContaining({
      flashMessage: sucesfullFlashMessage,
      type: actionTypes.ADD_FLASH_MESSAGE,
    }), {
      type: actionTypes.FETCH_DATA,
    }, {
      data: { rows: [] },
      type: actionTypes.LOAD_DATA,
    }, {
      type: actionTypes.FETCH_SUCESFULL,
    }, expect.objectContaining({
      type: actionTypes.STORE_USERS_TREE,
    })];
    return store.dispatch(actions.editUser({}, userId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('editUser should fail', () => {
    const store = mockStore({});
    const userId = 123;
    fetchMock
      .putOnce(endpoints.modifyUserUrl(userId), { status: 500 });
    const expectedActions = [{
      type: actionTypes.EDIT_USER,
    }, {
      type: actionTypes.ADD_FLASH_MESSAGE,
      flashMessage: expect.objectContaining({
        flashId: expect.any(Number),
        text: expect.any(String),
        type: 'error',
      }),
    }];
    return store.dispatch(actions.editUser({}, userId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('deleteUser should succes and dispatch correct actions', () => {
    const userId = 123;
    const store = mockStore({
      router: {
        location: {},
      },
      usersReducer: {
        rows: [{ id: userId, miq_groups: [] }],
      },
    });
    fetchMock
      .deleteOnce(endpoints.modifyUserUrl(userId), {});
    fetchMock
      .getOnce(endpoints.getUsersUrl, { resources: [] });
    fetchMock
      .getOnce(endpoints.updateMiqUserTreeUrl, []);
    const expectedActions = [{
      type: actionTypes.DELETE_USER,
    }, routeToRootAction, expect.objectContaining({
      flashMessage: sucesfullFlashMessage,
      type: actionTypes.ADD_FLASH_MESSAGE,
    }), {
      type: actionTypes.FETCH_DATA,
    }, {
      type: actionTypes.LOAD_DATA,
      data: { rows: [] },
    }, {
      type: actionTypes.FETCH_SUCESFULL,
    }, {
      type: actionTypes.STORE_USERS_TREE,
      usersTree: [],
    }];
    return store.dispatch(actions.deleteUser(userId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('deleteUser should fail', () => {
    const userId = 123;
    const store = mockStore({
      router: {
        location: {},
      },
      usersReducer: {
        rows: [{ id: userId, miq_groups: [] }],
      },
    });
    fetchMock
      .deleteOnce(endpoints.modifyUserUrl(userId), { status: 500 });
    const expectedActions = [{
      type: actionTypes.DELETE_USER,
    }, routeToRootAction,
    {
      type: actionTypes.REQUEST_FAILED,
    }];
    return store.dispatch(actions.deleteUser(userId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('editUserTags should sucess and dispatch correct actions', () => {
    const store = mockStore({
      router: {
        location: {},
      },
    });
    fetchMock
      .post(endpoints.modifyUserUrl(), {});
    const expectedActions = [routeToRootAction, {
      flashMessage: sucesfullFlashMessage,
      type: actionTypes.ADD_FLASH_MESSAGE,
    }];
    return store.dispatch(actions.editUserTags({}, {})).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('editUserTags should fail', () => {
    const store = mockStore({});
    fetchMock
      .postOnce(endpoints.modifyUserUrl(), { status: 500 });
    const expectedActions = [{
      flashMessage: expect.objectContaining({
        flashId: expect.any(Number),
        type: 'error',
      }),
      type: actionTypes.ADD_FLASH_MESSAGE,
    }];
    return store.dispatch(actions.editUserTags({ action: 'unassign_tags' }, { action: 'assign_tags' })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should call user on click events', () => {
    fetchMock
      .getOnce(endpoints.getUsersUrl, {
        resources: [...usersMock],
      });
    const store = mockStore({
      router: { location: {} },
    });
    const selectRbacTreeNode = jest.fn();
    const destroy = jest.fn();
    global.ManageIQ.component.getComponentInstances = () => [{ destroy }];
    global.miqOnClickSelectRbacTreeNode = selectRbacTreeNode;
    return store.dispatch(actions.requestUsers()).then(() => {
      const createdActions = store.getActions();
      const users = createdActions[1].data.rows;
      store.clearActions();
      // test user current group action click
      users[0].current_group.onClick();
      expect(selectRbacTreeNode).toHaveBeenCalledWith(`g-${users[0].current_group.id}`);
      expect(destroy).toHaveBeenCalled();
      expect(store.getActions()).toEqual([routeToRootAction]);

      selectRbacTreeNode.mockClear();
      destroy.mockClear();
      store.clearActions();
      // test user one of group click
      users[0].groups[0].onClick();
      expect(selectRbacTreeNode).toHaveBeenCalledWith(`g-${users[0].groups[0].groupId}`);
      expect(destroy).toHaveBeenCalled();
      expect(store.getActions()).toEqual([routeToRootAction]);

      selectRbacTreeNode.mockClear();
      destroy.mockClear();
      store.clearActions();
      // test user role click
      users[0].role.onClick();
      expect(selectRbacTreeNode).toHaveBeenCalledWith(`ur-${users[0].role.id}`);
      expect(destroy).toHaveBeenCalled();
      expect(store.getActions()).toEqual([routeToRootAction]);
    });
  });
  it('should not navigate to the same pathname', () => {
    const store = mockStore({
      router: {
        location: {
          pathname: '/foo',
        },
      },
    });
    store.dispatch(actions.navigate('/foo'));
    expect(store.getActions()).toEqual([]);
  });
});
