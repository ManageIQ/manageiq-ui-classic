/* *********** HELPERS FOR FORMS *********** */

/* Get keys of options array
  Options:
    [
      {key: 'key', label: 'label'},
      {key: 'key1', label: 'label1'},
    ]
  returns ['key', 'key1']
*/
export const getKeys = value => (Array.isArray(value) ? value.map(({ key }) => key) : []);

/* Returns array of options excluding value options */
export const filterOptions = (options, value) => options.filter(({ key }) => !getKeys(value).includes(key));

/* Returns array of newly added options from left select */
export const addedLeftValues = (originalOptions, value, originalLeftValues) => (
  filterOptions(filterOptions(originalOptions, value), originalLeftValues)
);
