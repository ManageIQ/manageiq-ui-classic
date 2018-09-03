import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import { Alert } from 'patternfly-react';
import FlashMessages from '../flash-messages';
import { REMOVE_FLASH_MESSAGE } from '../../redux/action-types';

describe('Flash messages', () => {
  const mockStore = configureStore();
  let store;
  let filledStore;
  beforeEach(() => {
    store = mockStore({ usersReducer: { flashMessages: [] } });
    filledStore = mockStore({
      usersReducer: {
        flashMessages: [{
          flashId: 1,
          text: 'Sucessful flash message',
          type: 'success',
        }, {
          flashId: 2,
          text: 'Warn flash message',
          type: 'warning',
        }, {
          flashId: 3,
          text: 'Info flash message',
          type: 'info',
        }, {
          flashId: 4,
          text: 'Error flash message',
          type: 'error',
        }],
      },
    });
  });

  it('should render empty correctly', () => {
    const wrapper = mount(<FlashMessages store={store} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly with flash messages', () => {
    const wrapper = mount(<FlashMessages store={filledStore} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should call dismiss alert on dismiss click', () => {
    const wrapper = mount(<FlashMessages store={filledStore} />);
    const dismissButton = wrapper.find(Alert).first().find('button.close');
    dismissButton.simulate('click');
    const expectedActions = [{
      type: REMOVE_FLASH_MESSAGE,
      flashMessage: {
        flashId: 1,
        text: 'Sucessful flash message',
        type: 'success',
      },
    }];
    expect(filledStore.getActions()).toEqual(expectedActions);
  });
  describe('timeout tests', () => {
    beforeAll(() => {
      // set longer timeout form flash messages
      jest.setTimeout(5002);
    });
    afterAll(() => {
      // set default timeout value
      jest.setTimeout(5000);
    });
    it('should call dismiss alert on non error flash messagess after 5s', (done) => {
      const wrapper = mount(<FlashMessages store={filledStore} />);
      const expectedActions = [{
        type: REMOVE_FLASH_MESSAGE,
        flashMessage: expect.objectContaining({
          flashId: 1,
        }),
      }, {
        type: REMOVE_FLASH_MESSAGE,
        flashMessage: expect.objectContaining({
          flashId: 2,
        }),
      }, {
        type: REMOVE_FLASH_MESSAGE,
        flashMessage: expect.objectContaining({
          flashId: 3,
        }),
      }];
      setTimeout(() => {
        wrapper.update();
        expect(filledStore.getActions()).toEqual(expectedActions);
        done();
      }, 5001);
    });
  });
});
