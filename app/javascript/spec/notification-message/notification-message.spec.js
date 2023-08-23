import React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import NotificationMessage from '../../components/notification-message';

describe('NotificationMessage component', () => {
  it('should render error message', () => {
    const wrapper = mount(<NotificationMessage type="error" message={_('Error message goes here')} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('.alert-danger')).toHaveLength(1);
    expect(wrapper.find('.pficon-error-circle-o')).toHaveLength(1);
  });

  it('should render information message', () => {
    const wrapper = mount(<NotificationMessage type="info" message={_('Information message goes here')} />);
    expect(wrapper.find('.alert-info')).toHaveLength(1);
    expect(wrapper.find('.pficon-info')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render success message', () => {
    const wrapper = mount(<NotificationMessage type="success" message={_('Success message goes here')} />);
    expect(wrapper.find('.alert-success')).toHaveLength(1);
    expect(wrapper.find('.pficon-ok')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render warning message', () => {
    const wrapper = mount(<NotificationMessage type="warning" message={_('Warning message goes here')} />);
    expect(wrapper.find('.alert-warning')).toHaveLength(1);
    expect(wrapper.find('.pficon-warning-triangle-o')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('invalid type should not render message', () => {
    const wrapper = mount(<NotificationMessage type="unknown" message={_('No message will be displayed')} />);
    expect(wrapper.find('.miq-notification-message-container')).toHaveLength(1);
    expect(wrapper.find('.fa-question-circle')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('blank message should not render message', () => {
    const wrapper = mount(<NotificationMessage type="error" message="" />);
    expect(wrapper.find('.miq-notification-message-container')).toHaveLength(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('unknown error type message should be rendered with blank type', () => {
    const wrapper = mount(<NotificationMessage type="" message={_('Message goes here')} />);
    expect(wrapper.find('.miq-notification-message-container')).toHaveLength(1);
    expect(wrapper.find('.fa-question-circle')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('unknown error type message should be rendered with no type', () => {
    const wrapper = mount(<NotificationMessage message={_('Message goes here')} />);
    expect(wrapper.find('.miq-notification-message-container')).toHaveLength(1);
    expect(wrapper.find('.fa-question-circle')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
