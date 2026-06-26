import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@carbon/react';
import { AddAlt } from '@carbon/react/icons';

const EmptyState = ({
  addMessage,
  documentation,
  actionUrl,
}) => {
  const buttonTitle = __('Add a Provider');
  const title = __('Add a Provider');
  const description = __("You don't have any providers to display. Please add a Provider.");

  const handleButtonClick = () => {
    miqSparkleOn();
    window.location.href = actionUrl;
  };

  return (
    <div className="empty-state-carbon">
      <div className="empty-state-carbon__icon">
        <AddAlt size={64} />
      </div>
      <h1 className="empty-state-carbon__title">{title}</h1>
      <p className="empty-state-carbon__description">{description}</p>
      {documentation && (
        <p className="empty-state-carbon__documentation">
          {__('Learn more about this')}
          {' '}
          <a
            href={documentation}
            rel="noopener noreferrer"
            target="_blank"
            className="empty-state-carbon__link"
          >
            {__('in the documentation.')}
          </a>
        </p>
      )}
      <div className="empty-state-carbon__action">
        <Button
          kind="primary"
          size="lg"
          onClick={handleButtonClick}
          renderIcon={AddAlt}
          title={addMessage}
        >
          {buttonTitle}
        </Button>
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  addMessage: PropTypes.string,
  documentation: PropTypes.string,
  actionUrl: PropTypes.string,
};

EmptyState.defaultProps = {
  addMessage: null,
  documentation: null,
  actionUrl: '/new',
};

export default EmptyState;
