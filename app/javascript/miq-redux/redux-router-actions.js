import { history } from '../miq-component/react-history.js';

const createReduxRoutingActions = ({ dispatch }) => ({
  push: (where) => dispatch({ type: '@@router/NAVIGATE', payload: { method: 'push', args: [where] } }),
  replace: (where) => dispatch({ type: '@@router/NAVIGATE', payload: { method: 'replace', args: [where] } }),
  go: (howMany) => dispatch({ type: '@@router/NAVIGATE', payload: { method: 'go', args: [howMany] } }),
  goBack: () => dispatch({ type: '@@router/NAVIGATE', payload: { method: 'go', args: [-1] } }),
  goForward: () => dispatch({ type: '@@router/NAVIGATE', payload: { method: 'go', args: [1] } }),
});

export default createReduxRoutingActions;
