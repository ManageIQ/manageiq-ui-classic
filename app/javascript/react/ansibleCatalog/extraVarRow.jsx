import React from 'react';
import PropTypes from 'prop-types';
import { ExtraVarField } from './extraVarField';
import { Button } from 'patternfly-react';

export class ExtraVarRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      row: {key: '', default: '',},
    };
  }
  componentDidMount() {
    const {values, fieldIndex} = this.props;
    if (!values[fieldIndex]) {
      this.setState({isEditing: true});
    } else {
      this.setState({row: values[fieldIndex]});
    }
  }
  componentDidUpdate(prevState) {
    const {fieldIndex, values} = this.props;
    const {isEditing} = this.state;
    if (prevState.values[fieldIndex] !== values[fieldIndex] && !isEditing) {
      this.setState({row: values[fieldIndex]});
    }
  }
  updateField = () => {
    let {isEditing, row} = this.state;
    const {changeField, values, fieldIndex, extraVarsField} = this.props;
    if (isEditing && (!row.key || !row.default)) {
      return;
    }
    isEditing = !isEditing;
    values[fieldIndex] = {...row}
    changeField(extraVarsField, values);
    this.setState({isEditing});
  }
  revertField() {
    const {row} = this.state;
    const  {values, fieldIndex} = this.props;
    if(!row.key) {
     return this.removeField();
    }
    else {
      this.setState({ isEditing: false, row: values[fieldIndex] });
    }
  }
  removeField() {
    const {fieldIndex, removeField} = this.props;
    removeField(fieldIndex);
  }
  renderButton(defaultIcon, editIcon, onclick) {
    const { isEditing } = this.state;
    return (<Button
      type="button"
      bsStyle="link"
      onClick={onclick}
    >
      <i className={`pficon ${(isEditing ? editIcon : defaultIcon)}`} />
    </Button>);
  }
  handleRemoveClick = () => {
    const { isEditing } = this.state;
    if (isEditing) {
      this.revertField();
    } else {
      this.removeField();
    }
  }
  handleFieldUpdate = event => {
    const {row} = this.state;
    row[event.target.name] = event.target.value;
    this.setState({row});
  }
  render() {
    const {isEditing, row} = this.state;
    const {fieldName, values, fieldIndex} = this.props;
    const currentExtraVar = values[fieldIndex] || [];
    const textFields = [
      { fieldName: 'key', label: __('Variable')},
      { fieldName: 'default', label: __('Default')},
    ];
    if (!row && !isEditing) { //this happens because of these fields being part of an array
      return null;
    }
    return (
      <tr>
      { textFields.map((field,index) => {
        const currentValue = (currentExtraVar ? currentExtraVar[field.fieldName] : null);
        const showError = !row[field.fieldName]? 'has-error': '';
        return (
          <td key={index} className={showError}>
          {isEditing &&
          <input type="text" className="form-control" name={field.fieldName} defaultValue={currentValue} onChange={this.handleFieldUpdate}/>
          }
          {isEditing && !row[field.fieldName] &&
                <div className="help-block">
                  {__('Required')}
                </div>
          }
            <ExtraVarField field={{name:fieldName,
            label: field.label,
            isEditing, fieldName: field.fieldName, value: currentValue, }} />
          </td>);
      })
      }
      <td>
        { this.renderButton('pficon-edit','pficon-save',this.updateField) }
        { this.renderButton('pficon-delete','pficon-close',this.handleRemoveClick) }
      </td>
    </tr>);
  }
}
ExtraVarRow.propTypes = {
  changeField: PropTypes.func,
  removeField: PropTypes.func,
  fieldIndex: PropTypes.number,
  values: PropTypes.array,
  fieldName: PropTypes.string,
  extraVarsField: PropTypes.string,
};

export default ExtraVarRow;
