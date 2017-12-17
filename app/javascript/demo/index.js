import store from './store';
import * as counterAction from './actions/counter';

ManageIQ.redux = {};
ManageIQ.redux.store = store;

// render the current state to the screen.
const valueEl = document.getElementById('reduxDemo');

const render = () => {
  valueEl.innerHTML = store.getState().counter.toString();
};

render();

// re-render on any store change
store.subscribe(render);

store.dispatch(counterAction.increment());
store.dispatch(counterAction.increment());
store.dispatch(counterAction.decrement());
