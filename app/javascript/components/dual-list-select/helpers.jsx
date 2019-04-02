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
export const filterOptions = (options, value) => options.filter(({ key }) => !value.includes(key));

/* Returns items from newValue which are not in value */
export const filterValues = (newValue, value) => newValue.filter(item => !value.includes(item));
