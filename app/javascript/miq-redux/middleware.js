import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import promiseMiddleware from 'redux-promise-middleware';

export const taggingMiddleware = store => next => action => {
  const { type, meta, tagCategory, tag } = action;
  if (meta && meta.url) {
    let params = meta.params(meta.type, store.getState(), tag);
    if (type === 'UI-COMPONENTS_TAGGING_TOGGLE_TAG_VALUE_CHANGE') {
      $.post(meta.url, params)
    } else if (type === 'UI-COMPONENTS_TAGGING_DELETE_ASSIGNED_TAG') {
      params = meta.onDelete(meta.type, params, tag.tagValue.id);
      $.post(meta.url, params)
    }
  }
  let result = next(action)
  return result;
}

export default history => [
  routerMiddleware(history),
  taggingMiddleware,
  thunk,
  promiseMiddleware(),
];
