import { componentTypes, validatorTypes } from '@@ddf';

const formatSubnets = (interfaces) => {
  let interfaceOptions = [];
  if (interfaces) {
    interfaceOptions = Object.entries(interfaces);
    interfaceOptions = interfaceOptions.map((value) => (
      { label: value[0], value: value[1] }
    ));
  }
  interfaceOptions.unshift({ label: __('<Choose>'), value: undefined });
  return interfaceOptions;
};

const createSchema = (interfaces, add) => ({
  fields: [
    ...(add ? [
      {
        component: componentTypes.SELECT,
        id: 'addInterface',
        name: 'interface',
        label: __('Add Interface'),
        options: formatSubnets(interfaces),
        validate: [{ type: validatorTypes.REQUIRED }],
        isRequired: true,
      }]
      : [{
        component: componentTypes.SELECT,
        id: 'removeInterface',
        name: 'interface',
        label: __('Remove Interface'),
        options: formatSubnets(interfaces),
        validate: [{ type: validatorTypes.REQUIRED }],
        isRequired: true,
      }]
    ),
  ],
});

export default createSchema;
