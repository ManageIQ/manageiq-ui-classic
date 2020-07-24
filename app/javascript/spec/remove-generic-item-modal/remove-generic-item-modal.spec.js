import React from 'react';
import configureStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import RemoveGenericItemModal from '../../components/remove-generic-item-modal';
import { removeItems } from '../../components/remove-generic-item-modal';
import '../helpers/addFlash';
import '../helpers/miqFlashLater';
import '../helpers/miqSparkle';
import '../helpers/sprintf';

describe('RemoveGenericItemModal', () => {
  const item1 = 123;
  const item2 = 456;
  const url1 = `/api/authentications/${item1}`;
  const url2 = `/api/authentications/${item2}`;
  const apiResponse1 = {id: item1, name: 'name123'};
  const apiResponse2 = {id: item2, name: 'name456'};
  const store = configureStore()({});
  const dispatchMock = jest.spyOn(store, 'dispatch');
  const modalData = {api_url: 'authentications', async_delete: true, redirect_url: '/go/home', modal_text: 'TEXT'};

  beforeEach(() => {
    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
        value: {
           href: 'http://example.com'
        },
        writable: true
    });
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('should correctly set component state for single item', (done) => {
    fetchMock.getOnce(url1, apiResponse1);
    const component = mount(<RemoveGenericItemModal store={store} recordId={item1} modalData={modalData} />);
    expect(fetchMock.called(url1)).toBe(true);

    setImmediate(() => {
      component.update();
      expect(component.childAt(0).state()).toEqual({data: [apiResponse1], loaded: true});
      done();
    });
  });

  it('should correctly set component state for multiple items', (done) => {
    fetchMock.getOnce(url1, apiResponse1).getOnce(url2, apiResponse2);
    const component = mount(<RemoveGenericItemModal store={store} gridChecks={[item1, item2]} modalData={modalData} />);
    expect(fetchMock.called(url1)).toBe(true);
    expect(fetchMock.called(url2)).toBe(true);

    setImmediate(() => {
      component.update();
      expect(component.childAt(0).state()).toEqual({data: [apiResponse1, apiResponse2], loaded: true});
      done();
    });
  });

  it('should correctly render modal for single item', (done) => {
    fetchMock.getOnce(url1, apiResponse1);
    const component = shallow(<RemoveGenericItemModal store={store} recordId={item1} modalData={modalData} />).dive();

    setImmediate(() => {
      component.update();
      expect(toJson(component)).toMatchSnapshot();
      done();
    });
  });

  it('should correctly render modal for multiple items', (done) => {
    fetchMock.getOnce(url1, apiResponse1).getOnce(url2, apiResponse2);
    const component = shallow(<RemoveGenericItemModal store={store} gridChecks={[item1, item2]} modalData={modalData} />).dive();

    setImmediate(() => {
      component.update();
      expect(toJson(component)).toMatchSnapshot();
      done();
    });
  });

  it ('correctly initializes buttons', (done) => {
    fetchMock.getOnce(url1, apiResponse1);
    const component = mount(<RemoveGenericItemModal store={store} recordId={item1} modalData={modalData} />);

    setImmediate(() => {
      component.update();
      expect(dispatchMock).toHaveBeenCalledWith({type: 'FormButtons.init', payload: {"addClicked": expect.anything(), "newRecord": true, "pristine": true}});
      expect(dispatchMock).toHaveBeenCalledWith({type: 'FormButtons.customLabel', payload: 'Delete'});
      expect(dispatchMock).toHaveBeenCalledWith({type: 'FormButtons.saveable', payload: true});
      done();
    });
  });

  it ('removeItems() works correctly', (done) => {
    const postUrl = `/api/authentications/${item1}`;
    fetchMock.getOnce(url1, apiResponse1);
    fetchMock.postOnce(postUrl, {action: 'delete'});
    const component = mount(<RemoveGenericItemModal store={store} recordId={item1} modalData={modalData} />);

    setImmediate(() => {
      removeItems(component.childAt(0).state().data, {
        apiUrl: modalData.api_url,
        asyncDelete: modalData.async_delete,
        redirectUrl: modalData.redirect_url,
      });
      expect(fetchMock.called(url1)).toBe(true);
      expect(fetchMock.called(postUrl)).toBe(true);
      done();
    });
  });
});
