export const settingsCompanyCategoriesData = () => {
  const headers = [
    { header: _('Name'), key: 'name' },
    { header: _('Description'), key: 'descripton' },
    { header: _('Show in Console'), key: 'show' },
    { header: _('Single Value'), key: 'single_value' },
    { header: _('Capture C & U Data'), key: 'perf_by_tag' },
    { header: _('Default'), key: 'default' },
    { header: _('Actions'), key: 'actions' },
  ];

  const deleteCategoryButton = (canDelete) => ({
    alt: 'Delete this category',
    disabled: !canDelete,
    is_button: 'true',
    onclick: 'delete_category_link',
    text: _('Delete'),
    kind: 'danger',
    title: !canDelete ? __('Click to delete this category') : __('Category cannot be deleted'),
    className: 'delete_category',
  });

  const comapanyCategoryCellData = (canDelete) => [
    { text: 'category' },
    { text: 'category description' },
    { text: 'show in console' },
    { text: 'false' },
    { text: 'false' },
    { text: 'false' },
    deleteCategoryButton(canDelete),
  ];

  const rows = [
    { id: 100, cells: comapanyCategoryCellData(true) },
    { id: 101, cells: comapanyCategoryCellData(false) },
    { id: 102, cells: comapanyCategoryCellData(false) },
    { id: 103, cells: comapanyCategoryCellData(false) },
  ];

  return { headers, rows, pageTitle: __('My Company Categories') };
};
