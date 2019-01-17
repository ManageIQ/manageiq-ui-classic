import React from 'react';

const List = React.forwardRef(({ id, values = [], ...rest }, ref) => (
  <select
    ref={ref}
    id={id}
    name={`${id}[]`}
    multiple
    className="form-control"
    style={{ overflowX: 'scroll' }}
    {...rest}
  >
    {Array.isArray(values)
      && values.sort((a, b) => a.label.localeCompare(b.label)).map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
  </select>
));

export default List;
