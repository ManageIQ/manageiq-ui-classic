import { validatorTypes } from '../../forms/data-driven-form';
import validateName from '../../helpers/storage_manager/validate-names';

const createSchema = (fields) => {
  const idx = fields.findIndex((field) => field.name === 'name');

  return ({
    fields: [
      ...(idx === -1 ? fields : [
        ...fields.slice(0, idx),
        {
          ...fields[idx],
          validate: [
            { type: validatorTypes.REQUIRED },
            async(value) => validateName('cloud_volumes', value),
          ],
        },
        ...fields.slice(idx + 1),
      ]),
    ],
  });
};

export default createSchema;
