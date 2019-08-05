import { taggingMiddleware } from '../../miq-redux/middleware'; //this is your middleware
// const next = jest.fn(); // middleware needs those as parameters, usually calling next(action) at the end to proceed
// const store = jest.fn();

const params = (type = 'default', state, tag = {}) => ({
  provision: {
    id: "new",
    ids_checked: [],
    tree_typ: 'tags'
  },
  default: {
    id: [],
    cat: tag.tagCategory.id,
    val: tag.tagValue.id,
    check: 1,
    tree_typ: 'tags'
  }
})[type]

const onDelete = (x, y, z) => ({...y, check: 0});

it('passes the intercepted action to next', () => {

  const next = jest.fn(); // middleware needs those as parameters, usually calling next(action) at the end to proceed
  const store = jest.fn();
  const spy = jest.spyOn(window.$, 'post')
  const action = { type: 'ACTION_TYPE', payload: { data: 'test' }}
  taggingMiddleware(store)(next)(action);
  expect(next.mock.calls).toEqual([[{'payload': { data: 'test'}, type: 'ACTION_TYPE'}]]);
  expect(spy.mock.calls).toEqual([]);
});


it('calls post for UI-COMPONENTS_TAGGING_TOGGLE_TAG_VALUE_CHANGE action', () => {

  const next = jest.fn(); // middleware needs those as parameters, usually calling next(action) at the end to proceed
  const spy = jest.spyOn(window.$, 'post')
  const store = {
    getState: () => ({
      tagging: {
        appState: {
          affectedItems: [{}],
          assignedTags: []
        }
      }
    })
  };
  const action = { type: 'UI-COMPONENTS_TAGGING_TOGGLE_TAG_VALUE_CHANGE', meta: { url: 'url/bla', params: params }, tag: {tagCategory: {id: 1}, tagValue: { id:2 }}}
  taggingMiddleware(store)(next)(action);
  expect(next.mock.calls).toEqual( [[{"meta": {"url": "url/bla", "params": params}, "tag": {"tagCategory": {"id": 1}, "tagValue": {"id": 2}}, "type": "UI-COMPONENTS_TAGGING_TOGGLE_TAG_VALUE_CHANGE"}]]);
  expect(spy).toHaveBeenCalledWith({"contentType": "application/json", "data": "{\"id\":[],\"cat\":1,\"val\":2,\"check\":1,\"tree_typ\":\"tags\"}", "url": "url/bla"});
});


it('calls post for UI-COMPONENTS_TAGGING_DELETE_ASSIGNED_TAG action', () => {

  const next = jest.fn(); // middleware needs those as parameters, usually calling next(action) at the end to proceed
  const spy = jest.spyOn(window.$, 'post')
  const store = {
    getState: () => ({
      tagging: {
        appState: {
          affectedItems: [{}]
        }
      }
    })
  };
  const action = { type: 'UI-COMPONENTS_TAGGING_DELETE_ASSIGNED_TAG', meta: { url: 'url/bla', params: params, onDelete: onDelete, type: 'default' }, tag: {tagCategory: {id: 1}, tagValue: { id:2 }}};
  taggingMiddleware(store)(next)(action);
  expect(next.mock.calls).toEqual( [[{"meta": {"url": "url/bla", params: params, onDelete: onDelete, type: 'default'}, "tag": {"tagCategory": {"id": 1}, "tagValue": {"id": 2}}, "type": 'UI-COMPONENTS_TAGGING_DELETE_ASSIGNED_TAG'}]]);
  expect(spy).toHaveBeenCalledWith({"contentType": "application/json", "data": "{\"id\":[],\"cat\":1,\"val\":2,\"check\":0,\"tree_typ\":\"tags\"}", "url": "url/bla"});
});
