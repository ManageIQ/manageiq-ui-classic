import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { Button } from 'carbon-components-react';

function MiqButton(props) {
  let { title } = props;
  if (props.enabled && props.enabledTitle) {
    title = props.enabledTitle;
  }
  if (!props.enabled && props.disabledTitle) {
    title = props.disabledTitle;
  }

  const klass = ClassNames({
    btn: true,
    'btn-xs': props.xs,
    'btn-primary': props.primary,
    'btn-default': !props.primary,
    disabled: !props.enabled,
  });

  const buttonClicked = (event) => {
    if (props.enabled) {
      props.onClick();
    }

    event.preventDefault();
    event.target.blur();
  };

  const { btnType } = props;
  if (btnType === 'modal') {
    return (
      <Button
        className={title}
        onClick={buttonClicked}
        onKeyPress={buttonClicked}
        title={title}
      >
        {props.name}
      </Button>
    );
  }
  return (
    <Button
      className={klass}
      onClick={buttonClicked}
      onKeyPress={buttonClicked}
      title={title}
    >
      {props.name}
    </Button>
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
  btnType: PropTypes.string,
};

MiqButton.defaultProps = {
  title: '',
  enabledTitle: '',
  disabledTitle: '',
  primary: false,
  xs: false,
  btnType: '',
};

export default MiqButton;
