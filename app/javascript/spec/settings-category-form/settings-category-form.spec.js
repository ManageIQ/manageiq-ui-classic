import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';

import { renderWithRedux } from '../helpers/mountForm';
import SettingsCategoryForm from '../../components/settings-category-form';

describe('SettingsCategoryForm Component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });
  it('should render a new SettingsCategoryForm form', async() => {
    const { container } = renderWithRedux(
      <SettingsCategoryForm recordId="new" />
    );
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render edit SettingsCategoryForm', async() => {
    fetchMock.getOnce('/api/categories/100', {});
    const { container } = renderWithRedux(
      <SettingsCategoryForm recordId="100" />
    );
    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(1);
    });
    expect(fetchMock.called('/api/categories/100')).toBe(true);
    expect(container).toMatchSnapshot();
  });
});
