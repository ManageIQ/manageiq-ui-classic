import React from 'react';

import { useFieldApi, useFormApi } from '@@ddf';
import { TrashCan32 } from '@carbon/icons-react';
import { Button } from 'carbon-components-react';

const compare = (array, name) => {
  // eslint-disable-next-line prefer-const
  let indices = [];
  if (array && array.length > 0) {
    array.forEach((value1, index1) => {
      array.forEach((value2, index2) => {
        if (value1 && value2 && (index2 !== index1) && (value1[name] === value2[name])) {
          indices.push(index2);
          indices.push(index1);
        }
      });
    });
  }
  return indices;
};

// custom file edit component that displays the currently saved image and a delete button to replace it
export const FileEditComponent = (props) => {
  const {
    input, label, src, description,
  } = useFieldApi(props);
  const formOptions = useFormApi();

  const deleteFile = () => {
    formOptions.change('image_update', true);
  };

  return (
    <div>
      <label className="bx--label" htmlFor={input.name}>{label}</label>
      <br />
      <div className="edit-div">
        <img className="edit-image" alt={__("Uploaded Image")} id="imageDisplay" src={src} />
        <Button className="edit-button" renderIcon={TrashCan32} iconDescription={description} hasIconOnly onClick={deleteFile} {...input} />
      </div>
    </div>
  );
};

// custom validator that checks to make sure no two attributes/associations/methods have the same name
export const uniqueNameValidator = (values) => {
  const errors = { attributes: [], associations: [], methods: [] };
  let result;

  result = compare(values.attributes, 'attributes_name');
  result.forEach((index) => {
    errors.attributes[index] = { attributes_name: __('Name must be unique') };
  });

  result = compare(values.associations, 'associations_name');
  result.forEach((index) => {
    errors.associations[index] = { associations_name: __('Name must be unique') };
  });

  result = compare(values.methods, 'methods_name');
  result.forEach((index) => {
    errors.methods[index] = { methods_name: __('Name must be unique') };
  });

  return errors;
};
