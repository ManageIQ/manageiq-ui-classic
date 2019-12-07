import React, { useState, useEffect } from 'react';
import { componentTypes } from '@data-driven-forms/react-form-renderer';
import { formFieldsMapper } from '@data-driven-forms/pf3-component-mapper';

import { API } from '../../http_api';

const Component = formFieldsMapper[componentTypes.SELECT];
const url = id => `/api/categories/${id}`;

const mapOptions = ({ resources }) => resources.map(({ id: value, categorization: { description: label } }) => ({ label, value }));
const requestOptions = categoryId => API.get(`${url(categoryId)}/tags?expand=resources&attributes=categorization`).then(mapOptions);

const mapSingleValue = ({ single_value: singleValue }) => singleValue;
const requestSingleValue = categoryId => API.get(`${url(categoryId)}?attributes=single_value`).then(mapSingleValue);

export const RawTagControl = ({ categoryId, forceSingleValue, ...props }) => {
  const [{ multi, loadOptions }, setState] = useState({
    multi: !forceSingleValue,
    loadOptions: () => new Promise(() => undefined),
  });

  useEffect(() => {
    let isSubscribed = true;

    if (categoryId) {
      const singleValuePromise = forceSingleValue ? new Promise(resolve => resolve(true)) : requestSingleValue(categoryId);

      singleValuePromise.then((singleValue) => {
        if (isSubscribed) {
          setState({
            multi: !singleValue,
            loadOptions: () => requestOptions(categoryId),
          });
        }
      });
    }

    return () => { isSubscribed = false; };
  }, [categoryId, forceSingleValue]);

  return <Component multi={multi} loadOptions={loadOptions} {...props} />;
};

const TagControl = ({ FieldProvider, ...rest }) => <FieldProvider {...rest} component={RawTagControl} />;

export default TagControl;
