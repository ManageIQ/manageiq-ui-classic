import { validatorTypes } from '@@ddf';
import YAML from 'yaml';

const createSchema = () => ({
  fields: [
    {
      component: 'code-editor',
      id: 'settings',
      name: 'settings',
      mode: 'yaml',
      label: '',
      hideLabel: true,
      validate: [
        { type: validatorTypes.REQUIRED },
        (value) => {
          try {
            YAML.parse(value);
          } catch (err) {
            return err.message;
          }
          return undefined;
        },
      ],
    },
  ],
});

export default createSchema;
