import React from 'react';
import { render } from '@testing-library/react';
import NotificationMessage from '../../components/notification-message';

describe('NotificationMessage component', () => {
  it('should render error message', () => {
    const { container } = render(
      <NotificationMessage
        type="error"
        message={__('Error message goes here')}
      />
    );
    expect(container).toMatchSnapshot();
    expect(container.querySelectorAll('.alert-danger')).toHaveLength(1);
    expect(container.querySelectorAll('.pficon-error-circle-o')).toHaveLength(
      1
    );
  });

  it('should render information message', () => {
    const { container } = render(
      <NotificationMessage
        type="info"
        message={__('Information message goes here')}
      />
    );
    expect(container.querySelectorAll('.alert-info')).toHaveLength(1);
    expect(container.querySelectorAll('.pficon-info')).toHaveLength(1);
    expect(container).toMatchSnapshot();
  });

  it('should render success message', () => {
    const { container } = render(
      <NotificationMessage
        type="success"
        message={__('Success message goes here')}
      />
    );
    expect(container.querySelectorAll('.alert-success')).toHaveLength(1);
    expect(container.querySelectorAll('.pficon-ok')).toHaveLength(1);
    expect(container).toMatchSnapshot();
  });

  it('should render warning message', () => {
    const { container } = render(
      <NotificationMessage
        type="warning"
        message={__('Warning message goes here')}
      />
    );
    expect(container.querySelectorAll('.alert-warning')).toHaveLength(1);
    expect(
      container.querySelectorAll('.pficon-warning-triangle-o')
    ).toHaveLength(1);
    expect(container).toMatchSnapshot();
  });

  it('invalid type should not render message', () => {
    const { container } = render(
      <NotificationMessage
        type="unknown"
        message={__('No message will be displayed')}
      />
    );
    expect(
      container.querySelectorAll('.miq-notification-message-container')
    ).toHaveLength(1);
    expect(container.querySelectorAll('.fa-question-circle')).toHaveLength(1);
    expect(container).toMatchSnapshot();
  });

  it('blank message should not render message', () => {
    const { container } = render(
      <NotificationMessage type="error" message="" />
    );
    expect(
      container.querySelectorAll('.miq-notification-message-container')
    ).toHaveLength(0);
    expect(container).toMatchSnapshot();
  });

  it('unknown error type message should be rendered with blank type', () => {
    const { container } = render(
      <NotificationMessage type="" message={__('Message goes here')} />
    );
    expect(
      container.querySelectorAll('.miq-notification-message-container')
    ).toHaveLength(1);
    expect(container.querySelectorAll('.fa-question-circle')).toHaveLength(1);
    expect(container).toMatchSnapshot();
  });

  it('unknown error type message should be rendered with no type', () => {
    const { container } = render(
      <NotificationMessage message={__('Message goes here')} />
    );
    expect(
      container.querySelectorAll('.miq-notification-message-container')
    ).toHaveLength(1);
    expect(container.querySelectorAll('.fa-question-circle')).toHaveLength(1);
    expect(container).toMatchSnapshot();
  });
});
