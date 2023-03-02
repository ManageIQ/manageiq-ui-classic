export const getProviderInfo = (data) => {
  const providersInfo = data.providers[0];
  let providerStatus = {};

  if (typeof providersInfo[0] === 'undefined') {
    providerStatus = {};
  } else {
    providerStatus = {
      iconImage: providersInfo[0].iconImage,
      largeIcon: true,
      notifications: [
        {
          iconClass: providersInfo[0].statusIcon,
        },
      ],
    };
  }

  return providerStatus;
};

export const getAggStatusInfo = (data, providerId) => {
  const attributes = ['nodes', 'containers', 'registries', 'projects', 'pods', 'services', 'images', 'routes'];
  const attrHsh = {
    nodes: __('Nodes'),
    containers: __('Containers'),
    registries: __('Registries'),
    projects: __('Projects'),
    pods: __('Pods'),
    services: __('Services'),
    images: __('Images'),
    routes: __('Routes'),
  };

  const attrIconHsh = {
    nodes: 'pficon pficon-container-node',
    containers: 'fa fa-cube',
    registries: 'pficon pficon-registry',
    projects: 'pficon pficon-project',
    pods: 'fa fa-cubes',
    services: 'pficon pficon-service',
    images: 'pficon pficon-image',
    routes: 'pficon pficon-route',
  };

  const AggStatus = [];
  attributes.forEach((attribute) => {
    const dataStatus = data.status[attribute];
    AggStatus.push({
      id: `${attribute}_${providerId}`,
      iconClass: attrIconHsh[attribute],
      title: attrHsh[attribute],
      count: dataStatus.count,
      href: dataStatus.href,
    });
  });
  return AggStatus;
};
