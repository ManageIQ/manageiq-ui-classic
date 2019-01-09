import React from 'react';

const List = React.forwardRef(({ id, values = {}, ...rest }, ref) => (
  <select
    ref={ref}
    id={id}
    name={`${id}[]`}
    multiple
    className="form-control"
    style={{ overflowX: 'scroll' }}
    {...rest}
  >
    { Object.entries(values).sort((a, b) => a[1].localeCompare(b[1])).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
  </select>
));

export default List;
