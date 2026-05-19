import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';
import { renderWithRedux } from '../helpers/mountForm';
import OrcherstrationTemplateForm from '../../components/orchestration-template/orcherstration-template-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';

describe('OrcherstrationTemplate form', () => {
  let initialProps;
  let sparkleOnSpy;
  let sparkleOffSpy;
  let addFlashSpy;

  beforeEach(() => {
    initialProps = {
      managers: [['foo', 'bar']],
    };
    sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
    sparkleOffSpy = jest.spyOn(window, 'miqSparkleOff');
    addFlashSpy = jest.spyOn(window, 'add_flash');
  });

  afterEach(() => {
    cleanup();
    fetchMock.restore();
    jest.clearAllMocks();
    sparkleOnSpy.mockRestore();
    sparkleOffSpy.mockRestore();
    addFlashSpy.mockRestore();
  });

  it('should call submit function', async() => {
    const user = userEvent.setup();
    fetchMock.postOnce('/api/orchestration_templates', {});

    const { container } = renderWithRedux(<OrcherstrationTemplateForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'foo');

    // Manually trigger CodeEditor onChange since it's not a standard input
    // Find the CodeMirror textarea and simulate content change
    const codeMirrorTextarea = container.querySelector('.CodeMirror textarea');
    expect(codeMirrorTextarea).toBeInTheDocument();
    await user.type(codeMirrorTextarea, 'Some random content');

    // Wait for button to be enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).not.toBeDisabled();
    });

    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(fetchMock.lastCall()).toBeTruthy();
    });

    expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual(
      expect.objectContaining({
        name: 'foo',
        content: 'Some random content',
      })
    );
    expect(sparkleOnSpy).toHaveBeenCalled();
  });

  it('should call miqFlashLater on cancel action', async() => {
    const user = userEvent.setup();

    renderWithRedux(<OrcherstrationTemplateForm {...initialProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Creation of a new Orchestration Template was cancelled by the user',
      'success',
      '/catalog/explorer'
    );
  });

  it('should render edit variant', async() => {
    const user = userEvent.setup();
    fetchMock.patchOnce('/api/orchestration_templates/123', {});
    fetchMock.getOnce('/api/orchestration_templates/123?attributes=name,description,type,ems_id,draft,content', {
      name: 'foo',
      content: 'content',
    });

    renderWithRedux(<OrcherstrationTemplateForm {...initialProps} otId={123} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'bar');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(fetchMock.lastCall()).toBeTruthy();
    });

    expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual(
      expect.objectContaining({
        name: 'bar',
        content: 'content',
      })
    );
    expect(sparkleOnSpy).toHaveBeenCalled();
  });

  it('should render copy variant', async() => {
    const user = userEvent.setup();
    fetchMock.postOnce('/api/orchestration_templates/123', {});
    fetchMock.getOnce('/api/orchestration_templates/123?attributes=name,description,type,ems_id,draft,content', {
      name: 'foo',
      content: 'content',
    });

    const { container } = renderWithRedux(<OrcherstrationTemplateForm {...initialProps} otId={123} copy />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'bar');

    // Update CodeEditor content - select all and replace
    const codeMirrorTextarea = container.querySelector('.CodeMirror textarea');
    expect(codeMirrorTextarea).toBeInTheDocument();
    await user.type(codeMirrorTextarea, ' edited');
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(fetchMock.lastCall()).toBeTruthy();
    });

    expect(JSON.parse(fetchMock.lastCall()[1].body)).toEqual(
      expect.objectContaining({
        action: 'copy',
        resource: {
          name: 'bar',
          content: 'content edited',
        },
      })
    );
    expect(sparkleOnSpy).toHaveBeenCalled();
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
    cleanup();
    fetchMock.restore();
    jest.clearAllMocks();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyMiqAjaxButton.mockRestore();
  });

  it('should render copy variant', async() => {
    const user = userEvent.setup();
    const sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
    fetchMock.postOnce('/api/orchestration_templates/123', {});
    fetchMock.getOnce('/api/orchestration_templates/123?attributes=name,description,type,ems_id,draft,content', {
      name: 'foo',
      content: 'content',
    });

    const { container } = renderWithRedux(<OrcherstrationTemplateForm {...initialProps} isStack otId={123} copy />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'bar');

    // Update CodeEditor content
    const codeMirrorTextarea = container.querySelector('.CodeMirror textarea');
    expect(codeMirrorTextarea).toBeInTheDocument();
    await user.type(codeMirrorTextarea, ' edited');

    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(fetchMock.lastCall()).toBeTruthy();
    });

    expect(sparkleOnSpy).toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });

  it('should call submit function', () => {
    const addContent = {
      templateId: 123,
      templateName: 'template_name',
      templateDescription: 'template_description',
      templateDraft: 'true',
      templateContent: 'template_content',
    };

    miqAjaxButton(`/orchestration_stack/stacks_ot_copy?button=add`, addContent);
    expect(spyMiqAjaxButton).toHaveBeenCalledWith('/orchestration_stack/stacks_ot_copy?button=add', addContent);
  });

  it('should call cancel function', () => {
    const cancelMessage = __('Copy of Orchestration Template was cancelled by the user');
    miqRedirectBack(cancelMessage, 'success', `/orchestration_stack/show/${123}?display=stack_orchestration_template#/`);

    expect(miqRedirectBack).toHaveBeenCalledWith(cancelMessage, 'success', `/orchestration_stack/show/${123}?display=stack_orchestration_template#/`);
  });
});
