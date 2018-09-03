import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import UsersDetail from '../user-detail';

describe('User detail component', () => {
  const mockStore = configureStore();
  let store;
  let initialProps;
  beforeEach(() => {
    store = mockStore({ usersReducer: { rows: [{ id: '1', name: 'foo', userid: 'admin' }] } });
    initialProps = {
      match: {
        params: {
          userId: '1',
        },
      },
    };
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render spinner if no tags exists', (done) => {
    const wrapper = shallow(<UsersDetail store={store} {...initialProps} />).dive();
    setImmediate(() => {
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render user with tags', () => {
    fetchMock
      .getOnce('/ops/get_user_tags?user_id=1', []);
    const wrapper = shallow(<UsersDetail store={store} {...initialProps} />).dive();
    wrapper.setState({ tenant: 'foo', tags: [] });
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(fetchMock._allCalls).toHaveLength(1); // eslint-disable-line no-underscore-dangle
    expect(fetchMock._allCalls[0][0]).toEqual('/ops/get_user_tags?user_id=1'); // eslint-disable-line no-underscore-dangle
  });
});
