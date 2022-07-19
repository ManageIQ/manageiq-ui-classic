// eslint-disable-next-line camelcase
const customAttribute = (custom_attributes, name) => {
  const attr = _.find(custom_attributes, { name });
  return (attr && attr.serialized_value) || null;
};

export const getInitialValues = (emsId, recordId, isTemplate, setState) => {
  const parentOptions = [];
  // Get VM Parent Options and filter out current VM
  API.get(`/api/vms/?filter[]=ems_id=${emsId}&expand=resources`)
    .then(({ resources }) => resources.filter((vm) => vm.id !== `${recordId}`))
    // Get valid VM Parent Options and format them for select component
    .then((vmParentOptions) => vmParentOptions.forEach((vm) => {
      parentOptions.push({ label: `${vm.name} -- ${vm.location}`, value: `${vm.id},${vm.template}` });
    }))
    // Get Template Parent Options and filter out current template
    .then(() => API.get(`/api/templates/?filter[]=ems_id=${emsId}&expand=resources`))
    .then(({ resources }) => resources.filter((template) => template.id !== `${recordId}`))
    // Get valid Template Parent Options and format them for select component
    .then((templateParentOptions) => templateParentOptions.forEach((template) => {
      parentOptions.push({ label: `${template.name} -- ${template.location}`, value: `${template.id},${template.template}` });
    }))
    // Get initial values for the form
    .then(() => {
      let url;
      if (!isTemplate) {
        url = `/api/vms/${recordId}?attributes=child_resources,parent_resource,custom_attributes`;
      } else {
        url = `/api/templates/${recordId}?attributes=child_resources,parent_resource,custom_attributes`;
      }
      API.get(url).then((data) => {
        let parentResource = null;
        if (data.parent_resource) {
          parentResource = `${data.parent_resource.id},${data.parent_resource.template}`;
        }
        const childResources = [];
        data.child_resources.forEach((childVm) => {
          childResources.push(`${childVm.id},${childVm.template}`);
        });
        const initialValues = {
          name: data.name,
          custom_1: customAttribute(data.custom_attributes, 'custom_1'),
          description: data.description,
          parent_vm: parentResource,
          child_vms: childResources,
        };
        setState({
          initialValues,
          parentOptions,
          isLoading: false,
        });
      });
    });
};

export const getNoEmsInitialValues = (recordId, isTemplate, setState) => {
  let url;
  if (!isTemplate) {
    url = `/api/vms/${recordId}?attributes=child_resources,parent_resource,custom_attributes`;
  } else {
    url = `/api/templates/${recordId}?attributes=child_resources,parent_resource,custom_attributes`;
  }
  API.get(url).then((data) => {
    const initialValues = {
      name: data.name,
      custom_1: customAttribute(data.custom_attributes, 'custom_1'),
      description: data.description,
      parent_vm: null,
      child_vms: [],
    };
    setState({
      initialValues,
      parentOptions: [],
      isLoading: false,
    });
  });
};

export const getSubmitData = (values) => {
  let customIdentifier = '';
  let description = '';
  let parentResource = null;
  const childResources = [];

  if (values.custom_1) {
    customIdentifier = values.custom_1;
  }

  if (values.description) {
    description = values.description;
  }

  if (values.parent_vm) {
    const [id, isTemplate] = values.parent_vm.split(',');
    if (isTemplate === 'true') {
      parentResource = { href: `/api/templates/${id}` };
    } else {
      parentResource = { href: `/api/vms/${id}` };
    }
  }

  if (values.child_vms) {
    values.child_vms.forEach((child) => {
      const [id, isTemplate] = child.split(',');
      if (isTemplate === 'true') {
        childResources.push({ href: `/api/templates/${id}` });
      } else {
        childResources.push({ href: `/api/vms/${id}` });
      }
    });
  }
  const data = {
    action: 'edit',
    resource: {
      custom_1: customIdentifier,
      description,
      parent_resource: parentResource,
      child_resources: childResources,
    },
  };
  return data;
};
