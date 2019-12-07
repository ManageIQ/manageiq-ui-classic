import React from 'react';

// Automate requires a `dialog_param_` prefix for each dialog field
const normalizeParams = params => Object.keys(params).reduce(
  (obj, key) => ({
    ...obj,
    [`dialog_param_${key}`]: params[key],
  }), {},
);

const PlayerFieldSelect = (Component) => {
  const fn = ({ dynamic, resourceAction, loadValuesOnInit, ...props }) => {
    const { formOptions: { getState } } = props;

    if (dynamic && loadValuesOnInit) {
      API.post('/api/service_dialogs/7', {
        action: 'load_dynamic_values',
        resource: {
          attributes: normalizeParams(getState().values),
          ...resourceAction,
        },
      }).then(console.log);
    }

    return <Component {...props} />;
  };

  return fn;
};

export default PlayerFieldSelect;
