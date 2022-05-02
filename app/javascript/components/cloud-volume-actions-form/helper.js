import createBackupSchema from './create-backup.schema';
import restoreFromBackupSchema from './restore-from-backup.schema';
import createSnapshotSchema from './create-snapshot.schema';

/** Variable which holds the 'type' props used in CloudVolumeBackup component. */
export const CloudVolumeActionTypes = {
  CREATE_BACKUP: 'create_backup',
  CREATE_SNAPSHOT: 'create_snapshot',
  RESTORE_FROM_BACKUP: 'restore_from_backup',
};

/** Function to get the options needed for the drop-down field present in cloud volume restore form. */
export const cloudVolumeBackupOptions = (backups) => backups.map((item) => ({ label: item.name, value: item.id, key: item.id }));

/** Function to extract the error message. */
export const handleError = (error) => {
  // Cannot be parsed to JSON due to error in message data.
  const cleared = error.message.replace(/[^a-zA-Z :]/g, '');
  return cleared.includes('message:')
    ? cleared.substring(cleared.indexOf('message:') + 9, cleared.lastIndexOf(':cookies'))
    : error.message;
};

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
    action: 'restore_backup',
    postUrl: `/api/cloud_volumes/${recordId}`,
    successUrl: `/cloud_volume/show/${recordId}`,
    message: sprintf(__('Cloud volume has been successfully restored from backup.')),
  },
});

/** Function to generate the data needed for cloud volume create backup form used in 'snapshot_new.html.haml'. */
const snapshotData = (name, recordId) => ({
  type: CloudVolumeActionTypes.CREATE_SNAPSHOT,
  schema: createSnapshotSchema(),
  cancel: {
    url: `/cloud_volume/show/${recordId}`,
    message: sprintf(__('Snapshot for Cloud Volume "%s" was canceled by the user.'), name),
  },
  save: {
    action: 'create',
    postUrl: `/api/cloud_volumes/${recordId}/cloud_volume_snapshots`,
    successUrl: `/cloud_volume/show/${recordId}`,
    message: sprintf(__('Snapshot for Cloud Volume "%s" created'), name),
  },
});

/** Function to generate the data needed by the form based on type (backup/restore). */
export const formData = (recordId, name, type) => {
  switch (type) {
    case CloudVolumeActionTypes.CREATE_BACKUP:
      return backupData(name, recordId);
    case CloudVolumeActionTypes.RESTORE_FROM_BACKUP:
      return restoreFromBackupData(name, recordId);
    case CloudVolumeActionTypes.CREATE_SNAPSHOT:
      return snapshotData(name, recordId);
    default:
      return undefined;
  }
};
