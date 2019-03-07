import { isEqual } from 'lodash';

export const checkValidState = (formOptions, secretKey) => {
  const { values } = formOptions.getState();
  const cleanValues = Object.keys(values).reduce((acc, curr) => ({
    ...acc,
    [curr]: values[curr] === '' ? undefined : values[curr],
  }), {});
  delete cleanValues[secretKey];
  return isEqual(cleanValues, formOptions.getState().initialValues);
};
