import React from 'react';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils'; // Import act
import CopyCatalogForm from '../../components/copy-catalog-form/copy-catalog-form';
import '../helpers/miqAjaxButton';
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

    fetchMock.getOnce('/catalog/servicetemplates_names', { names: ['Template1', 'Template2'] });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('should handle cancel', async () => {
    const wrapper = mount(<CopyCatalogForm {...initialProps} />);

    await act(async() => {
      await new Promise((resolve) => setImmediate(resolve));
      wrapper.update();
      wrapper.find('button.bx--btn--secondary').first().simulate('click');
    });

    expect(spyMiqAjaxButton).toHaveBeenCalledWith(cancelUrl);
  });

  it('should handle submit', async() => {
    const postData = '{"id":"10000000000000","name":"Copy of Template1","copy_tags":false}';
    fetchMock.postOnce('/catalog/save_copy_catalog', {});

    const wrapper = mount(<CopyCatalogForm {...initialProps} />);

    await act(async() => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for the form to initialize
      wrapper.update();
      wrapper.find('form').simulate('submit');
      await new Promise((resolve) => setImmediate(resolve)); // Wait for any asynchronous actions triggered by submit
    });

    expect(spyMiqAjaxButton).toHaveBeenCalledWith(copySavedUrl);
    expect(fetchMock.lastOptions().body).toEqual(postData);
  });
});
