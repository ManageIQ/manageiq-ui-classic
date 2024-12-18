import React from 'react';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import settingsDetailsTab from '../../components/settings-details-tab';

describe('SettingsDetailsTab Component', () => {
  const region = {
    id: 1,
    region: 0,
    description: 'Region 3',
    maintenance_zone_id: 1,
  };

  const scanItemsCount = 3;
  const zonesCount = 1;
  const miqSchedulesCount = 0;

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render settings details tab', async() => {
    const wrapper = shallow(<settingsDetailsTab
      region={region}
      scanItemsCount={scanItemsCount}
      zonesCount={zonesCount}
      miqSchedulesCount={miqSchedulesCount}
    />);

    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });
});
