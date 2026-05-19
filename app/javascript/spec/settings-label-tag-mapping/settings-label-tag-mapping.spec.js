import React from 'react';
import { render } from '@testing-library/react';
import SettingsLabelTagMapping from '../../components/settings-label-tag-mapping';
import { settingsLabelTagMappingData } from './data';

describe('SettingsLabelTagMapping component', () => {
  it('should render a SettingsLabelTagMapping component without warning', () => {
    const { headers, rows } = settingsLabelTagMappingData();
    const { container } = render(
      <SettingsLabelTagMapping
        initialData={{ headers, rows, warning: false }}
      />
    );

    expect(container).toMatchSnapshot();
    expect(
      container.querySelector('div.settings-label-tag-mappings-list')
    ).toBeInTheDocument();
    expect(
      container.querySelector('div.tab-content-header-actions')
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        'div.tab-content-header-actions button[type="button"]'
      )
    ).toBeInTheDocument();
    expect(
      container.querySelector('div.miq-custom-tab-content-notification')
    ).not.toBeInTheDocument();

    const tableButtons = container.querySelectorAll(
      'button[type="button"].miq-data-table-button'
    );
    expect(tableButtons).toHaveLength(rows.length);
  });

  it('should render a SettingsLabelTagMapping component with warning', () => {
    const { headers, rows } = settingsLabelTagMappingData();
    const { container } = render(
      <SettingsLabelTagMapping initialData={{ headers, rows, warning: true }} />
    );

    expect(container).toMatchSnapshot();
    expect(
      container.querySelector('div.settings-label-tag-mappings-list')
    ).toBeInTheDocument();
    expect(
      container.querySelector('div.tab-content-header-actions')
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        'div.tab-content-header-actions button[type="button"]'
      )
    ).toBeInTheDocument();
    expect(
      container.querySelector('div.miq-custom-tab-content-notification')
    ).toBeInTheDocument();

    const tableButtons = container.querySelectorAll(
      'button[type="button"].miq-data-table-button'
    );
    expect(tableButtons).toHaveLength(rows.length);
  });
});
