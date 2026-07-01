import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InstanceFieldsTable from '../../components/miq-ae-class/instance-fields-table';

describe('InstanceFieldsTable Component', () => {
  const mockFields = [
    {
      id: 1,
      name: 'field1',
      display_name: 'Field 1',
      aetype: 'attribute',
      datatype: 'string',
      value: 'test_value',
      value_collect: '',
      icons: ['pficon pficon-info'],
      message: '',
    },
    {
      id: 2,
      name: 'field2',
      display_name: 'Field 2',
      aetype: 'attribute',
      datatype: 'integer',
      value: '42',
      value_collect: '/collect/path',
      icons: ['pficon pficon-warning-triangle-o'],
      message: 'Warning message',
    },
  ];

  const mockStateFields = [
    {
      id: 1,
      name: 'state1',
      display_name: 'State 1',
      aetype: 'state',
      datatype: 'string',
      value: 'state_value',
      value_collect: '',
      value_on_entry: 'on_entry_method',
      value_on_exit: 'on_exit_method',
      value_on_error: 'on_error_method',
      value_max_retries: '3',
      value_max_time: '60',
      icons: ['pficon pficon-info'],
      message: '',
    },
  ];

  const mockOnEditField = jest.fn();

  beforeEach(() => {
    window.__ = (str) => str;
    mockOnEditField.mockClear();
  });

  describe('Regular Class Fields', () => {
    it('should render table with correct headers', () => {
      render(
        <InstanceFieldsTable
          fields={mockFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('Collect')).toBeInTheDocument();
      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getAllByText('Edit').length).toBeGreaterThan(0);
    });

    it('should not show state machine columns for regular class', () => {
      render(
        <InstanceFieldsTable
          fields={mockFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      expect(screen.queryByText('On Entry')).not.toBeInTheDocument();
      expect(screen.queryByText('On Exit')).not.toBeInTheDocument();
      expect(screen.queryByText('On Error')).not.toBeInTheDocument();
      expect(screen.queryByText('Max Retries')).not.toBeInTheDocument();
      expect(screen.queryByText('Max Time')).not.toBeInTheDocument();
    });

    it('should display field names and values', () => {
      render(
        <InstanceFieldsTable
          fields={mockFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      expect(screen.getByText(/Field 1/)).toBeInTheDocument();
      expect(screen.getByText(/Field 2/)).toBeInTheDocument();
      expect(screen.getByText('test_value')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should display collect values', () => {
      render(
        <InstanceFieldsTable
          fields={mockFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      expect(screen.getByText('/collect/path')).toBeInTheDocument();
    });

    it('should display message column', () => {
      render(
        <InstanceFieldsTable
          fields={mockFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    it('should render edit buttons for each field', () => {
      render(
        <InstanceFieldsTable
          fields={mockFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons).toHaveLength(2);
    });

    it('should call onEditField when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <InstanceFieldsTable
          fields={mockFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      expect(mockOnEditField).toHaveBeenCalledWith(mockFields[0], 0);
    });
  });

  describe('State Machine Class Fields', () => {
    it('should render state machine columns', () => {
      render(
        <InstanceFieldsTable
          fields={mockStateFields}
          isStateClass={true}
          onEditField={mockOnEditField}
        />
      );

      expect(screen.getByText('On Entry')).toBeInTheDocument();
      expect(screen.getByText('On Exit')).toBeInTheDocument();
      expect(screen.getByText('On Error')).toBeInTheDocument();
      expect(screen.getByText('Max Retries')).toBeInTheDocument();
      expect(screen.getByText('Max Time')).toBeInTheDocument();
    });

    it('should display state machine field values', () => {
      render(
        <InstanceFieldsTable
          fields={mockStateFields}
          isStateClass={true}
          onEditField={mockOnEditField}
        />
      );

      expect(screen.getByText('on_entry_method')).toBeInTheDocument();
      expect(screen.getByText('on_exit_method')).toBeInTheDocument();
      expect(screen.getByText('on_error_method')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument();
    });

    it('should render all columns in correct order', () => {
      const { container } = render(
        <InstanceFieldsTable
          fields={mockStateFields}
          isStateClass={true}
          onEditField={mockOnEditField}
        />
      );

      const headers = container.querySelectorAll('th');
      expect(headers[0]).toHaveTextContent('Name');
      expect(headers[1]).toHaveTextContent('Value');
      expect(headers[2]).toHaveTextContent('On Entry');
      expect(headers[3]).toHaveTextContent('On Exit');
      expect(headers[4]).toHaveTextContent('On Error');
      expect(headers[5]).toHaveTextContent('Max Retries');
      expect(headers[6]).toHaveTextContent('Max Time');
      expect(headers[7]).toHaveTextContent('Collect');
      expect(headers[8]).toHaveTextContent('Message');
      expect(headers[9]).toHaveTextContent('Edit');
    });
  });

  describe('Field Icons', () => {
    it('should render field icons', () => {
      const { container } = render(
        <InstanceFieldsTable
          fields={mockFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      const icons = container.querySelectorAll('.pficon');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should render multiple icons for a field', () => {
      const fieldsWithMultipleIcons = [
        {
          ...mockFields[0],
          icons: ['pficon pficon-info', 'pficon pficon-warning-triangle-o'],
        },
      ];

      const { container } = render(
        <InstanceFieldsTable
          fields={fieldsWithMultipleIcons}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      const icons = container.querySelectorAll('.pficon');
      expect(icons.length).toBeGreaterThan(1);
    });
  });

  describe('Empty States', () => {
    it('should handle empty fields array', () => {
      const { container } = render(
        <InstanceFieldsTable
          fields={[]}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle fields with empty values', () => {
      const emptyFields = [
        {
          id: 1,
          name: 'empty_field',
          display_name: 'Empty Field',
          aetype: 'attribute',
          datatype: 'string',
          value: '',
          value_collect: '',
          icons: [],
          message: '',
        },
      ];

      render(
        <InstanceFieldsTable
          fields={emptyFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      expect(screen.getByText(/Empty Field \(empty_field\)/)).toBeInTheDocument();
    });

    it('should handle state fields with empty state values', () => {
      const emptyStateFields = [
        {
          id: 1,
          name: 'state1',
          display_name: 'State 1',
          aetype: 'state',
          datatype: 'string',
          value: '',
          value_collect: '',
          value_on_entry: '',
          value_on_exit: '',
          value_on_error: '',
          value_max_retries: '',
          value_max_time: '',
          icons: [],
          message: '',
        },
      ];

      render(
        <InstanceFieldsTable
          fields={emptyStateFields}
          isStateClass={true}
          onEditField={mockOnEditField}
        />
      );

      expect(screen.getByText(/State 1 \(state1\)/)).toBeInTheDocument();
    });
  });

  describe('Field Display Names', () => {
    it('should show display name when different from name', () => {
      render(
        <InstanceFieldsTable
          fields={mockFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      expect(screen.getByText(/Field 1 \(field1\)/)).toBeInTheDocument();
    });

    it('should show only display name when same as name', () => {
      const sameNameFields = [
        {
          ...mockFields[0],
          name: 'Field1',
          display_name: 'Field1',
        },
      ];

      render(
        <InstanceFieldsTable
          fields={sameNameFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      // Should not show name in parentheses when it's the same
      expect(screen.queryByText(/Field1 \(Field1\)/)).not.toBeInTheDocument();
    });
  });

  describe('Snapshot Testing', () => {
    it('should match snapshot for regular class', () => {
      const { container } = render(
        <InstanceFieldsTable
          fields={mockFields}
          isStateClass={false}
          onEditField={mockOnEditField}
        />
      );

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for state machine class', () => {
      const { container } = render(
        <InstanceFieldsTable
          fields={mockStateFields}
          isStateClass={true}
          onEditField={mockOnEditField}
        />
      );

      expect(container).toMatchSnapshot();
    });
  });
});

