const validateName = (target, name, isEditMode) => {
  if (!isEditMode) {
    return API.get(`/api/${target}?expand=resources&attributes=name`)
      .then(({ resources }) => resources.map((resource) => resource.name))
      .then((results) => (results.includes(name) ? sprintf(__('The name "%s" already exists in "%s"'), name, target) : undefined));
  }
  return undefined;
};

export default validateName;
