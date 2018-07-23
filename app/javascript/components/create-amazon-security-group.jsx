import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AmazonSecurityGroupForm } from '@manageiq/react-ui-components/dist/amazon-security-form-group';
import { API } from '../http_api';

const getData = () => API.get("/api/cloud_networks/?attributes=ems_ref,name,type&expand=resources&filter[]=type='ManageIQ::Providers::Amazon*'")
  .then(data => data.resources.map(resource => ({
    value: resource.ems_ref,
    label: resource.name,
  })));

const createGroups = (values, providerId) =>
  API.post(`/api/providers/${providerId}/security_groups`, {
    action: 'create',
    resource: { ...values },
  });

class CreateAmazonSecurityGroupForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
    };
    this.handleFormStateUpdate = this.handleFormStateUpdate.bind(this);
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'FormButtons.init',
      payload: {
        newRecord: true,
        pristine: true,
        addClicked: () => {
          createGroups(this.state.values, this.props.recordId);
        },
      },
    });
  }

  handleFormStateUpdate(formState) {
    this.props.dispatch({
      type: 'FormButtons.saveable',
      payload: formState.valid,
    });
    this.props.dispatch({
      type: 'FormButtons.pristine',
      payload: formState.pristine,
    });
    this.setState({ values: formState.values });
  }

  render() {
    return (
      <AmazonSecurityGroupForm
        onSave={values => createGroups(values, this.props.recordId)}
        onCancel={() => console.log('Cancel clicked')}
        loadData={getData}
        updateFormState={this.handleFormStateUpdate}
        hideControls
      />
    );
  }
}

CreateAmazonSecurityGroupForm.propTypes = {
  recordId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(CreateAmazonSecurityGroupForm);
