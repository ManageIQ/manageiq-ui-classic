import { isEqual } from 'lodash';

export const checkValidState = (formOptions, secretKey) => {
  const { values } = formOptions.getState();
  const cleanValues = { ...values };
  delete cleanValues[secretKey];
  return isEqual(cleanValues, formOptions.getState().initialValues);
};
