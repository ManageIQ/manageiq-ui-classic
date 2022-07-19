import React from 'react';

import { Grid, Row, Column } from 'carbon-components-react';
import ControlSimulationForm from './index';
import ControlSimulationFormResults from './control-simulation-form-results';

const ControlSimulationPage = (props) => (
  <Grid>
    <Row>
      <Column xs={12} md={8} lg={6}>
        <ControlSimulationForm sb_rsop={props.sb_rsop} eventSelectionEventObj={props.eventSelectionEventObj} />
      </Column>
      <Column xs={12} md={4} lg={6}>
        <ControlSimulationFormResults />
      </Column>
    </Row>
  </Grid>
);

ControlSimulationPage.propTypes = {

};
ControlSimulationPage.defaultProps = {

};

export default ControlSimulationPage;
