import React from 'react';

export const FieldProviderComponent = ({ component, ...props }) => (
  <div>{ component({ input: { name: 'Foo', onChange: jest.fn() }, meta: { error: false, touched: false }, ...props }) }</div>
);
