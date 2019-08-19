export const onClickTree = (e, controllerName, { key, title }) => {
  if (window.miqCheckForChanges()) {
    const id = encodeURIComponent(key.split('__')[0]);
    const text = encodeURIComponent(title);
    const url = `/${controllerName}/tree_select?id=${id}&text=${text}`;
    miqAjax(url, null, { beforeSend: true });
  } else {
    e.preventDefault();
  }
};

export const onClick = (e) => {
  if (!window.miqCheckForChanges()) {
    e.preventDefault();
  }
};
