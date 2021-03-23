import { componentTypes } from '@@ddf';

const createSchema = () => {
  return ({
    fields: [
      {
        component: componentTypes.SELECT,
        name: 'pxe_image_type_id',
        id: 'pxe_image_type_id',
        label: __('Type'),
        placeholder: __('<Choose>'),
        includeEmpty: true,
        loadOptions: () => API.get(`/api/pxe_image_types?attributes=name,id&expand=resources`).then(({ resources }) =>
          resources.map(({ id, name }) => ({ value: id, label: name }))),
      },
    ],
  });
};

export default createSchema;