import fetchMock from 'fetch-mock';
import { asyncValidator } from '../../components/catalog-form/catalog-form.schema';

describe('catalog form - promise validator', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('returns error message when name is taken', () => {
    fetchMock.getOnce('/api/service_catalogs?expand=resources&filter[]=name=%27a1%27', {
      resources: [
        { name: 'a1', id: '1' },
      ],
    });

    return expect(asyncValidator('a1', '2')).rejects.toEqual(__('Name has already been taken'));
  });

  it('returns nothing when name is taken but by the same catalog', () => {
    fetchMock.getOnce('/api/service_catalogs?expand=resources&filter[]=name=%27a1%27', {
      resources: [
        { name: 'a1', id: '1'},
      ],
    });

    return asyncValidator('a1', '1').then(data => expect(data).toEqual(undefined));
  });

  it('returns error message when name is undefined', () => {
    fetchMock.getOnce('/api/service_catalogs?expand=resources&filter[]=name=%27%27', {
      resources: [],
    });

    return expect(asyncValidator(undefined, '1')).rejects.toEqual(__("Name can't be blank"));
  });

  it('returns nothing when passes', () => {
    fetchMock.getOnce('/api/service_catalogs?expand=resources&filter[]=name=%27a1%27', {
      resources: [],
    });

    return asyncValidator('a1', '1').then(data => expect(data).toEqual(undefined));
  });
});
