import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ImportDatastoreViaGit from '../../components/automate-import-export-form/import-datastore-via-git';

describe('ImportDatastoreViaGit component', () => {
  it('should render the button and heading', () => {
    const mockOnOpenModal = jest.fn();
    renderWithRedux(<ImportDatastoreViaGit onOpenModal={mockOnOpenModal} />);

    expect(screen.getByText(/Import Datastore via Git/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Import from Git Repository/i })).toBeInTheDocument();
  });

  it('should call onOpenModal when button is clicked', async() => {
    const user = userEvent.setup({ delay: null });
    const mockOnOpenModal = jest.fn();
    renderWithRedux(<ImportDatastoreViaGit onOpenModal={mockOnOpenModal} />);

    const button = screen.getByRole('button', { name: /Import from Git Repository/i });
    await user.click(button);

    expect(mockOnOpenModal).toHaveBeenCalledTimes(1);
  });

  it('should show helper text when disableSubmit is true', () => {
    const mockOnOpenModal = jest.fn();
    renderWithRedux(<ImportDatastoreViaGit onOpenModal={mockOnOpenModal} disableSubmit />);

    expect(screen.getByText(/Please enable the git owner role/i)).toBeInTheDocument();
  });

  it('should disable button when disableSubmit is true', () => {
    const mockOnOpenModal = jest.fn();
    renderWithRedux(<ImportDatastoreViaGit onOpenModal={mockOnOpenModal} disableSubmit />);

    const button = screen.getByRole('button', { name: /Import from Git Repository/i });
    expect(button).toBeDisabled();
  });

  it('should enable button when disableSubmit is false', () => {
    const mockOnOpenModal = jest.fn();
    renderWithRedux(<ImportDatastoreViaGit onOpenModal={mockOnOpenModal} disableSubmit={false} />);

    const button = screen.getByRole('button', { name: /Import from Git Repository/i });
    expect(button).not.toBeDisabled();
  });
});

// Made with Bob
