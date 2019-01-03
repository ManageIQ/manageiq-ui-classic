export const isEmpty = (obj) => {
  if (obj === '') { return true; }
  return (Object.getOwnPropertyNames(obj).length === 0);
};

/** *********** HELPERS FOR FORMS *********** */
/* returns left values of dual list select */
export const leftValues = (options, value) => Object.keys(options).filter(key => !value[key]).reduce((acc, curr) => ({
  ...acc,
  [curr]: options[curr],
}), {});

/* returns left submitted keys of dual list select */
export const leftSubmittedKeys = (originalOptions, value) => Object.keys(originalOptions).filter(e => !value[e]);

/* returns new left keys (added to left) of dual list select */
export const addedLeftKeys = (originalOptions, value, originalLeftValues) => (
  leftSubmittedKeys(originalOptions, value).filter(e => !originalLeftValues[e])
);

/* return new right keys (added to right) of dual list select */
export const addedRightKeys = (value, originalRightValues) => Object.keys(value).filter(e => !originalRightValues[e]);
