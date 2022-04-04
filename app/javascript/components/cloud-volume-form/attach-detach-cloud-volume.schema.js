import { componentTypes } from '@@ddf';

const createSchema = (isAttach, vmOptions, deviceMountpointRequired) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'vm_id',
      name: 'vm_id',
      label: __('Instance'),
      isRequired: true,
      includeEmpty: true,
      options: vmOptions,
    },
    ...(isAttach ? 
      [{
        component: componentTypes.TEXT_FIELD,
        id: 'device_mountpoint',
        name: 'device_mountpoint',
        label: deviceMountpointRequired ? __('Device Mountpoint') : __('Device Mountpoint (Optional)'),
        isRequired: deviceMountpointRequired,
        // for some reason if filled in it will turn attach to blue???? even when isRequired = false?!?!?
      }] : [ ]
    )
  ],
});

export default createSchema;
