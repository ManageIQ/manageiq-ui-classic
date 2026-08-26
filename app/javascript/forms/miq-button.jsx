import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { Button } from '@carbon/react';

function MiqButton({
  name,
  enabled,
  title: titleProp = '',
  enabledTitle = '',
  disabledTitle = '',
  primary = false,
  xs = false,
  onClick,
  btnType = '',
}) {
  let title = titleProp;
  if (enabled && enabledTitle) {
    title = enabledTitle;
  }
  if (!enabled && disabledTitle) {
    title = disabledTitle;
  }

  const klass = ClassNames({
    btn: true,
    'btn-xs': xs,
    'btn-primary': primary,
    'btn-default': !primary,
    disabled: !enabled,
  });

  const buttonClicked = (event) => {
    if (enabled) {
      onClick();
    }

    event.preventDefault();
    event.target.blur();
  };
  if (btnType === 'deleteModal') {
    return (
      <Button
        className={title}
        onClick={buttonClicked}
        onKeyDown={buttonClicked}
        title={title}
        disabled={!enabled}
      >
        {__(name)}
      </Button>
    );
  }
  return (
    <Button
      className={klass}
      onClick={buttonClicked}
      onKeyDown={buttonClicked}
      title={title}
      disabled={!enabled}
    >
      {__(name)}
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

export default MiqButton;
