import React from 'react';
import fetchMock from 'fetch-mock';
import { screen } from '@testing-library/react';
import PxeImageEditForm from '../../components/pxe-image-edit-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('PxeImageEditForm', () => {
  const defaultProps = {
    recordId: '123',
    imgType: 1,
    defaultForWindows: false,
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
    const { container } = renderWithRedux(<PxeImageEditForm {...defaultProps} />);
    expect(container.querySelector('.pxe-image-form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should return null when pxeImageTypes is not an array', () => {
    const { container } = renderWithRedux(<PxeImageEditForm {...defaultProps} pxeImageTypes={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render with defaultForWindows prop', () => {
    const { container } = renderWithRedux(<PxeImageEditForm {...defaultProps} defaultForWindows />);
    expect(container.querySelector('.pxe-image-form')).toBeInTheDocument();
  });
});
