import React from 'react';
import { mount } from 'enzyme';
import fetchMock from 'fetch-mock';

import '../helpers/addFlash';
import '../helpers/miqSparkle';
import '../helpers/miqFlashLater';
import CodeEditor from '../../components/code-editor';
import OrcherstrationTemplateForm from '../../components/orchestration-template/orcherstration-template-form';

describe('OrcherstrationTemplate form', () => {
  let initialProps;
  const sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
  const sparkleOffSpy = jest.spyOn(window, 'miqSparkleOff');
  const addFlashSpy = jest.spyOn(window, 'add_flash');
  const flashLaterSpy = jest.spyOn(window, 'miqFlashLater');

  beforeEach(() => {
    initialProps = {
      managers: [['foo', 'bar']],
    };
  });

  afterEach(() => {
    fetchMock.reset();
    sparkleOnSpy.mockRestore();
    sparkleOffSpy.mockRestore();
    addFlashSpy.mockRestore();
  });

  it('should call submit function', (done) => {
    const wrapper = mount(<OrcherstrationTemplateForm {...initialProps} />);
    fetchMock.postOnce('/api/orchestration_templates', {});
    wrapper.find('input#name').simulate('change', { target: { value: 'foo' } });
    /**
     * manually change content value
     * Code component is not standard input element
     * Two first parameters are codemirror element and data
     */
    wrapper.find(CodeEditor).props().onBeforeChange(null, null, 'Some random content');
    wrapper.update();
    wrapper.find('button.btn.btn-primary').simulate('click');
    setImmediate(() => {
      expect(fetchMock.lastCall()).toBeTruthy();
      expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual(expect.objectContaining({
        name: 'foo',
        content: 'Some random content',
      }));
      expect(sparkleOnSpy).toHaveBeenCalledTimes(1);
      expect(sparkleOffSpy).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should call miqFlashLater on cancel action', () => {
    const wrapper = mount(<OrcherstrationTemplateForm {...initialProps} />);
    wrapper.find('button').last().simulate('click');
    expect(flashLaterSpy).toHaveBeenCalledWith({
      level: 'success',
      message: 'Creation of a new Service Dialog was cancelled by the user',
    });
  });
});
