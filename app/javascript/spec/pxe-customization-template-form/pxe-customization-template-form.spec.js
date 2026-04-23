import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor, cleanup } from '@testing-library/react';
import '../helpers/miqSparkle';
import { renderWithRedux } from '../helpers/mountForm';
import PxeCustomizationTemplateForm from '../../components/pxe-customization-template-form/index';

describe('Pxe Customization Template Form Component', () => {
  const api = {
    resources: [
      {
        name: 'pxe-image-type1',
        id: '1',
      },
      {
        name: 'pxe-image-type2',
        id: '2',
      },
    ],
  };

  const editOrCopyObject = {
    name: 'foo',
    description: 'bar',
    pxe_image_type_id: '1',
    type: 'CustomizationTemplateKickstart',
    script: 'write script here',
  };

  afterEach(() => {
    cleanup();
    fetchMock.restore();
    jest.clearAllMocks();
  });

  it('should render adding a new pxe customization template', async() => {
    fetchMock.get('/api/pxe_image_types?attributes=name,id&expand=resources', api);

    const { container } = renderWithRedux(<PxeCustomizationTemplateForm />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(2);
    expect(container).toMatchSnapshot();
  });

  it('should render editing a pxe customization template', async() => {
    fetchMock.get('/api/pxe_image_types?attributes=name,id&expand=resources', api);
    fetchMock.get('/api/customization_templates/1', editOrCopyObject);

    const { container } = renderWithRedux(<PxeCustomizationTemplateForm recordId="1" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(3);
    expect(container).toMatchSnapshot();
  });

  it('should render copying a pxe customization template', async() => {
    fetchMock.get('/api/pxe_image_types?attributes=name,id&expand=resources', api);
    fetchMock.get('/api/customization_templates/1', editOrCopyObject);

    const { container } = renderWithRedux(<PxeCustomizationTemplateForm copy="1" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    expect(fetchMock.calls()).toHaveLength(3);
    expect(container).toMatchSnapshot();
  });
});
