import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';

import '../helpers/addFlash';
import '../helpers/miqFlashLater';
import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';
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

    await act(async() => {
      wrapper.find('input[name="name"]').simulate('change', { target: { value: 'foo' } });
      /**
         * manually change content value
         * Code component is not standard input element
         * Two first parameters are codemirror element and data
         */
      wrapper.find(CodeEditor).find('Controlled').props().onChange(null, null, 'Some random content');
      wrapper.find('form').simulate('submit');
    });

    expect(fetchMock.lastCall()).toBeTruthy();
    expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual(expect.objectContaining({
      name: 'foo',
      content: 'Some random content',
    }));
    expect(sparkleOnSpy).toHaveBeenCalledTimes(1);
    done();
  });

  it('should call miqFlashLater on cancel action', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<OrcherstrationTemplateForm {...initialProps} />);
    });
    wrapper.update();

    await act(async() => {
      wrapper.find('button.bx--btn--secondary').first().simulate('click');
    });

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Creation of a new Orchestration Template was cancelled by the user',
      'success',
      '/catalog/explorer',
    );
    done();
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

    await act(async() => {
      wrapper.find('input[name="name"]').simulate('change', { target: { value: 'bar' } });
      /**
           * manually change content value
           * Code component is not standard input element
           * Two first parameters are codemirror element and data
           */
      wrapper.find(CodeEditor).find('Controlled').props().onChange(null, null, 'updated content');
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

describe('Orcherstration Stack form', () => {
  let initialProps;
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyMiqAjaxButton;

  beforeEach(() => {
    initialProps = {
      managers: [['foo', 'bar']],
    };
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    spyMiqAjaxButton = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.reset();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyMiqAjaxButton.mockRestore();
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
      wrapper = mount(<OrcherstrationTemplateForm {...initialProps} isStack otId={123} copy />);
    });
    wrapper.update();

    await act(async() => {
      wrapper.find('input[name="name"]').simulate('change', { target: { value: 'bar' } });
      /**
           * manually change content value
           * Code component is not standard input element
           * Two first parameters are codemirror element and data
           */
      wrapper.find(CodeEditor).find('Controlled').props().onChange(null, null, 'updated content');
      wrapper.find('form').simulate('submit');
    });

    expect(fetchMock.lastCall()).toBeTruthy();
    expect(sparkleOnSpy).toHaveBeenCalledTimes(1);
    expect(wrapper).toMatchSnapshot();
    done();
  });

  it('should call submit function', async(done) => {
    const addContent = {
      templateId: 123,
      templateName: 'template_name',
      templateDescription: 'template_description',
      templateDraft: 'true',
      templateContent: 'template_content',
    };

    miqAjaxButton(`/orchestration_stack/stacks_ot_copy?button=add`, addContent);
    expect(spyMiqAjaxButton).toHaveBeenCalledWith('/orchestration_stack/stacks_ot_copy?button=add', addContent);
    done();
  });

  it('should call cancel function', async(done) => {
    const cancelMessage = __('Copy of Orchestration Template was cancelled by the user');
    miqRedirectBack(cancelMessage, 'success', `/orchestration_stack/show/${123}?display=stack_orchestration_template#/`);

    expect(miqRedirectBack).toHaveBeenCalledWith(
      cancelMessage, 'success', `/orchestration_stack/show/${123}?display=stack_orchestration_template#/`
    );
    done();
  });
});
