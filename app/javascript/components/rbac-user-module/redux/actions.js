import { push } from 'connected-react-router';
import * as actionTypes from './action-types';
import * as endpoints from './endpoints';
import { API, http } from '../../../http_api';

const { sendDataWithRx } = window;

export const navigate = where => (dispatch, getState) => {
  const { pathname } = getState().router.location;
  if (pathname !== where) {
    dispatch(push(where));
  }
};

export const loadUsersData = data => ({
  type: actionTypes.LOAD_DATA,
  data,
});

export const storeUserGroups = groups => ({
  type: actionTypes.STORE_GROUPS,
  groups,
});

export const selectUsers = users => ({
  type: actionTypes.SELECT_USERS,
  selectedUsers: users,
});

const fetchData = type => ({
  type,
});

const fetchSucesfull = () => ({
  type: actionTypes.FETCH_SUCESFULL,
});

const fetchFailed = () => ({
  type: actionTypes.REQUEST_FAILED,
});

const storeUsersTree = usersTree => ({
  type: actionTypes.STORE_USERS_TREE,
  usersTree,
}); 

const disableTreeReactRouting = () => sendDataWithRx({ type: 'disable-react-routing' });
const handleUserDetailLinkAction = url => dispatch => {
  disableTreeReactRouting();
  dispatch(navigate('/'));
  miqOnClickSelectRbacTreeNode(url);
  ManageIQ.component.getComponentInstances('RbacModule')[0].destroy();
}

export const requestUsers = () => (dispatch) => {
  dispatch(fetchData(actionTypes.FETCH_DATA));
  return API.get(endpoints.getUsersUrl)
    .then(data => data.resources.map(item => ({
      ...item,
      current_group: {
        label: item.current_group.description,
        onClick: () => dispatch(handleUserDetailLinkAction(`g-${item.current_group.id}`)),
      },
      role: {
        label: item.current_group.miq_user_role.name,
        onClick: () => dispatch(handleUserDetailLinkAction(`ur-${item.current_group.miq_user_role.id}`)),
      },
      miq_groups: item.miq_groups.map(group => group.id),
      groups: item.miq_groups.map(group => ({
        label: group.description,
        icon: 'group',
        groupId: group.id,
        value: group.id,
        onClick: () => dispatch(handleUserDetailLinkAction(`g-${group.id}`)),
      })),
    })))
    .then(data => dispatch(loadUsersData({ rows: data })))
    .then(() => dispatch(fetchSucesfull()))
    .catch(() => dispatch(fetchFailed()));
};

export const handleUpdateUsersTree = () => dispatch =>
  http.get(endpoints.updateMiqUserTreeUrl)
    .then((response) => {
      sendDataWithRx({
        updateTreeNode: {
          tree: 'rbac_tree',
          key: 'xx-u',
          data: {
            nodes: [...response],
          },
        },
      });
      return dispatch(storeUsersTree(response));
    });

export const saveUser = user => (dispatch) => {
  dispatch(fetchData(actionTypes.SAVE_USER));
  return API.post(endpoints.modifyUserUrl(), user, { skipErrors: [400] })
    .then(
      () => dispatch(requestUsers()),
      (error) => { throw error })
    .then(() => dispatch(handleUpdateUsersTree()))
    .then(() => dispatch(createFlashMessage(sprintf(__('User "%s" was saved'), user.name), 'success')))
    .then(() => dispatch(navigate('/')))
    .catch((error) => {
      dispatch(createFlashMessage(error.data.error.message, 'error'));
      dispatch(fetchFailed);
    });
};

export const deleteUser = userId => (dispatch, getState) => {
  dispatch(fetchData(actionTypes.DELETE_USER));
  dispatch(navigate('/'));
  const name = getState().usersReducer.rows.find(({ id }) => id === userId);
  return API.delete(endpoints.modifyUserUrl(userId))
    .then(() => dispatch(createFlashMessage(sprintf(__('User "%s" was deleted'), name), 'success')))
    .then(() => dispatch(requestUsers()))
    .then(() => dispatch(handleUpdateUsersTree()))
    .catch((error) => {
      dispatch(fetchFailed());
      console.log(error);
    });
};

export const editUser = (user, userId) => (dispatch) => {
  dispatch(fetchData(actionTypes.EDIT_USER));
  return API.put(endpoints.modifyUserUrl(userId), user)
    .then(
      () => dispatch(navigate('/')),
      (err) => { throw err; },
    )
    .then(() => dispatch(createFlashMessage(sprintf(__('User "%s" was saved'), user.name), 'success')))
    .then(() => dispatch(requestUsers()))
    .then(() => dispatch(handleUpdateUsersTree()))
    .catch(() => dispatch(fetchFailed()));
};

