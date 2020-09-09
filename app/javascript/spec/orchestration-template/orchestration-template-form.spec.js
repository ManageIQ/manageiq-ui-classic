import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';

import '../helpers/addFlash';
import '../helpers/miqFlashLater';
import '../helpers/miqSparkle';
import '../helpers/sprintf';
import { mount } from '../helpers/mountForm';

import OrcherstrationTemplateForm from '../../components/orchestration-template/orcherstration-template-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const { default: CodeEditor } = jest.requireActual('../../components/code-editor');

describe('OrcherstrationTemplate form', () => {
  let initialProps;
  const sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
  const sparkleOffSpy = jest.spyOn(window, 'miqSparkleOff');
  const addFlashSpy = jest.spyOn(window, 'add_flash');

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

  it('should call submit function', async(done) => {
    fetchMock.postOnce('/api/orchestration_templates', {});
    let wrapper;
    await act(async() => {
      wrapper = mount(<OrcherstrationTemplateForm {...initialProps} />);
    });
    wrapper.update();
    wrapper.find('input[name="name"]').simulate('change', { target: { value: 'foo' } });
    /**
       * manually change content value
       * Code component is not standard input element
       * Two first parameters are codemirror element and data
       */
    wrapper.find(CodeEditor).props().onChange(null, null, 'Some random content');
    wrapper.update();
    wrapper.find('form').simulate('submit');
    expect(fetchMock.lastCall()).toBeTruthy();
    expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual(expect.objectContaining({
      name: 'foo',
      content: 'Some random content',
    }));
    expect(sparkleOnSpy).toHaveBeenCalledTimes(1);
    done();
  });

  it('should call miqFlashLater on cancel action', () => {
    const wrapper = mount(<OrcherstrationTemplateForm {...initialProps} />);
    wrapper.update();
    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Creation of a new Orchestration Template was cancelled by the user',
      'success',
      '/catalog/explorer',
    );
  });

  it('should render edit variant', async(done) => {
    const sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
    fetchMock.patchOnce('/api/orchestration_templates/123', {});
    fetchMock.getOnce('/api/orchestration_templates/123?attributes=name,description,type,ems_id,draft,content', {
      name: 'foo',
      content: 'content',
    });
    let wrapper;
    await act(async() => {
      wrapper = mount(<OrcherstrationTemplateForm {...initialProps} otId={123} />);
    });
    wrapper.update();
    wrapper.find('input[name="name"]').simulate('change', { target: { value: 'bar' } });
    wrapper.update();
    await act(async() => {
      wrapper.find('form').simulate('submit');
    });

    expect(fetchMock.lastCall()).toBeTruthy();
    expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual(expect.objectContaining({
      name: 'bar',
      content: 'content',
    }));
    expect(sparkleOnSpy).toHaveBeenCalledTimes(1);
    done();
  });

  it('should render copy variant', async(done) => {
    const sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
    fetchMock.postOnce('/api/orchestration_templates/123', {});
    fetchMock.getOnce('/api/orchestration_templates/123?attributes=name,description,type,ems_id,draft,content', {
      name: 'foo',
      content: 'content',
    });
    let wrapper;
    await act(async() => {
      wrapper = mount(<OrcherstrationTemplateForm {...initialProps} otId={123} copy />);
    });
    wrapper.update();
    wrapper.find('input[name="name"]').simulate('change', { target: { value: 'bar' } });
    /**
         * manually change content value
         * Code component is not standard input element
         * Two first parameters are codemirror element and data
         */
    wrapper.find(CodeEditor).props().onChange(null, null, 'updated content');
    wrapper.update();
    await act(async() => {
      wrapper.find('form').simulate('submit');
    });

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
