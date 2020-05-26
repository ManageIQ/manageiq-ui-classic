import React, { createElement } from 'react';
/**
 * Mocks FieldProvider for custom data driven form fields
 */
export const FieldProviderComponent = ({
  input,
  render,
  meta,
  component,
  children,
  ...rest
}) => {
  const fieldInput = {
    ...input,
    onChange: (value) => {
      if (input.onChange) {
        input.onChange(value);
      }
      if (rest.validate) {
        rest.validate(value);
      }
    },
  };
  const fieldMeta = {
    ...meta,
  };

  if (typeof children === 'function') {
    return children({ ...rest, input: fieldInput, meta: fieldMeta });
  }

  if (typeof component === 'object') {
    return createElement(component, {
      ...rest, input: fieldInput, meta: fieldMeta, children,
    });
  }

  if (typeof component === 'function') {
    const Component = component;
    return <Component {...rest} input={fieldInput} meta={fieldMeta}>{children}</Component>;
  }

  return render({
    ...rest, input: fieldInput, meta: fieldMeta, children,
  });
};
