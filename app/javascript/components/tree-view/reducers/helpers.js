export const nodeCheckedWithDirty = (propNode, value) => {
  let node = { ...propNode };
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
  return node;
};
