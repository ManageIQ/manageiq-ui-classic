import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import ControlSimulationPage from '../../components/control-simulation-form/control-simulation-page.jsx';
import ControlSimulationForm from '../../components/control-simulation-form/index.jsx';
import ControlSimulationFormResults from '../../components/control-simulation-form/control-simulation-form-results.jsx';

import exampleTestData from './exampleTestData';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Control Simulation Form Component', () => {
  it('should render control simulation page', (done) => {
    const wrapper = shallow(<ControlSimulationPage />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render ControlSimulationForm form', (done) => {
    const wrapper = shallow(<ControlSimulationForm />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render ControlSimulationFormResults without results', (done) => {
    const wrapper = shallow(<ControlSimulationFormResults />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render ControlSimulationFormResults with results', async(done) => {
    const wrapper = shallow(<ControlSimulationFormResults />);
    sendDataWithRx({ type: 'policySimulationResults', namedScope: exampleTestData });
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
