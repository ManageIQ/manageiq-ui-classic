// const serviceSelectedVms = {
//   label: __('Selected VM'),
//   keys: ['src_vm_id', 'provision_type', 'linked_clone', 'seal_template'],
// };

// const serviceSelect = {
//   label: __('Select'),
//   keys: ['vm_filter', 'src_vm_id', 'provision_type', 'linked_clone', 'snapshot'],
// };

// const serviceSupportsPxe = {
//   label: __('PXE'),
//   keys: ['pxe_server_id', 'pxe_image_id', 'windows_image_id'],
// };

// const serviceSupportsIso = {
//   label: __('ISO'),
//   keys: ['iso_image_id'],
// };

// const serviceCloudManager = (cloudManager) => ({
//   label: cloudManager ? __('Number of Instances') : __('Number of VMs'),
//   keys: ['number_of_vms'],
// });

// const serviceNaming = {
//   label: __('Naming'),
//   keys: ['vm_name', 'vm_description', 'vm_prefix'],
// };

// export const serviceKeys = (item) => {
//   const serviceData = [];
//   serviceData.push(item.isOvirtInfraManager ? serviceSelectedVms : serviceSelect);
//   if (item.supportsPxe) serviceData.push(serviceSupportsPxe);
//   if (item.supportsIso) serviceData.push(serviceSupportsIso);
//   serviceData.push(serviceCloudManager(item.cloudManager));
//   serviceData.push(serviceNaming);
//   return serviceData;
// };
