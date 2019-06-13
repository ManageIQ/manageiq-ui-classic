import React from 'react';
import { mount } from 'enzyme';
import fetchMock from 'fetch-mock';

import '../helpers/addFlash';
import '../helpers/miqFlashLater';
import '../helpers/miqSparkle';
import '../helpers/sprintf';

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
    setTimeout(() => {
      wrapper.update();
      wrapper.find('input#name').simulate('change', { target: { value: 'foo' } });
      /**
       * manually change content value
       * Code component is not standard input element
       * Two first parameters are codemirror element and data
       */
      wrapper.find(CodeEditor).props().onBeforeChange(null, null, 'Some random content');
      wrapper.update();
      wrapper.find('button.btn.btn-primary').simulate('click');
      expect(fetchMock.lastCall()).toBeTruthy();
      expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual(expect.objectContaining({
        name: 'foo',
        content: 'Some random content',
      }));
      expect(sparkleOnSpy).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should call miqFlashLater on cancel action', () => {
    const wrapper = mount(<OrcherstrationTemplateForm {...initialProps} />);
    setTimeout(() => {
      wrapper.update();
      wrapper.find('button').last().simulate('click');
      expect(flashLaterSpy).toHaveBeenCalledWith({
        level: 'success',
        message: 'Creation of a new Orchestration Template was cancelled by the user',
      });
    });
  });

  it('should render edit variant', (done) => {
    const wrapper = mount(<OrcherstrationTemplateForm {...initialProps} otId={123} />);
    fetchMock.patchOnce('/api/orchestration_templates/123', {});
    fetchMock.getOnce('/api/orchestration_templates/123?attributes=name,description,type,ems_id,draft,content', {
      name: 'foo',
      content: 'content',
    });
    /**
     * async load
     */
    setImmediate(() => {
      /**
       * state update
       */
      setImmediate(() => {
        wrapper.update();
        wrapper.find('input#name').simulate('change', { target: { value: 'bar' } });
        wrapper.update();
        wrapper.find('button.btn.btn-primary').simulate('click');
        /**
         * after patch request
         */
        setImmediate(() => {
          expect(fetchMock.lastCall()).toBeTruthy();
          expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual(expect.objectContaining({
            name: 'bar',
            content: 'content',
          }));
          expect(sparkleOnSpy).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });
  });

  it('should render copy variant', (done) => {
    const wrapper = mount(<OrcherstrationTemplateForm {...initialProps} otId={123} copy />);
    fetchMock.postOnce('/api/orchestration_templates/123', {});
    fetchMock.getOnce('/api/orchestration_templates/123?attributes=name,description,type,ems_id,draft,content', {
      name: 'foo',
      content: 'content',
    });
    /**
     * async load
     */
    setImmediate(() => {
      /**
       * state update
       */
      setImmediate(() => {
        wrapper.update();
        wrapper.find('input#name').simulate('change', { target: { value: 'bar' } });
        /**
         * manually change content value
         * Code component is not standard input element
         * Two first parameters are codemirror element and data
         */
        wrapper.find(CodeEditor).props().onBeforeChange(null, null, 'updated content');
        wrapper.update();
        wrapper.find('button.btn.btn-primary').simulate('click');
        /**
         * after copy request
         */
        setImmediate(() => {
          expect(fetchMock.lastCall()).toBeTruthy();
          expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual(expect.objectContaining({
            action: 'copy',
            resource: {
              name: 'bar',
              content: 'updated content',
            },
          }));
          expect(sparkleOnSpy).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });
  });
});
