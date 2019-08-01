import React from 'react';
import configureStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import RemoveCatalogItemModal from '../../components/remove-catalog-item-modal';
import { removeCatalogItems } from '../../components/remove-catalog-item-modal';
import '../helpers/addFlash';
import '../helpers/miqFlashLater';
import '../helpers/miqSparkle';
import '../helpers/sprintf';

describe('RemoveCatalogItemModal', () => {
  const item1 = 123;
  const item2 = 456;
  const url1 = `/api/service_templates/${item1}?attributes=services`;
  const url2 = `/api/service_templates/${item2}?attributes=services`;
  const apiResponse1 = {id: item1, name: 'name123', service_type: 'atomic', services: []};
  const apiResponse2 = {id: item2, name: 'name456', service_type: 'atomic', services: []};
  const store = configureStore()({});
  const dispatchMock = jest.spyOn(store, 'dispatch');

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

  it('should correctly set component state for single catalog item', (done) => {
    fetchMock.getOnce(url1, apiResponse1);
    const component = mount(<RemoveCatalogItemModal store={store} recordId={item1} />);
    expect(fetchMock.called(url1)).toBe(true);

    setImmediate(() => {
      component.update();
      expect(component.childAt(0).state()).toEqual({data: [apiResponse1], loaded: true});
      done();
    });
  });

  it('should correctly set component state for multiple catalog items', (done) => {
    fetchMock.getOnce(url1, apiResponse1).getOnce(url2, apiResponse2);
    const component = mount(<RemoveCatalogItemModal store={store} gridChecks={[item1, item2]} />);
    expect(fetchMock.called(url1)).toBe(true);
    expect(fetchMock.called(url2)).toBe(true);

    setImmediate(() => {
      component.update();
      expect(component.childAt(0).state()).toEqual({data: [apiResponse1, apiResponse2], loaded: true});
      done();
    });
  });

  it('should correctly render modal for single catalog item', (done) => {
    fetchMock.getOnce(url1, apiResponse1);
    const component = shallow(<RemoveCatalogItemModal store={store} recordId={item1} />).dive();

    setImmediate(() => {
      component.update();
      expect(toJson(component)).toMatchSnapshot();
      done();
    });
  });

  it('should correctly render modal for multiple catalog items', (done) => {
    fetchMock.getOnce(url1, apiResponse1).getOnce(url2, apiResponse2);
    const component = shallow(<RemoveCatalogItemModal store={store} gridChecks={[item1, item2]} />).dive();

    setImmediate(() => {
      component.update();
      expect(toJson(component)).toMatchSnapshot();
      done();
    });
  });

  it ('correctly initializes buttons', (done) => {
    fetchMock.getOnce(url1, apiResponse1);
    const component = mount(<RemoveCatalogItemModal store={store} recordId={item1} />);
    
    setImmediate(() => {
      component.update();
      expect(dispatchMock).toHaveBeenCalledWith({type: 'FormButtons.init', payload: {"addClicked": expect.anything(), "newRecord": true, "pristine": true}});
      expect(dispatchMock).toHaveBeenCalledWith({type: 'FormButtons.customLabel', payload: 'Delete'});
      expect(dispatchMock).toHaveBeenCalledWith({type: 'FormButtons.saveable', payload: true});
      done();
    });
  });

  it ('removeCatalogItems() works correctly', (done) => {
    const postUrl = `/api/service_templates/${item1}`;
    fetchMock.getOnce(url1, apiResponse1);
    fetchMock.postOnce(postUrl, {action: 'delete'});
    const component = mount(<RemoveCatalogItemModal store={store} recordId={item1} />);

    setImmediate(() => {
      removeCatalogItems(component.childAt(0).state().data);
      expect(fetchMock.called(url1)).toBe(true);
      expect(fetchMock.called(postUrl)).toBe(true);
      done();
    });
  });
});
