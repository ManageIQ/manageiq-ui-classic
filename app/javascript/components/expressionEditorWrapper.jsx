import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Spinner, Button } from 'patternfly-react';
import { ExpressionEditorConnected2 } from '../../../../react-ui-components/src/expression-editor/containers/ExpressionEditor2'
import ExpressionEditorReducers from '../../../../react-ui-components/src/expression-editor/reducers/'
import { http } from '../http_api';

class ExpressionEditorWrapper extends React.Component {
  constructor(props) {
    super(props);
    ManageIQ.redux.addReducer({...ExpressionEditorReducers});
  }

  loadNestedData = (lastSubmited = {next: []}) => {
    return new Promise((resolve, reject) => {
      console.log('Last Submited: ',lastSubmited);

      const id = (lastSubmited.next.options && lastSubmited.next.options.id) ? `&id=${lastSubmited.next.options.id}` : '';
      const model = `?model=${this.props.model}`;
      console.log(this.props);

      resolve(http.get(`${lastSubmited.next.url}${model}${id}`));
    })
  };

  isLoaded = () => this.props.isLoaded();

  render() {
    if (!this.props.isLoaded) return <Spinner loading size="lg" />;
    console.log('Wrapper props: ',this.props);
    var defaultOptions = this.props.data;
    console.log(this.props.expressionEditor.expressions.present.expressions);
    const expressions = this.props.expressionEditor.expressions.present.expressions.map(e => e.map((t) => (t.term ? {id: t.term.id, label: t.term.label, type: t.term.type} : null)));
    return(
      <div>
        <ExpressionEditorConnected2 data={defaultOptions} loadNestedData={this.loadNestedData}/>
        <Button onClick={this.props.loadExpression}>Load</Button>
        <Button onClick={() => http.post(this.props.buttons.apply.url, {expressions: expressions})}>Apply</Button>
        <Button onClick={() => http.post(this.props.buttons.save.url)}>Save</Button>
        <Button onClick={this.props.reset}>Reset</Button>
      </div>
    )
  }
}

ExpressionEditorWrapper.props = {
  loadExpression: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  loadExpression: (expressions) => dispatch({ type: 'UI-COMPONENTS_EXPRESSION_EDITOR_LOAD_EXPRESSION'}),
  reset: () => dispatch({ type: 'UI-COMPONENTS_EXPRESSION_EDITOR_RESET'}),
 });

 const mapStateToProps = ({ expressionEditor }) => ({
   isLoaded: !!expressionEditor,
   expressionEditor: expressionEditor
 });

const ExpressionEditorWrapperConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ExpressionEditorWrapper);

export default ExpressionEditorWrapperConnected;
