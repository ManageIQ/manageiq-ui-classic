import React from 'react';
import fetchMock from 'fetch-mock';
import CopyCatalogForm from '../../components/copy-catalog-form/copy-catalog-form';

import '../helpers/miqAjaxButton';
import MiqFormRenderer from '../../forms/data-driven-form';
import { mount } from '../helpers/mountForm';

describe('Copy catalog form', () => {
  let initialProps;
  let cancelUrl;
  let copySavedUrl;
  let spyMiqAjaxButton;

  beforeEach(() => {
    initialProps = {
      catalogId: '10000000000000',
      originName: 'Template1',
    };

    cancelUrl = `/catalog/servicetemplate_copy_cancel/${initialProps.catalogId}`;
    copySavedUrl = '/catalog/servicetemplate_copy_saved';
    spyMiqAjaxButton = jest.spyOn(window, 'miqAjaxButton');

    fetchMock
      .getOnce('/catalog/servicetemplates_names', { names: ['Template1', 'Template2'] });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('should render correctly and set initialValue', (done) => {
    const wrapper = mount(<CopyCatalogForm {...initialProps} />);

    setImmediate(() => {
      wrapper.update();
      expect(wrapper.find(MiqFormRenderer)).toHaveLength(1);
      expect(wrapper.find('input[name="name"]').instance().value).toEqual('Copy of Template1');
      expect(wrapper.find('input[name="copy_tags"]').instance().value).toEqual('false');

      done();
    });
  });

  it('should handle cancel', (done) => {
    const wrapper = mount(<CopyCatalogForm {...initialProps} />);

    setImmediate(() => {
      wrapper.update();
      wrapper.find('button').last().simulate('click'); // click on cancel
      expect(spyMiqAjaxButton).toHaveBeenCalledWith(cancelUrl);
      done();
    });
  });

  it('should handle submit', (done) => {
    const postData = '{"id":"10000000000000","name":"Copy of Template1","copy_tags":false}';
    fetchMock
      .postOnce('/catalog/save_copy_catalog', {})

    const wrapper = mount(<CopyCatalogForm {...initialProps} />);

    setTimeout(() => {

      wrapper.update();
      setTimeout(() => {
        wrapper.find('form').simulate('submit');
        setImmediate(() => {
          expect(spyMiqAjaxButton).toHaveBeenCalledWith(copySavedUrl);
          expect(fetchMock.lastOptions().body).toEqual(postData);
          done();
        });
      }, 1000);
    }, 1000);
  });

  it('should handle submit with copy_tags checked', (done) => {
    const postData = '{"id":"10000000000000","name":"Copy of Template1","copy_tags":true}';
    const wrapper = mount(<CopyCatalogForm {...initialProps} />);
    fetchMock
      .postOnce('/catalog/save_copy_catalog', {})

    setImmediate(() => {
      wrapper.update();
      const check_box = wrapper.find('input[name="copy_tags"]');
      expect(check_box.instance().value).toEqual('false');
      check_box.instance().checked = true;
      check_box.simulate('change');

      expect(check_box.instance().value).toEqual('true');

      done();
    });

    setTimeout(() => {
      setTimeout(() => {
        wrapper.find('button').first().simulate('click');
        setImmediate(() => {
          expect(spyMiqAjaxButton).toHaveBeenCalledWith(copySavedUrl);
          expect(fetchMock.lastOptions().body).toEqual(postData);
          done();
        });
      }, 1000);
    }, 1000);
  });
});
