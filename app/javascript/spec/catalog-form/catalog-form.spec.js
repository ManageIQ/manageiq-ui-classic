import React from 'react';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import CatalogForm from '../../components/catalog-form/catalog-form';
import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';
import '../helpers/addFlash';

describe('Catalog form component', () => {
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyMiqAjaxButton;

  const resources = [
    { href: 'http://localhost:3000/api/service_templates/44', name: 'template 44' },
    { href: 'http://localhost:3000/api/service_templates/10', name: 'template 10' },
  ];

  const assignedResources = {
    name: 'DROGO',
    description: 'This is a DROGO!',
    service_templates: {
      resources: [
        { href: 'http://localhost:3000/api/service_templates/2', name: 'template 2' },
        { href: 'http://localhost:3000/api/service_templates/6', name: 'template 6' },
      ],
    },
  };

  const originalRightValues = [
    { key: 'http://localhost:3000/api/service_templates/2', label: 'template 2' },
    { key: 'http://localhost:3000/api/service_templates/6', label: 'template 6' },
  ];

  const rightValues = [
    'http://localhost:3000/api/service_templates/2',
    'http://localhost:3000/api/service_templates/6',
  ];

  const urlFreeTemplates = '/api/service_templates?expand=resources&filter[]=service_template_catalog_id=null';
  const urlTemplates = '/api/service_catalogs/1001?expand=service_templates';


  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    spyMiqAjaxButton = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyMiqAjaxButton.mockRestore();
  });

  it('should render add variant form', (done) => {
    fetchMock.getOnce(urlFreeTemplates, { resources });
    const wrapper = shallow(<CatalogForm />);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper.dive())).toMatchSnapshot();
      done();
    });
  });

  it('should render edit variant form', (done) => {
    fetchMock.getOnce(urlFreeTemplates, { resources })
      .getOnce(urlTemplates, assignedResources);
    const wrapper = shallow(<CatalogForm catalogId="1001" />);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper.dive())).toMatchSnapshot();
      done();
    });
  });

  it('should call cancel callback ', (done) => {
    fetchMock.getOnce(urlFreeTemplates, { resources })
      .getOnce(urlTemplates, assignedResources);
    const wrapper = mount(<CatalogForm catalogId="1001" />);
    const url = '/catalog/st_catalog_edit/1001?button=cancel';

    setImmediate(() => {
      wrapper.update();
      const button = wrapper.find('button').last();
      button.simulate('click');
      expect(spyMiqAjaxButton).toHaveBeenCalledWith(url);
      done();
    });
  });

  it('should request data after mount and stop loading when creating new catalog', (done) => {
    fetchMock.getOnce(urlFreeTemplates, { resources });
    const wrapper = mount(<CatalogForm />);

    expect(submitSpyMiqSparkleOn).toHaveBeenCalled();
    expect(fetchMock.called(urlFreeTemplates)).toBe(true);

    setImmediate(() => {
      wrapper.update();
      expect(wrapper.state().isLoaded).toBe(true);
      expect(submitSpyMiqSparkleOff).toHaveBeenCalled();
      done();
    });
  });

  it('should request data after mount and set to state when editing catalog', (done) => {
    fetchMock
      .getOnce(urlFreeTemplates, { resources })
      .getOnce(urlTemplates, assignedResources);
    const wrapper = mount(<CatalogForm catalogId="1001" />);

    expect(submitSpyMiqSparkleOn).toHaveBeenCalled();
    expect(fetchMock.called(urlFreeTemplates)).toBe(true);
    expect(fetchMock.called(urlTemplates)).toBe(true);

    setImmediate(() => {
      wrapper.update();
      expect(wrapper.state().initialValues).toEqual({
        name: 'DROGO',
        description: 'This is a DROGO!',
        service_templates: rightValues,
      });
      expect(wrapper.state().originalRightValues).toEqual(originalRightValues);
      expect(submitSpyMiqSparkleOff).toHaveBeenCalled();
      done();
    });
  });

  it('should not submit values when form is not valid', (done) => {
    fetchMock.getOnce(urlFreeTemplates, { resources });
    const wrapper = mount(<CatalogForm />);

    setImmediate(() => {
      wrapper.update();
      const spy = jest.spyOn(wrapper.instance(), 'submitValues');
      const button = wrapper.find('button').first();
      button.simulate('click');
      expect(spy).toHaveBeenCalledTimes(0);
      done();
    });
  });

  it('submit post data to API when adding new form', (done) => {
    const urlCreate = '/api/service_catalogs';
    fetchMock.getOnce(urlFreeTemplates, { resources });
    fetchMock.postOnce(urlCreate, {});

    const wrapper = mount(<CatalogForm />);
    const values = {
      name: 'Some name',
      description: '11',
      service_templates: [
        { key: 'http://localhost:3000/api/service_templates/44', label: 'template 44' },
      ],
    };
    wrapper.instance().submitValues(values).then(() => {
      expect(fetchMock.called(urlCreate)).toBe(true);
      expect(spyMiqAjaxButton).toHaveBeenCalledWith('/catalog/st_catalog_edit?button=add', { name: 'Some name' });
      done();
    });
  });

  it('submit post data to API when adding new form and get error back', (done) => {
    const urlCreate = '/api/service_catalogs';
    const returnObject = {
      status: 400,
      body: {
        error: { message: 'something' },
      },
    };
    fetchMock.getOnce(urlFreeTemplates, { resources });
    fetchMock.postOnce(urlCreate, returnObject);

    const wrapper = mount(<CatalogForm />);
    const spyHandleError = jest.spyOn(wrapper.instance(), 'handleError');

    expect(spyHandleError).not.toHaveBeenCalled();

    const values = {
      name: 'Some name',
      description: '11',
      service_templates: [
        { key: 'http://localhost:3000/api/service_templates/44', label: 'template 44' },
      ],
    };

    return wrapper.instance().submitValues(values).then(() => {
      expect(spyHandleError).toHaveBeenCalledWith(expect.objectContaining({ data: returnObject.body, status: returnObject.status }));
      done();
    });
  });

  it('submit post data to API when editing form and get error back', (done) => {
    const returnObject = {
      status: 500,
      body: {
        error: { message: 'something' },
      },
    };
    const apiBase = '/api/service_catalogs/1001';

    fetchMock.getOnce(urlFreeTemplates, { resources });
    fetchMock.getOnce('/api/service_catalogs/1001?expand=service_templates', {});
    fetchMock.postOnce(apiBase, returnObject);

    const wrapper = mount(<CatalogForm catalogId="1001" />);
    const spyHandleError = jest.spyOn(wrapper.instance(), 'handleError');

    wrapper.instance().setState({ originalRightValues: [] });

    expect(spyHandleError).not.toHaveBeenCalled();

    const values = {
      name: 'Some name',
      description: '11',
      service_templates: [],
    };

    return wrapper.instance().submitValues(values).then(() => {
      expect(spyHandleError).toHaveBeenCalledWith(expect.objectContaining({ data: returnObject.body, status: returnObject.status }));
      done();
    });
  });

  it('submit post data to API when editing form and switching items in lists', (done) => {
    const apiBase = '/api/service_catalogs/1001';
    fetchMock.get(urlFreeTemplates, { resources });
    fetchMock.postOnce(apiBase, { id: '1001' });
    fetchMock.post(`${apiBase}/service_templates`, {});
    fetchMock.get(urlTemplates, assignedResources);

    const wrapper = mount(<CatalogForm catalogId="1001" />);

    const values = {
      name: 'Some name',
      description: '11',
      service_templates: [
        { key: 'http://localhost:3000/api/service_templates/44', label: 'template 44' },
      ],
    };

    wrapper.instance().setState({ originalRightValues });

    wrapper.instance().submitValues(values).then(() => {
      expect(fetchMock.called(apiBase)).toBe(true);
      expect(fetchMock.called(`${apiBase}/service_templates`)).toBe(true);
      expect(spyMiqAjaxButton).toHaveBeenCalledWith('/catalog/st_catalog_edit/1001?button=save', { name: 'Some name' });
      done();
    });
  });

  it('submit post data to API when editing form without switching items in lists', (done) => {
    const apiBase = '/api/service_catalogs/1001';
    fetchMock.get(urlFreeTemplates, { resources });
    fetchMock.postOnce(apiBase, { id: '1001' });
    fetchMock.post(`${apiBase}/service_templates`, {});
    fetchMock.get(urlTemplates, assignedResources);

    const wrapper = mount(<CatalogForm catalogId="1001" />);

    const values = {
      name: 'Some name',
      description: '11',
      service_templates: rightValues,
    };

    wrapper.instance().setState({ originalRightValues });

    wrapper.instance().submitValues(values).then(() => {
      expect(fetchMock.called(apiBase)).toBe(true);
      expect(fetchMock.called(`${apiBase}/service_templates`)).toBe(false);
      expect(spyMiqAjaxButton).toHaveBeenCalledWith('/catalog/st_catalog_edit/1001?button=save', { name: 'Some name' });
      done();
    });
  });

  describe('#handleError', () => {
    it('should not parse duplicate name error', () => {
      const error = {
        data: { error: { message: 'This is some nice error' } },
      };
      const wrapper = mount(<CatalogForm catalogId="1001" />);

      expect(wrapper.instance().handleError(error)).toEqual(error.data.error.message);
    });

    it('should parse duplicate name error', () => {
      const error = {
        data: { error: { message: 'Service catalog: Name has already been taken' } },
      };
      const wrapper = mount(<CatalogForm catalogId="1001" />);

      expect(wrapper.instance().handleError(error)).toEqual(__('Name has already been taken'));
    });
  });
});
