export const onClickTree = (controllerName, item) => (
  window.miqCheckForChanges()
    ? sendDataWithRx({ breadcrumbSelect: { path: `/${controllerName}/tree_select`, key: item.key } }) : null
);

export const onClick = (e) => {
  if (!window.miqCheckForChanges()) {
    e.preventDefault();
  }
};
