import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import MiqAeClass from '../../components/miq-ae-class';

describe('MiqAeClass Form Component', () => {
  const classMockData = [
    {
      href: `/miq_ae_class/edit_class/2/`,
      id: 2,
      description: 'Configured System Provision',
    },
  ];

  const MiqAeClassEditData = {
    id: 40,
    name: 'test',
    display_name: 'test display name',
    description: 'test description',
  };

  const fqName = 'Sample FQ Name';

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render add class form correctly', async() => {
    fetchMock.get(`/miq_ae_class/new?&expand=resources/`, classMockData);

    const { container } = renderWithRedux(
      <MiqAeClass classRecord={{}} fqname={fqName} />
    );

    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render edit class form correctly', async() => {
    fetchMock.get(
      `/miq_ae_class/edit_class_react/${MiqAeClassEditData.id}?&expand=resources/`,
      classMockData
    );
    fetchMock.get(
      `/miq_ae_class/edit_class_record/${MiqAeClassEditData.id}/`,
      MiqAeClassEditData
    );

    const { container } = renderWithRedux(
      <MiqAeClass classRecord={MiqAeClassEditData} fqname={fqName} />
    );

    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
