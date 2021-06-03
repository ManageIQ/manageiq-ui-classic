import * as React from 'react';
import PropTypes from 'prop-types';
import kebabCase from 'lodash/kebabCase';

import Quaditem from './Quaditem';

const quadSet = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'middle'];

const renderSingle = (item) => {
  // eslint-disable-next-line no-unused-vars
  const { className: _className, ...rest } = item;
  return (
    <div className="single-wrapper">
      <Quaditem {...rest} />
    </div>
  );
};

const renderQuad = (data) => (
  <div className="quad-wrapper">
    {quadSet.filter((key) => data[key]).map((item) => {
      // eslint-disable-next-line no-unused-vars
      const { className: _className, ...rest } = data[item];
      return (<Quaditem key={item} className={kebabCase(item)} {...rest} />);
    })}
  </div>
);

const isQuad = (data) => quadSet.some((quad) => data[quad]);

// eslint-disable-next-line react/destructuring-assignment
const Quadicon = (props) => (<div className="miq-quadicon">{isQuad(props.data) ? renderQuad(props.data) : renderSingle(props.data)}</div>);
export default Quadicon;

Quadicon.propTypes = {
  // eslint-disable-next-line react/require-default-props
  data: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape(Quaditem.propTypes)).isRequired,
    PropTypes.shape(Quaditem.propTypes).isRequired,
  ]),
};