export const loadGroups = () => (dispatch) => {
  dispatch(fetchData(actionTypes.LOAD_GROUPS));
  return API.get(endpoints.getUserGroupsUrl)
    .then(data => data.resources, (error) => { throw error; })
    .then(groups => groups.map(group => ({
      label: group.description,
      value: group.id,
    })))
    .then(groups => dispatch(storeUserGroups(groups)))
    .then(() => dispatch(fetchSucesfull()))
    .catch(() => dispatch(fetchFailed()));
};

const resetSelectedToolbarItems = () => sendDataWithRx({
  eventType: 'updateToolbarCount',
  countSelected: 0,
});

export const deleteMultipleusers = users => (dispatch) => {
  dispatch(fetchData(actionTypes.DELETE_USER));
  return API.post(endpoints.modifyUserUrl(), {
    action: 'delete',
    resources: users.map(user => ({ id: user.id })),
  })
    .then(() => users.map(({ name }) => dispatch(createFlashMessage(sprintf(__('User "%s" was deleted'), name), 'success'))))
    .then(
    () => dispatch(requestUsers()),
    (error) => { throw error; },
  )
    .then(() => dispatch(handleUpdateUsersTree()))
    .then(() => {
      resetSelectedToolbarItems();
      return dispatch(fetchSucesfull);
    })
    .catch(() => dispatch(fetchFailed()));
};

const sendTreeUpdate = (data) => {
  sendDataWithRx({
    updateTreeNode: {
      tree: 'rbac_tree',
      key: 'xx-u',
      data: {
        state: { selected: false },
        nodes: [...data],
      },
    },
  });
};

const markActiveUser = (users, key) => users.map(user => ({
  ...user,
  state: { selected: user.key === key },
}));

export const rowClicked = row => (dispatch, getState) => {
  const userKey = `u-${row.id}`;
  const tree = getState().usersReducer.usersTree;
  dispatch(navigate(`/preview/${row.id}`));
  if (!tree) {
    return http.get(endpoints.updateMiqUserTreeUrl)
      .then(users => markActiveUser(users, userKey))
      .then((data) => {
        dispatch(storeUsersTree(data));
        return data;
      })
      .then(data => sendTreeUpdate(data));
  }
  return sendTreeUpdate(markActiveUser(tree, userKey));
};

const storeTagCategories = categories => ({
  type: actionTypes.STORE_TAG_CATEGORIES,
  categories,
});
export const loadTagsCategories = () => dispatch => http.get(endpoints.getTagCategoriesUrl)
  .then(data => data.map(category =>
    ({ value: category.id, label: category.description, name: category.name })))
  .then(categories => categories.sort((a, b) => a.label.localeCompare(b.label)))
  .then(categories => dispatch(storeTagCategories(categories)));
/**
 * export const editUserTags = ({ unAssignPayloads, assignPayloads }) => (dispatch) => {
  dispatch(fetchData('update tags'));
  if (unAssignPayloads && unAssignPayloads.length > 0) {
    return Promise.all(unAssignPayloads.map(({ id, ...rest }) =>
      API.post(endpoints.updateUserTagsUrl(id), rest)))
      .then(() => { // eslint-disable-line
        if (assignPayloads && assignPayloads.length > 0) {
          return Promise.all(assignPayloads.map(({ id, ...rest }) =>
            API.post(endpoints.updateUserTagsUrl(id), rest)));
        }
      })
      .then(() => dispatch(requestUsers()))
      .then(() => dispatch(navigate('/')))
      .then(() => dispatch(fetchSucesfull));
  }
  if (assignPayloads && assignPayloads.length > 0) {
    return Promise.all(assignPayloads.map(({ id, ...rest }) =>
      API.post(endpoints.updateUserTagsUrl(id), rest)))
      .then(() => dispatch(requestUsers()))
      .then(() => dispatch(navigate('/')))
      .then(() => dispatch(fetchSucesfull));
  }
  return (dispatch(fetchFailed));
};
*/

export const createFlashMessage = (text, type) => ({
  type: actionTypes.ADD_FLASH_MESSAGE,
  flashMessage: {
    text,
    type,
    flashId: Date.now(),
  }
})

export const removeFlashMessage = flashMessage => ({
  type: actionTypes.REMOVE_FLASH_MESSAGE,
  flashMessage,
})
