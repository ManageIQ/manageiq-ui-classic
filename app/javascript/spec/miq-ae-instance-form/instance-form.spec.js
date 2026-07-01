import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import InstanceForm from '../../components/miq-ae-class/instance-form';
import '../helpers/miqSparkle';

describe('InstanceForm Component', () => {
  let sparkleOnSpy;
  let sparkleOffSpy;
  let flashSpy;

  const mockInstanceData = {
    instance: {
      name: 'test_instance',
      display_name: 'Test Instance',
      description: 'Test Description',
    },
    fields: [
      {
        id: 1,
        name: 'field1',
        display_name: 'Field 1',
        aetype: 'attribute',
        datatype: 'string',
        value: 'value1',
        value_collect: '',
        icons: ['pficon pficon-info'], // ToDO:: Check if the icons are correct "ff ff-attribute", "pficon-ok"
        message: '',
      },
      {
        id: 2,
        name: 'field2',
        display_name: 'Field 2',
        aetype: 'attribute',
        datatype: 'integer',
        value: '42',
        value_collect: '',
        icons: ['pficon pficon-info'],
        message: '',
      },
    ],
    is_state_class: false,
    namespace_path: 'Domain/Namespace/Class',
  };

  const mockStateClassData = {
    instance: {
      name: 'state_instance',
      display_name: 'State Instance',
      description: 'State Description',
    },
    fields: [
      {
        id: 1,
        name: 'state1',
        display_name: 'State 1',
        aetype: 'state',
        datatype: 'string',
        value: 'value1',
        value_collect: '',
        value_on_entry: 'on_entry_method',
        value_on_exit: 'on_exit_method',
        value_on_error: 'on_error_method',
        value_max_retries: '3',
        value_max_time: '60',
        icons: ['pficon pficon-info'],
        message: '',
      },
    ],
    is_state_class: true,
    namespace_path: 'Domain/Namespace/StateClass',
  };

  beforeEach(() => {
    window.__ = (str) => str;
    window.sprintf = (str, obj) => str.replace(/%{(\w+)}/g, (_, key) => obj[key]);
    window.add_flash = jest.fn();
    sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
    sparkleOffSpy = jest.spyOn(window, 'miqSparkleOff');
    flashSpy = jest.spyOn(window, 'add_flash');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    sparkleOnSpy.mockRestore();
    sparkleOffSpy.mockRestore();
    flashSpy.mockRestore();
  });

  describe('Add Instance', () => {
    it('should render add instance form correctly', async() => {
      const classId = '123';
      fetchMock.get(`/miq_ae_class/instance_form_data/new?class_id=${classId}`, {
        instance: { name: '', display_name: '', description: '' },
        fields: mockInstanceData.fields,
        is_state_class: false,
        namespace_path: 'Domain/Namespace/Class',
      });

      const { container } = renderWithRedux(
        <InstanceForm recordId={null} classId={classId} />
      );

      await waitFor(() => {
        expect(global.miqSparkleOff).toHaveBeenCalled();
      });

      expect(container).toMatchSnapshot();
    });

    it('should enable submit button when name is provided', async() => {
      const classId = '123';
      fetchMock.get(`/miq_ae_class/instance_form_data/new?class_id=${classId}`, {
        instance: { name: '', display_name: '', description: '' },
        fields: [],
        is_state_class: false,
        namespace_path: 'Domain/Namespace/Class',
      });

      const { container } = renderWithRedux(<InstanceForm recordId={null} classId={classId} />);

      await waitFor(() => {
        expect(sparkleOffSpy).toHaveBeenCalled();
      });

      const submitButton = screen.getByRole('button', { name: /add/i });
      expect(submitButton).toBeDisabled();

      const nameInput = container.querySelector('#name');
      await userEvent.type(nameInput, 'test_name');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should submit form with valid data', async() => {
      const user = userEvent.setup();
      const classId = '123';
      fetchMock.get(`/miq_ae_class/instance_form_data/new?class_id=${classId}`, {
        instance: { name: '', display_name: '', description: '' },
        fields: mockInstanceData.fields,
        is_state_class: false,
        namespace_path: 'Domain/Namespace/Class',
      });

      fetchMock.post(`/miq_ae_class/instance_create?class_id=${classId}`, {
        success: true,
        message: 'Automate Instance "new_instance" was added',
      });

      const { container } = renderWithRedux(<InstanceForm recordId={null} classId={classId} />);

      await waitFor(() => {
        expect(sparkleOffSpy).toHaveBeenCalled();
      });

      const nameInput = container.querySelector('#name');
      await user.type(nameInput, 'new_instance');

      const submitButton = screen.getByRole('button', { name: /add/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetchMock.called(`/miq_ae_class/instance_create?class_id=${classId}`)).toBe(true);
      });
    });
  });

  describe('Edit Instance', () => {
    it('should render edit instance form correctly', async () => {
      const recordId = '456';
      fetchMock.get(`/miq_ae_class/instance_form_data/${recordId}`, mockInstanceData);

      const { container } = renderWithRedux(
        <InstanceForm recordId={recordId} classId={null} />
      );

      await waitFor(() => {
        expect(global.miqSparkleOff).toHaveBeenCalled();
      });

      expect(container).toMatchSnapshot();
    });

    it('should load existing instance data', async () => {
      const recordId = '456';
      fetchMock.get(`/miq_ae_class/instance_form_data/${recordId}`, mockInstanceData);

      renderWithRedux(<InstanceForm recordId={recordId} classId={null} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('test_instance')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Instance')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      });
    });

    it('should update instance with valid data', async() => {
      const user = userEvent.setup();
      const recordId = '456';
      fetchMock.get(`/miq_ae_class/instance_form_data/${recordId}`, mockInstanceData);
      fetchMock.post(`/miq_ae_class/instance_update/${recordId}`, {
        success: true,
        message: 'Automate Instance "updated_instance" was saved',
      });

      const { container } = renderWithRedux(<InstanceForm recordId={recordId} classId={null} />);

      await waitFor(() => {
        expect(sparkleOffSpy).toHaveBeenCalled();
      });

      const nameInput = container.querySelector('#name');
      await user.clear(nameInput);
      await user.type(nameInput, 'updated_instance');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetchMock.called(`/miq_ae_class/instance_update/${recordId}`)).toBe(true);
      });
    });
  });

  describe('State Machine Class', () => {
    it('should render state machine fields', async() => {
      const classId = '789';
      fetchMock.get(`/miq_ae_class/instance_form_data/new?class_id=${classId}`, mockStateClassData);

      renderWithRedux(<InstanceForm recordId={null} classId={classId} />);

      await waitFor(() => {
        expect(sparkleOffSpy).toHaveBeenCalled();
      });

      // State machine should show additional columns
      expect(screen.getByText(/On Entry/i)).toBeInTheDocument();
      expect(screen.getByText(/On Exit/i)).toBeInTheDocument();
      expect(screen.getByText(/On Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Max Retries/i)).toBeInTheDocument();
      expect(screen.getByText(/Max Time/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async() => {
      const classId = '123';
      fetchMock.get(`/miq_ae_class/instance_form_data/new?class_id=${classId}`, {
        status: 500,
        body: { error: 'Server error' },
      });

      renderWithRedux(<InstanceForm recordId={null} classId={classId} />);

      await waitFor(() => {
        expect(flashSpy).toHaveBeenCalledWith(
          expect.stringContaining('Error loading instance data'),
          'error'
        );
      });
    });

  });

  describe('Form Actions', () => {
    it('should handle cancel action', async() => {
      const classId = '123';
      fetchMock.get(`/miq_ae_class/instance_form_data/new?class_id=${classId}`, {
        instance: { name: '', display_name: '', description: '' },
        fields: [],
        is_state_class: false,
        namespace_path: 'Domain/Namespace/Class',
      });

      renderWithRedux(<InstanceForm recordId={null} classId={classId} />);

      await waitFor(() => {
        expect(sparkleOffSpy).toHaveBeenCalled();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });

    // ToDO
    // it('should handle reset action', async() => {
    //   const user = userEvent.setup();
    //   const recordId = '456';
    //   fetchMock.get(`/miq_ae_class/instance_form_data/${recordId}`, mockInstanceData);

    //   delete window.location;
    //   window.location = { reload: jest.fn() };

    //   renderWithRedux(<InstanceForm recordId={recordId} classId={null} />);

    //   await waitFor(() => {
    //     expect(sparkleOffSpy).toHaveBeenCalled();
    //   });

    //   const resetButton = screen.getByRole('button', { name: /reset/i });
    //   await user.click(resetButton);

    //   expect(window.location.reload).toHaveBeenCalled();
    // });
  });
});

