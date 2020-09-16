import { parseCondition, validatorMapper } from '@data-driven-forms/react-form-renderer';

const conditionalValidator = fn => ({ condition, ...schema }) => (value, allValues, meta) => (
  !condition || parseCondition(condition, allValues).result ? fn(schema)(value, allValues, meta) : undefined
);

const mapper = Object.keys(validatorMapper).reduce((obj, key) => ({
  ...obj,
  [key]: conditionalValidator(validatorMapper[key]),
}), {});

export default mapper;
