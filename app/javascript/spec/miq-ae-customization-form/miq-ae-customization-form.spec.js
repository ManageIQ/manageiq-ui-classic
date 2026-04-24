import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import MiqAeCustomization from '../../components/miq-ae-customization';
import { renderWithRedux } from '../helpers/mountForm';

describe('MiqAeCustomization Form Component', () => {
  const customizationMockData = [
    {
      href: `/miq_ae_customization/old_dialogs_edit/2/`,
      id: '2',
      description: 'Configured System Provision',
    },
  ];

  const MiqAeCustomizationEditData = {
    id: '40',
    name: 'test',
    description: 'test description',
    dialogType: 'Configured System Provision',
    content: '---\n test content',
  };

  const MiqAeCustomizationCopyData = {
    name: 'test copy',
    description: 'test copy description',
    dialogType: 'Configured System Provision',
    content: '---\n test copy content',
  };

  const dialogTypes = [
    ['Configured System Provision', 'MiqProvisionConfiguredSystemWorkflow'],
    ['Physical Server Provision', 'PhysicalServerProvisionWorkflow'],
    ['VM Migrate', 'VmMigrateWorkflow'],
    ['VM Provision', 'MiqProvisionWorkflow'],
  ];

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render add dialog form correctly', async() => {
    fetchMock.get(`/miq_ae_customization/old_dialogs_new?&expand=resources/`, customizationMockData);

    const { container } = renderWithRedux(<MiqAeCustomization dialogRecord={{}} dialogTypes={dialogTypes} />);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render edit dialog form correctly', async() => {
    fetchMock.get(`/miq_ae_customization/old_dialogs_edit_get/${MiqAeCustomizationEditData.id}/`, MiqAeCustomizationEditData);

    const { container } = renderWithRedux(<MiqAeCustomization dialogRecord={MiqAeCustomizationEditData} dialogTypes={dialogTypes} />);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render copy dialog form correctly', async() => {
    fetchMock.get(`/miq_ae_customization/old_dialogs_copy?&expand=resources`, customizationMockData);

    const { container } = renderWithRedux(<MiqAeCustomization dialogRecord={MiqAeCustomizationCopyData} dialogTypes={dialogTypes} />);

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
