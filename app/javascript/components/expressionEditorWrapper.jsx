import React from 'react';
import PropTypes from 'prop-types';
import { Spinner, Button } from 'patternfly-react';
// import ExpressionEditor from '@manageiq/react-ui-components/dist/expression-editor';
import ExpressionEditor from '@manageiq/react-ui-components/src/expression-editor/expression-editor';

// const autocomplete = {
//   exp_type: ['FIELD:', 'TAGS:', 'COUNT OF:', 'FIND:', 'REGKEY:'],
//   entity: ['host.'],
//   field: ['name ', 'status ', 'system ', 'owner '],
//   category: ['environment ', 'location '],
//   operator: ['= ', 'CONTAINS ', '< ', '> ', '<= ', '>= ', 'INCLUDES ', 'IS NOT EMPTY ', 'IS ', 'STARTS WITH ', 'REGULAR EXPRESSION MATCHES '],
//   tag_operator: ['= ', 'CONTAINS  ', ': '],
//   exp_operator: ['AND ', 'OR '],
//   value: ['value '],
//   check: ['CHECK ALL:', 'CHECK ANY:', 'CHECK COUNT:'],
// };
// const getSuggestions = next => next.map(n => autocomplete[n]).flat();
const renderInputComponent = inputProps => <textarea {...inputProps} />;
const renderSuggestionsContainer = ({ containerProps, children, query }) => (
  <div className="pf-c-select pf-m-expanded expression-options" {...containerProps}>
    {children}
  </div>
);

const arrayToApiProps = (arr, str) => (arr.length > 0 ? `${str}${arr.join(`&${str}`)}` : '');
const renderSuggestion = (item, focused) => <button type="button" className={`pf-c-select__menu-item ${focused ? 'pf-m-focus' : ''}`}>{item}</button>;
const style = { width: '500px', 'font-size': '14px' };
const fun = (model, autocompleteActions, input) =>
  API.get(`/api/expressions?${arrayToApiProps(autocompleteActions, 'autocomplete_actions[]=')}&model=${model}&${arrayToApiProps(input, 'written_input[]=')}`).then((data) => {
    // const fun = (model, autocompleteActions, input) => API.get(`/api/expressions?autocomplete_actions[]=entity&autocomplete_actions[]=field&model=${model}`).then((data) => {
      console.log('RELOAD', data);
      console.log('PARAMS', model, autocompleteActions, input);
    return data;
    // return Object.values(data).reduce((i, acc) => [...acc, ...i], []);
  });

const ExpressionEditorWrapper = props => (
  <ExpressionEditor
    // getSuggestions={getSuggestions}
    reloadSuggestions={fun}
    renderSuggestion={renderSuggestion}
    renderInputComponent={renderInputComponent}
    renderSuggestionsContainer={renderSuggestionsContainer}
    style={style}
    model={props.model}
  />
);

export default ExpressionEditorWrapper;
