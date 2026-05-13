import React from 'react';
import { render } from '@testing-library/react';
import SettingsCompanyCategories from '../../components/settings-company-categories';
import { settingsCompanyCategoriesData } from './data';

describe('SettingsCompanyCategories component', () => {
  it('should render a SettingsCompanyCategories component', () => {
    const { headers, rows, pageTitle } = settingsCompanyCategoriesData();
    const { container } = render(
      <SettingsCompanyCategories initialData={{ headers, rows, pageTitle }} />
    );

    expect(container).toMatchSnapshot();
    expect(
      container.querySelector('div.settings-company-categories-list')
    ).toBeInTheDocument();
    expect(
      container.querySelector('div.tab-content-header-actions')
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        'div.tab-content-header-actions button[type="button"]'
      )
    ).toBeInTheDocument();

    const tableButtons = container.querySelectorAll(
      'div.settings-company-categories-list button[type="button"].miq-data-table-button'
    );
    expect(tableButtons).toHaveLength(rows.length);
  });
});
