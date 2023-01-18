/** Function to return the data for the select box available in the sumary */
const selectBoxData = (category, options) => ({
  input: 'dropdown',
  props: {
    action: 'settingsTagCategoryOnChange',
    items: options,
    label: __('Category'),
    selectedItem: category.description,
  },
});

/** Function to restructure the data for the select category */
const categorySelected = ({ category }) => ({ description: category.description, id: category.id });

/** Function to return the data needed for summary */
const categorySummary = ({ category }, options) => ({
  mode: 'settings_tags_basic_information',
  rows: [
    { label: __('Category'), value: selectBoxData(category, options) },
    { label: __('Long Description'), value: category.example_text },
    { label: __('Show in Console'), value: category.show },
  ],
});

/** Function which returns the data for the headers in the list */
const categoryListHeaders = () => [
  { header: __('Name'), key: 'name' },
  { header: __('Description'), key: 'descripton' },
  { header: __('Actions'), key: 'actions' },
];
const deleteEntryButton = () => {
  const data = {
    alt: __('Delete this entry'),
    is_button: true,
    callback: 'deleteEntryCallback',
    text: __('Delete'),
    kind: 'danger',
    title: __('Click to delete this entry'),
    buttonClassName: 'delete_entry',
  };
  return data;
};

/** Function which returns the data for the rows in the list */
const categoryListRows = (entries) => entries.map((entry) => ({
  id: entry.id.toString(),
  clickable: true,
  cells: [
    { text: entry.name },
    { text: entry.description },
    deleteEntryButton(),
  ],
}));

/** Function which restructure and returns the data needed for the list */
const categoryList = ({ entries }) => ({
  headers: categoryListHeaders(),
  rows: categoryListRows(entries),
});

/** Function to return the all category options from the URL for select box available in summary */
export const categoryOptions = (categories) => categories.map((item) => (
  {
    label: item.description,
    value: item.name,
    key: `category_${item.id}`,
    id: item.id,
  }
));

export const pageData = (categoryResponse, options) => {
  const summary = categorySummary(categoryResponse, options);
  const list = categoryList(categoryResponse);
  const selectedCategory = categorySelected(categoryResponse);
  return { summary, list, selectedCategory };
};
