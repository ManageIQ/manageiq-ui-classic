import restoreSchema from './cloud-volume-backup-form.schema';

/** Function to get the options needed for the drop-down field present in cloud volume restore form. */
export const cloudVolumeBackupOptions = (backups) => backups.map((item) => ({ label: item.name, value: item.id, key: item.id }));

/** Function to generate the data needed for cloud volume restore form used in 'volume_select.html.haml'. */
export const restoreData = (name, recordId, options) => ({
  type: 'restore',
  schema: restoreSchema(options),
  cancel: {
    url: `/cloud_volume/show/${recordId}`,
    message: sprintf(__('Restore of Cloud Volume "%s" was canceled by the user.'), name),
  },
  save: {
    postUrl: `/api/cloud_volume_backups/${recordId}`,
    successUrl: `/cloud_volume/show/`,
    message: sprintf(__('Restoring Cloud Volume "%s" from backup'), name),
    action: 'restore_to_volume',
  },
});
