export const TREE_CONFIG = {
  aeInlineMethod: {
    url: '/tree/automate_inline_methods',
    selectKey: 'aem',
  },
};

/** Function to find the selected item from the tree data. */
export const findNodeByKey = (array, keyToFind) => {
  const flattenedArray = array.flatMap((item) => [item, ...(item.nodes || [])]);
  const foundNode = flattenedArray.find((item) => item.key === keyToFind);

  return foundNode || flattenedArray
    .filter((item) => item.nodes && item.nodes.length > 0)
    .map((item) => findNodeByKey(item.nodes, keyToFind))
    .find(Boolean);
};

export const selectableItem = (child, selectKey) => child.key.split('-')[0] === selectKey;
