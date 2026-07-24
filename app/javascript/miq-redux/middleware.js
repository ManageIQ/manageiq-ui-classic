import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { TOGGLE_TAG_VALUE_CHANGE, DELETE_ASSIGNED_TAG } from '../tagging/actions/actions';

/** Redux middleware that forwards ROUTER_NAVIGATE actions to the history object. */
const createRouterMiddleware = (history) => (_store) => (next) => (action) => {
  if (action.type === '@@router/NAVIGATE') {
    const { method, args } = action.payload;
    history[method](...args);
  }
  return next(action);
};

/** Labels used to identify if the status selected item from state. */
export const tagLabels = {
  added: 'added',
  removed: 'removed',
  changed: 'changed',
  noChange: 'noChange',
};

/** Function to identify the unique selected 'item' from 2 arrays.
 * Also returns if the 'status' of the selected item from the oldData */
export const changedTag = (newData, oldData) => {
  const oldMap = new Map(oldData.map((item) => [item.id, item]));
  const newMap = new Map(newData.map((item) => [item.id, item]));

  const addedOrChanged = newData.find((item) =>
    !oldMap.has(item.id) || oldMap.get(item.id).description !== item.description);

  if (addedOrChanged) {
    const status = oldMap.has(addedOrChanged.id) ? tagLabels.changed : tagLabels.added;
    return { status, item: addedOrChanged };
  }

  const removed = oldData.find((item) => !newMap.has(item.id));
  if (removed) {
    return { status: tagLabels.removed, item: removed };
  }

  return { status: tagLabels.noChange, item: null };
};

export const taggingMiddleware = (store) => (next) => (action) => {
  let selected;

  const { type, meta, tag } = action;
  if (meta && meta.url) {
    const { assignedTags } = store.getState().tagging.appState;
    const assignedTag = assignedTags ? assignedTags.find((item) => item.id === tag.tagCategory.id) : undefined;
    if (assignedTag) {
      selected = (type === TOGGLE_TAG_VALUE_CHANGE)
        ? changedTag(tag.tagValue, assignedTag.values)
        : { status: tagLabels.removed, item: tag.tagValue };
    } else {
      selected = { status: tagLabels.added, item: tag.tagValue[0] };
    }

    let params = meta.params(meta.type, store.getState(), tag, selected && selected.item ? selected.item.id : undefined);
    if (type === TOGGLE_TAG_VALUE_CHANGE) {
      if (selected.status === tagLabels.added) {
        $.post({ url: meta.url, data: JSON.stringify(params), contentType: 'application/json' });
      } else if (selected?.item) {
        params = meta.onDelete(meta.type, params, selected.item.id)();
        $.post({ url: meta.url, data: JSON.stringify(params), contentType: 'application/json' });
      }
    } else if (type === DELETE_ASSIGNED_TAG) {
      params = meta.onDelete(meta.type, params, tag.tagValue.id)();
      $.post({ url: meta.url, data: JSON.stringify(params), contentType: 'application/json' });
    }
  }
  return next(action);
};

export default (history) => [
  createRouterMiddleware(history),
  taggingMiddleware,
  thunk,
  promiseMiddleware(),
];
