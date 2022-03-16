import createBackupSchema from './create-backup.schema';
import restoreFromBackupSchema from './restore-from-backup.schema';

/** Variable which holds the 'type' props used in CloudVolumeBackup component. */
export const CloudVolumeActionTypes = {
  CREATE_BACKUP: 'create_backup',
  RESTORE_FROM_BACKUP: 'restore_from_backup',
};

/** Function to get the options needed for the drop-down field present in cloud volume restore form. */
export const cloudVolumeBackupOptions = (backups) => backups.map((item) => ({ label: item.name, value: item.id, key: item.id }));

/** Function to generate the data needed for cloud volume create backup form used in 'backup_new.html.haml'. */
const backupData = (name, recordId) => ({
  type: CloudVolumeActionTypes.CREATE_BACKUP,
  schema: createBackupSchema(),
  cancel: {
    url: `/cloud_volume/show/${recordId}`,
    message: sprintf(__('Backup of Cloud Volume "%s" was canceled by the user.'), name),
  },
  save: {
    action: 'create_backup',
    postUrl: `/api/cloud_volumes/${recordId}`,
    successUrl: `/cloud_volume/show/${recordId}`,
    message: sprintf(__('Cloud volume backup has been successfully queued.')),
  },
});

/** Function to generate the data needed for cloud volume restore from backup form used in 'backup_select.html.haml'. */
const restoreFromBackupData = (name, recordId) => ({
  type: CloudVolumeActionTypes.RESTORE_FROM_BACKUP,
  schema: restoreFromBackupSchema(`/api/cloud_volumes/${recordId}?attributes=cloud_volume_backups`),
  cancel: {
    url: `/cloud_volume/show/${recordId}`,
    message: sprintf(__('Restore from backup of Cloud Volume "%s" was canceled by the user.'), name),
  },
  save: {
    postUrl: `/api/cloud_volumes/${recordId}`,
    successUrl: `/cloud_volume/show/${recordId}`,
    message: sprintf(__('Cloud volume has been successfully restored from backup.')),
    action: 'restore_backup',
  },
});

/** Function to generate the data needed by the form based on type (backup/restore). */
export const formData = (recordId, name, type) => {
  switch (type) {
    case CloudVolumeActionTypes.CREATE_BACKUP:
      return backupData(name, recordId);
    case CloudVolumeActionTypes.RESTORE_FROM_BACKUP:
      return restoreFromBackupData(name, recordId);
    default:
      return undefined;
  }
};
