import React, { Component } from 'react';
import PropTypes from 'prop-types';

class EditTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <pre>
        {JSON.stringify(this.props)}
      </pre>
    );
  }
}

export default EditTable;
