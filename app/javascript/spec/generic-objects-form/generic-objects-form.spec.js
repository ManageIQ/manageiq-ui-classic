import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';

import '../helpers/miqSparkle';
import { renderWithRedux } from '../helpers/mountForm';
import GenericObjectForm from '../../components/generic-objects-form/index';

describe('Generic Object Form Component', () => {
  const api = {
    data: {
      allowed_types: {
        boolean: 'Boolean',
        string: 'String',
      },
      allowed_association_types: {
        BottleneckEvent: 'Bottleneck Event',
        ContainerProjectPerformance: 'Performance - Container Project',
      },
    },
  };

  const genericObject = {
    description: 'this is a test',
    name: 'Generic Object',
    picture: { image_href: 'http://localhost:3000/pictures/52.png' },
    properties: {
      associations: {
        bottle_neck: 'BottleneckEvent',
        project: 'ContainerProjectPerformance',
      },
      attributes: { this_is_a_string: 'string' },
      methods: ['method'],
    },
  };

  const genericObject2 = {
    description: 'this is a test',
    name: 'Generic Object',
    properties: {
      associations: {
        bottle_neck: 'BottleneckEvent',
        project: 'ContainerProjectPerformance',
      },
      attributes: { this_is_a_string: 'string' },
      methods: ['method'],
    },
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render adding a new generic object', async() => {
    fetchMock.once('/api/generic_object_definitions/', api);

    const { container } = renderWithRedux(<GenericObjectForm />);

    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(1);
    });

    expect(container).toMatchSnapshot();
  });

  it('should render editing a generic object with an existing image', async() => {
    fetchMock.once('/api/generic_object_definitions/', api);
    fetchMock.get(
      '/api/generic_object_definitions/1?attributes=picture.image_href',
      genericObject
    );

    const { container } = renderWithRedux(<GenericObjectForm recordId="1" />);

    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(2);
    });

    expect(container).toMatchSnapshot();
  });

  it('should render editing a generic object without an existing image', async() => {
    fetchMock.once('/api/generic_object_definitions/', api);
    fetchMock.get(
      '/api/generic_object_definitions/1?attributes=picture.image_href',
      genericObject2
    );

    const { container } = renderWithRedux(<GenericObjectForm recordId="1" />);

    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(2);
    });

    expect(container).toMatchSnapshot();
  });
});
