/* eslint-disable jest/no-done-callback */
import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import DatastoreForm from '../../components/data-store-form';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

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
        domain: true,
        namespacePath: '',
        namespaceId: 'new',
        nameReadOnly: false,
        descReadOnly: false,
      };
      const wrapper = shallow(
        <DatastoreForm
          domain={props.domain}
          namespacePath={props.namespacePath}
          namespaceId={props.namespaceId}
          nameReadOnly={props.nameReadOnly}
          descReadOnly={props.descReadOnly}
        />
      );
      wrapper.update();
      fetchMock.postOnce('/miq_ae_class/create_namespace/new?button=add', data);
      expect(wrapper.find('input[name="namespacePath"]')).toHaveLength(0);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render the Domain editing form', async(done) => {
      const props = {
        domain: true,
        namespacePath: '',
        namespaceId: 5630,
        nameReadOnly: false,
        descReadOnly: false,
      };
      fetchMock.getOnce(`/miq_ae_class/namespace/${props.namespaceId}`, {});
      fetchMock.postOnce(`/miq_ae_class/namespace/${props.namespaceId}`, data);
      let wrapper;
      await act(async() => {
        wrapper = mount(
          <DatastoreForm
            domain={props.domain}
            namespacePath={props.namespacePath}
            namespaceId={props.namespaceId}
            nameReadOnly={props.nameReadOnly}
            descReadOnly={props.descReadOnly}
          />
        );
      });
      wrapper.update();
      expect(fetchMock.called(`/miq_ae_class/namespace/${props.namespaceId}`)).toBe(true);
      expect(wrapper.find('input[name="namespacePath"]')).toHaveLength(0);
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  describe('Datastore namespace form component', () => {
    it('should render the Namespace adding form', () => {
      const props = {
        domain: false,
        namespacePath: '/test/infrastructure',
        namespaceId: 'new',
        nameReadOnly: false,
        descReadOnly: false,
      };
      const wrapper = shallow(
        <DatastoreForm
          domain={props.domain}
          namespacePath={props.namespacePath}
          namespaceId={props.namespaceId}
          nameReadOnly={props.nameReadOnly}
          descReadOnly={props.descReadOnly}
        />
      );
      wrapper.update();
      fetchMock.postOnce('/miq_ae_class/create_namespace/new?button=add', data);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render the Namespace editing form', async(done) => {
      const props = {
        domain: false,
        namespacePath: '/test/infrastructure',
        namespaceId: 5631,
        nameReadOnly: false,
        descReadOnly: false,
      };
      fetchMock.getOnce(`/miq_ae_class/namespace/${props.namespaceId}`, data);
      fetchMock.postOnce(`/miq_ae_class/update_namespace/${props.namespaceId}?button=save`, data);
      let wrapper;
      await act(async() => {
        wrapper = mount(
          <DatastoreForm
            domain={props.domain}
            namespacePath={props.namespacePath}
            namespaceId={props.namespaceId}
            nameReadOnly={props.nameReadOnly}
            descReadOnly={props.descReadOnly}
          />
        );
      });
      wrapper.update();
      expect(fetchMock.called(`/miq_ae_class/namespace/${props.namespaceId}`)).toBe(true);
      expect(wrapper.find('input[name="namespacePath"]').instance().value).toEqual(props.namespacePath);
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
