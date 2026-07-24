import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Provider } from 'react-redux';

export default (ReactElement, mapPropsToInteract = () => undefined) => {
  const roots = new WeakMap();

  function render(props, container) {
    let root = roots.get(container);
    if (!root) {
      root = createRoot(container);
      roots.set(container, root);
    }
    // Currently, the async render vs layout calculation race condition has only been
    // observed in HAML forms that embed React components (e.g. Edit Catalog Item).
    // This flushSync wrapper ensures synchronous rendering as a compatibility workaround
    // and can likely be removed once these types of forms are fully converted to React
    flushSync(() => {
      root.render(
        <Provider store={ManageIQ.redux.store}>
          <ReactElement {...props} />
        </Provider>
      );
    });
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
};
