import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Spinner } from 'patternfly-react';
import { ExpressionEditorConnected2 } from '../../../../react-ui-components/src/expression-editor/containers/ExpressionEditor2'
import ExpressionEditorReducers from '../../../../react-ui-components/src/expression-editor/reducers/'
// import '../../../../react-ui-components/src/expression-editor/sass/style.scss';

// const loadNestedData = (lastSubmited = {next: []}) => {
//   return new Promise((resolve, reject) => {
//     console.log('Last Submited: ',lastSubmited);
//
//     const id = (lastSubmited.next.options && lastSubmited.next.options.id) ? `&id=${lastSubmited.next.options.id}` : '';
//     const model = `?model=${this.props.model}`;
//     console.log(this.props);
//
//     resolve(http.get(`${lastSubmited.next.url}${model}${id}`));
//   })
// };

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
    return(
      <ExpressionEditorConnected2 data={defaultOptions} loadNestedData={this.loadNestedData}/>
    )
  }
}

const mapDispatchToProps = dispatch => ({
 });

 const mapStateToProps = ({ expressionEditor }) => ({
   isLoaded: !!expressionEditor,
 });

const ExpressionEditorWrapperConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ExpressionEditorWrapper);

export default ExpressionEditorWrapperConnected;
