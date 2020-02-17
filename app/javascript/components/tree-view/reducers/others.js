export const checkAll = (state, value) => {
  const newState = { ...state };

  Object.entries(newState).forEach(([key, obj]) => {
    if (key) {
      let node = obj;

      // Setting the dirty class (its a copied version from wooden-tree/defaultStore)
      if (!node.state.disabled) {
        if (!Object.hasOwnProperty.call(node.state, 'defaultChecked')) {
          node = {
            ...node,
            state: {
              ...node.state,
              defaultChecked: node.state.checked,
            },
          };
        }
        node = {
          ...node,
          state: { ...node.state, checked: value },
          classes: value !== node.state.defaultChecked ? 'dirty' : undefined,
        };
      }

      newState[key] = node;
    }
  });

  return newState;
};
