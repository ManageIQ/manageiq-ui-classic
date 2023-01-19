const validateName = (target, name) => API.get(`/api/${target}?expand=resources&attributes=name`)
  .then(({ resources }) => resources.map((resource) => resource.name))
  .then((results) => (results.includes(name) ? sprintf(__('The name "%s" already exists in "%s"'), name, target) : undefined));

export default validateName;
