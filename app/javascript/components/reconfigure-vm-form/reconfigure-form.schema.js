import { componentTypes } from '@@ddf';
import { reconfigureFormFields } from './reconfigure-form-fields';
import { networkFormFields } from './network-form-fields';
import { diskFormFields } from './disk-form-fields';
import { driveFormFields } from './drive-form-fields';
import { TYPES } from './helpers/general';

export const createSchema = (recordId, data, setData, roles, options, memory, onCellClick, buttonClick) => {
  let formFields;

  switch (data.form.type) {
    case TYPES.DISK:
    case TYPES.RESIZE:
      formFields = diskFormFields(data, roles, options, memory);
      break;
    case TYPES.NETWORK:
    case TYPES.EDITNETWORK:
      formFields = networkFormFields(data, options, roles);
      break;
    case TYPES.DRIVE:
      formFields = driveFormFields(data, options);
      break;
    default:
      formFields = reconfigureFormFields(recordId, roles, memory, data, setData, options, onCellClick, buttonClick);
  }

  const fields = [
    {
      component: componentTypes.SUB_FORM,
      name: 'BasicInformation',
      title: data.form.title,
      className: data.form.className,
      fields: [formFields],
    },
  ];
  return { fields };
};
