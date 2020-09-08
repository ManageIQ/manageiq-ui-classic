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
});
