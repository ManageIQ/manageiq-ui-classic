import { AppState } from '../packs/miq-redux';

const asdf = 'INIT_NEW_PROVIDER_HAWKULAR'
function initNewProvider(state, action): AppState {
    return {...state, data: action.payload.data};
}

export const providerReducers = {
    [asdf]: initNewProvider
}