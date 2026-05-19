import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import DatastoreForm from '../../components/data-store-form';

import '../helpers/miqAjaxButton';

describe('Datastore form component', () => {
  let submitSpy;
  beforeEach(() => {
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });

  const data = {
    name: 'name',
    description: 'description',
    enabled: true,
  };

  describe('Datastore domain form component', () => {
    it('should render the Domain adding form', () => {
      const props = {
        type: 'domain',
        domain: true,
        namespacePath: '',
        namespaceId: 'new',
        nameReadOnly: false,
        descReadOnly: false,
      };
      const { container } = renderWithRedux(
        <DatastoreForm
          type={props.type}
          domain={props.domain}
          namespacePath={props.namespacePath}
          namespaceId={props.namespaceId}
          nameReadOnly={props.nameReadOnly}
          descReadOnly={props.descReadOnly}
        />
      );
      fetchMock.postOnce('/miq_ae_class/create_namespace/new?button=add', data);
      expect(container.querySelector('input[name="namespacePath"]')).toBeNull();
      expect(container).toMatchSnapshot();
    });

    it('should render the Domain editing form', async() => {
      const props = {
        type: 'domain',
        domain: true,
        namespacePath: '',
        namespaceId: 5630,
        nameReadOnly: false,
        descReadOnly: false,
      };
      fetchMock.getOnce(`/miq_ae_class/namespace/${props.namespaceId}`, {});
      fetchMock.postOnce(`/miq_ae_class/namespace/${props.namespaceId}`, data);

      const { container } = renderWithRedux(
        <DatastoreForm
          type={props.type}
          domain={props.domain}
          namespacePath={props.namespacePath}
          namespaceId={props.namespaceId}
          nameReadOnly={props.nameReadOnly}
          descReadOnly={props.descReadOnly}
        />
      );

      // Wait for the API call to complete
      await waitFor(() => {
        expect(
          fetchMock.called(`/miq_ae_class/namespace/${props.namespaceId}`)
        ).toBe(true);
      });
      expect(container.querySelector('input[name="namespacePath"]')).toBeNull();
      expect(container).toMatchSnapshot();
    });
  });

  describe('Datastore namespace form component', () => {
    it('should render the Namespace adding form', () => {
      const props = {
        type: 'namespace',
        domain: false,
        namespacePath: '/test/infrastructure',
        namespaceId: 'new',
        nameReadOnly: false,
        descReadOnly: false,
      };
      const { container } = renderWithRedux(
        <DatastoreForm
          type={props.type}
          domain={props.domain}
          namespacePath={props.namespacePath}
          namespaceId={props.namespaceId}
          nameReadOnly={props.nameReadOnly}
          descReadOnly={props.descReadOnly}
        />
      );
      fetchMock.postOnce('/miq_ae_class/create_namespace/new?button=add', data);
      expect(container).toMatchSnapshot();
    });

    it('should render the Namespace editing form', async() => {
      const props = {
        type: 'namespace',
        domain: false,
        namespacePath: '/test/infrastructure',
        namespaceId: 5631,
        nameReadOnly: false,
        descReadOnly: false,
      };
      fetchMock.getOnce(`/miq_ae_class/namespace/${props.namespaceId}`, data);
      fetchMock.postOnce(
        `/miq_ae_class/update_namespace/${props.namespaceId}?button=save`,
        data
      );

      const { container } = renderWithRedux(
        <DatastoreForm
          type={props.type}
          domain={props.domain}
          namespacePath={props.namespacePath}
          namespaceId={props.namespaceId}
          nameReadOnly={props.nameReadOnly}
          descReadOnly={props.descReadOnly}
        />
      );

      // Wait for the API call to complete
      await waitFor(() => {
        expect(
          fetchMock.called(`/miq_ae_class/namespace/${props.namespaceId}`)
        ).toBe(true);
      });
      const namespacePathInput = container.querySelector(
        'input[name="namespacePath"]'
      );
      expect(namespacePathInput).toBeInTheDocument();
      expect(namespacePathInput.value).toEqual(props.namespacePath);
      expect(container).toMatchSnapshot();
    });
  });
});
