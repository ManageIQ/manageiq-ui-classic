import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

function MiqButton(props) {
  let title = props.title;
  if (props.enabled && props.enabledTitle) {
    title = props.enabledTitle;
  }
  if (! props.enabled && props.disabledTitle) {
    title = props.disabledTitle;
  }

  const klass = ClassNames({
    'btn': true,
    'btn-xs': props.xs,
    'btn-primary': props.primary,
    'btn-default': !props.primary,
    'disabled': !props.enabled,
  });

  const buttonClicked = (event) => {
    if (props.enabled) {
      props.onClick();
    }

    event.preventDefault();
    event.target.blur();
  };

  return (
    <button
      className={klass}
      onClick={buttonClicked}
      title={title}
      alt={title}
    >
      {props.name}
    </button>
  );
}

MiqButton.propTypes = {
  name: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  title: PropTypes.string,
  enabledTitle: PropTypes.string,
  disabledTitle: PropTypes.string,
  primary: PropTypes.bool,
  xs: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

MiqButton.defaultProps = {
  title: '',
  enabledTitle: '',
  disabledTitle: '',
  primary: false,
  xs: false,
};

export default MiqButton;
