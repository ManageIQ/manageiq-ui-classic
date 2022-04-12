/* eslint-disable camelcase */
import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { cloudVolumeBackupOptions } from './helper';

function restoreFromBackupSchema(optionsUrl) {
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Information'),
    id: 'basic-information',
    name: 'basic-information',
    fields: [
      {
        component: componentTypes.SELECT,
        id: 'backup_id',
        name: 'backup_id',
        label: __('Cloud Volume Backup'),
        placeholder: __('<Choose>'),
        includeEmpty: true,
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        loadOptions: () =>
          API.get(optionsUrl)
            .then(({ cloud_volume_backups }) => cloudVolumeBackupOptions(cloud_volume_backups))
            .catch(() => Promise.resolve([])),
      }],
  }];
  return { fields };
}

export default restoreFromBackupSchema;
