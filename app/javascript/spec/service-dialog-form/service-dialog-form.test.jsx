import { screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import ServiceDialogForm from '../../components/service-dialog-form';
import { renderWithRedux } from '../helpers/mountForm';

// Mock subcomponents not yet implemented (Sub-Task 3+)
jest.mock('../../components/service-dialog-form/dynamic-section', () => () => <div data-testid="dynamic-section" />, { virtual: true });

describe('ServiceDialogForm', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  const newAction = { id: '', action: 'new' };

  const editAction = { id: '42', action: 'edit' };

  const mockDialog = {
    id: 42,
    label: 'My Dialog',
    description: 'Test dialog',
    content: [
      {
        dialog_tabs: [
          {
            id: 1,
            label: 'Tab 1',
            description: '',
            position: 0,
            dialog_groups: [
              {
                id: 10,
                label: 'Section 1',
                description: '',
                position: 0,
                dialog_fields: [],
              },
            ],
          },
        ],
      },
    ],
  };

  describe('new dialog', () => {
    it('renders the form with empty label and description', () => {
      const { container } = renderWithRedux(
        <ServiceDialogForm dialogAction={newAction} />
      );

      expect(screen.getByLabelText(/label/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it('renders Add and Cancel buttons', () => {
      renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
      // The primary footer "Add" button has exact text "Add"
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders the default first tab', () => {
      renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
      expect(screen.getByText(/new tab/i)).toBeInTheDocument();
    });
  });

  describe('edit dialog', () => {
    beforeEach(() => {
      fetchMock.get(
        `/api/service_dialogs/42?expand=resources&attributes=content,dialog_tabs`,
        mockDialog,
      );
    });

    it('shows loading spinner initially', () => {
      renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
      expect(document.querySelector('.cds--loading')).not.toBeNull();
    });

    it('renders dialog label after load', async() => {
      renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
      await waitFor(() => {
        expect(screen.getByDisplayValue('My Dialog')).toBeInTheDocument();
      });
    });

    it('renders Save and Cancel buttons after load', async() => {
      renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });
  });

  describe('copy dialog', () => {
    const copyAction = { id: '42', action: 'copy' };

    beforeEach(() => {
      fetchMock.get(
        `/api/service_dialogs/42?expand=resources&attributes=content,dialog_tabs`,
        mockDialog,
      );
    });

    it('prefills label with "Copy of ..."', async() => {
      renderWithRedux(<ServiceDialogForm dialogAction={copyAction} />);
      await waitFor(() => {
        expect(screen.getByDisplayValue(/copy of my dialog/i)).toBeInTheDocument();
      });
    });
  });
});
