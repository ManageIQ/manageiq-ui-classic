import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

export default (ReactElement, mapPropsToInteract = () => undefined) => {
  const roots = new WeakMap();

  function render(props, container) {
    let root = roots.get(container);
    if (!root) {
      root = createRoot(container);
      roots.set(container, root);
    }
    root.render(
      <Provider store={ManageIQ.redux.store}>
        <ReactElement {...props} />
      </Provider>
    );
  }

  return {
    create(props, mountTo) {
      render(props, mountTo);
      return { interact: mapPropsToInteract(props), elementId: mountTo.id };
    },

    update(newProps, mountedTo) {
      render(newProps, mountedTo);
    },

    destroy(instance, unmountFrom) {
      const root = roots.get(unmountFrom);
      if (root) {
        root.unmount();
        roots.delete(unmountFrom);
      }
    },

    component: ReactElement,
  };
}
