import React from 'react';

const PlayerField = (Component) => {
  const fn = ({ visible, ...props }) => {
    if (visible === false) {
      return (
        <div style={{ display: 'none' }}>
          <Component {...props} />
        </div>
      );
    }

    return <Component {...props} />;
  };

  return fn;
};

export default PlayerField;
