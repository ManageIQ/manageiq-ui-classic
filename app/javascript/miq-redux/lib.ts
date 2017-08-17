export function addReducer(reducer) {
    return ManageIQ.redux.addReducer(reducer);
}

export function getStore() {
    return ManageIQ.redux.store;
}

export function applyReducerHash(reducers, state, action) {
    return ManageIQ.redux.applyReducerHash(reducers, state, action);
}
