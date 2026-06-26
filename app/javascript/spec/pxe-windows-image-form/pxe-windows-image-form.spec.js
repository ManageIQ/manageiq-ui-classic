import React from 'react';
import fetchMock from 'fetch-mock';
import { screen } from '@testing-library/react';
import PxeWindowsImageEditForm from '../../components/pxe-windows-image-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('PxeWindowsImageEditForm', () => {
  const defaultProps = {
    recordId: '123',
    imgType: 1,
    pxeImageTypes: [
      ['Linux', 1],
      ['Windows', 2],
      ['ESXi', 3],
    ],
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render the form when pxeImageTypes is valid', () => {
    const { container } = renderWithRedux(<PxeWindowsImageEditForm {...defaultProps} />);
    expect(container.querySelector('.pxe-windows-image-form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should return null when pxeImageTypes is not an array', () => {
    const { container } = renderWithRedux(<PxeWindowsImageEditForm {...defaultProps} pxeImageTypes={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render with imgType prop', () => {
    const { container } = renderWithRedux(<PxeWindowsImageEditForm {...defaultProps} imgType={2} />);
    expect(container.querySelector('.pxe-windows-image-form')).toBeInTheDocument();
  });
});
