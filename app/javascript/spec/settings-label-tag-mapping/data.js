export const settingsLabelTagMappingData = () => {
  const headers = [
    { header: __('Resource Entity'), key: 'resource_entity' },
    { header: __('Resource Label'), key: 'resource_label' },
    { header: __('Tag Category'), key: 'tag_category' },
    { header: __('Actions'), key: 'actions' },
  ];

  const deleteSettingsLabelTagCellButton = {
    alt: 'Delete this mapping',
    is_button: 'true',
    onclick: 'delete_category_link',
    text: __('Delete'),
    kind: 'danger',
    title: __('Click to delete this mapping'),
    className: 'delete_category',
  };

  const settingsLabelTagCellData = [
    { text: 'resource name' },
    { text: 'resource label' },
    { text: 'category' },
    deleteSettingsLabelTagCellButton,
  ];

  const rows = [
    { id: 100, cells: settingsLabelTagCellData },
    { id: 101, cells: settingsLabelTagCellData },
    { id: 102, cells: settingsLabelTagCellData },
    { id: 103, cells: settingsLabelTagCellData },
  ];

  return { headers, rows };
};
