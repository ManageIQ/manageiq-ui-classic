export const diagnosticsOrphanedDataFile = () => {
  const headers = [
    { header: _('Username'), key: 'username' },
    { header: _('Count'), key: 'count' },
    { header: _('Actions'), key: 'actions' },
  ];

  const deleteDataButton = (canDelete) => ({
    alt: 'Delete this data',
    disabled: !canDelete,
    is_button: 'true',
    onclick: 'delete_orphaned_data_link',
    text: _('Delete'),
    kind: 'danger',
    title: !canDelete ? __('Click to delete Orphaned Records for this user') : __('Data cannot be deleted'),
    className: 'delete_data',
  });

  const diagnosticsOrphanedCellData = (canDelete) => [
    { text: 'username' },
    { text: 'count' },
    deleteDataButton(canDelete),
  ];

  const rows = [
    { id: 100, cells: diagnosticsOrphanedCellData(true) },
    { id: 101, cells: diagnosticsOrphanedCellData(false) },
    { id: 102, cells: diagnosticsOrphanedCellData(true) },
    { id: 103, cells: diagnosticsOrphanedCellData(false) },
  ];

  return { headers, rows, pageTitle: __('Orphaned Data') };
};
