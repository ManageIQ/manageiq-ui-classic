import React, { Component } from 'react';
import PropTypes from 'prop-types';
import createSchema from './schema.js';
import MiqFormRenderer from '../../forms/data-driven-form';
import { http } from '../../http_api';
import { cleanVirtualDom } from '../../miq-component/helpers';
import { Col, FormGroup } from 'patternfly-react';
import EditTable from './edit_table.jsx';

const extraFormFields = {
  output: ({label, value}) => (
    <FormGroup>
      <Col md={2} componentClass="label" className="control-label">
        {label}
      </Col>
      <Col md={10}>
        <p className="form-control-static">
          {value}
        </p>
      </Col>
    </FormGroup>
  ),

  header: ({label}) => (
    <h3>{label}</h3>
  ),

  editTable: EditTable,
};

class AnalysisProfileForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      schema: createSchema(this.props.scanMode, this.props.CATEGORY_CHOICES),
    };
  }

  componentDidMount() {
    cleanVirtualDom();
    miqSparkleOn();

    // TODO only if edit
    http.get(`/service/service_form_fields/${this.props.analysisProfileId}`)
      .then(data => this.setState({ initialValues: { ...data } }))
      .then(miqSparkleOff);
  }

  render() {
    const { analysisProfileId } = this.props;

    return (
      <MiqFormRenderer
        extraFormFields={extraFormFields}
        initialValues={this.state.initialValues}
        schema={this.state.schema}
        onSubmit={values => console.log('TODO submit', values)}
        onCancel={() => console.log('TODO cancel')}
        onReset={() => add_flash(__('All changes have been reset'), 'warn')}
        canReset={!! analysisProfileId}
        buttonsLabels={{
          submitLabel: __('Save'),
          resetLabel: __('Reset'),
          cancelLabel: __('Cancel'),
        }}
      />
    );
  }
}

AnalysisProfileForm.propTypes = {
  analysisProfileId: PropTypes.string,
  scanMode: PropTypes.oneOf(['Host', 'Vm']).isRequired,
  CATEGORY_CHOICES: PropTypes.shape({
    [PropTypes.string]: PropTypes.string,
  }),
};

export default AnalysisProfileForm;
