import React, { useState, useEffect, useReducer } from 'react';
import Autosuggest from 'react-autosuggest';
// import { CheckCircleIcon, TimesCircleIcon } from "@patternfly/react-icons";
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { Modal, Spinner } from 'patternfly-react';
import { EditOff16, Close16 } from '@carbon/icons-react';
import { trimInput } from './helper';

const nearley = require('nearley');
const partialGrammar = require('./grammar.ne.js');
const validationGrammar = require('./validation-grammar.ne.js');

let partialParser = new nearley.Parser(
  nearley.Grammar.fromCompiled(partialGrammar)
);
let parser = new nearley.Parser(
  nearley.Grammar.fromCompiled(validationGrammar)
);

let autocomplete = {
  exp_type: ['FIELD:', 'TAGS:', 'COUNT OF:', 'FIND:', 'REGKEY:'],
  entity: ['host.'],
  field: ['name ', 'status ', 'system ', 'owner '],
  category: ['environment ', 'location '],
  operator: [
    '= ',
    'CONTAINS ',
    '< ',
    '> ',
    '<= ',
    '>= ',
    'INCLUDES ',
    'IS NOT EMPTY ',
    'IS ',
    'STARTS WITH ',
    'REGULAR EXPRESSION MATCHES ',
  ],
  tag_operator: ['= ', 'CONTAINS  ', ': '],
  exp_operator: ['AND ', 'OR '],
  value: ['value '],
  check: ['CHECK ALL:', 'CHECK ANY:', 'CHECK COUNT:'],
};

const keywords = [
  '=',
  'CONTAINS',
  '<',
  '>',
  '>=',
  '<=',
  'INCLUDES',
  'IS NOT EMPTY',
  'IS',
  'STARTS WITH',
  'REGULAR EXPRESSION MATCHES',
  'COUNT OF',
  'CHECK ALL',
  'CHECK ANY',
  'CHECK COUNT',
];
const getSuggestions = (next) =>
  next
    .map((n) => autocomplete[n])
    .flat()
    .filter(Boolean);
let reloadSuggestions;

const initialState = {
  inputText: '',
  parsedAST: '',
  partialAST: {},
  isValid: true,
  caretPosition: 0,
  suggestions: [],
  filteredSuggestions: [],
  filterStr: '',
  selectedIndex: 0,
};

const reducer = (state, action) => {
  const {
    type, inputText, caretPosition, model,
  } = action;
  console.log(action);
  switch (type) {
    case 'reloadSuggestions':
      return {
        ...state,
        suggestion,
      };

    case 'setInput':
      return {
        ...state,
        inputText,
        caretPosition,
      };

    case 'getSuggestions':
      console.log(state.next, getSuggestions(state.next), autocomplete);

      return {
        ...state,
        filteredSuggestions: getSuggestions(state.next).filter((x) =>
          x.toLowerCase().includes(state.filterStr.toLowerCase())),
      };
    case 'inputChanged':
      const { parsedAST, isValid } = parse(inputText);
      const newState = { ...state };
      let next = [];
      try {
        partialParser = new nearley.Parser(
          nearley.Grammar.fromCompiled(partialGrammar)
        );
        const currentExp = trimInput(inputText, caretPosition);
        partialParser.feed(currentExp);
        next = partialParser.results[0][0].next;
        newState.partialAST = partialParser.results[0][0].results;
        console.log(currentExp, next);
      } catch (err) {
        // console.log(err.message);
      }
      const filterStr = newState.partialAST.slice(-1)[0]
        ? newState.partialAST.slice(-1)[0].value
        : '';

      const suggestions = getSuggestions(next);

      const filteredSuggestions = suggestions.filter((x) =>
        x.toLowerCase().includes(filterStr.toLowerCase()));
      return {
        ...newState,
        inputText,
        parsedAST,
        isValid,
        caretPosition,
        // suggestions,
        filteredSuggestions,
        filterStr,
        next,
        previousPartialAST: state.partialAST,
      };

    case 'downArrow':
      return {
        ...state,
        selectedIndex: Math.min(
          state.selectedIndex + 1,
          state.filteredSuggestions.length - 1
        ),
      };
    case 'upArrow':
      return {
        ...state,
        selectedIndex: Math.max(state.selectedIndex - 1, 0),
      };
    case 'resetSelection':
      return { ...state, selectedIndex: 0 };
    default:
      return state;
  }
};

const keyCodeToActions = (
  keyCode,
  {
    caretPosition, inputText, filterStr, newValue, model,
  }
) =>
  ({
    13: () => [
      inputTextAction(inputText, newValue, caretPosition, filterStr, model),
      { type: 'resetSelection' },
    ],
    38: () => [{ type: 'upArrow', caretPosition }],
    40: () => [{ type: 'downArrow', caretPosition }],
  }[keyCode]);

const parse = (text, callback) => {
  try {
    parser = new nearley.Parser(
      nearley.Grammar.fromCompiled(validationGrammar)
    );
    parser.feed(text);
    if (parser.results.length === 0) {
      throw {
        message: 'Unexpected end of input. Please complete the expression.',
      };
    }
    return { parsedAST: JSON.stringify(parser.results[0]), isValid: true };
  } catch (err) {
    return { parsedAST: err.message, isValid: false };
  }
};
const statusDiv = (isValid, isHidden = false) =>
  null
  //   isValid ? (
  //     <CheckCircleIcon
  //       style={{
  //         color: "lightGreen",
  //         fontSize: "24px",
  //         "margin-right": "10px",
  //         visibility: isHidden ? "hidden" : "visible",
  //       }}
  //     />
  //   ) : (
  //     <TimesCircleIcon
  //       style={{
  //         color: "red",
  //         fontSize: "24px",
  //         "margin-right": "10px",
  //         visibility: isHidden ? "hidden" : "visible",
  //       }}
  //     />
  //   );
;

const inputTextAction = (
  inputText,
  newValue,
  caretPosition,
  filterStr,
  model
) => {
  const leftPart = inputText.slice(0, caretPosition);
  const rightPart = inputText.slice(caretPosition);
  let cutedLeftPart = leftPart.slice(0, leftPart.length - filterStr.length);
  cutedLeftPart = cutedLeftPart.slice(-1) === '"'
    ? cutedLeftPart.slice(0, -1)
    : cutedLeftPart;

  console.log(
    'REGEXP',
    newValue.match(/^[a-z0-9]+$/i),
    newValue,
    cutedLeftPart
  );
  newValue = newValue.match(/^[a-z0-9]+$/i) || keywords.includes(newValue.toUpperCase())
    ? newValue
    : `"${newValue}"`;

  // this works only for the same selection
  let rightCut = 0;
  for (let i = newValue.length; i > 0; i--) {
    if (rightPart.slice(0, i) === newValue.slice(newValue.length - i)) {
      rightCut = i;
    }
  }
  return {
    type: 'inputChanged',
    caretPosition: caretPosition + newValue.length - filterStr.length,
    inputText: `${cutedLeftPart}${newValue}${rightPart.slice(rightCut)}`,
    model,
  };
};

// export function ExpressionEditor(props) {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   console.log('STATE:', state);
//   reloadSuggestions = AwesomeDebouncePromise(props.reloadSuggestions, 500);
//   useEffect(() => {
//     (async() => {
//       autocomplete = await reloadSuggestions(
//         props.model,
//         ['exp_type', 'entity'],
//         []
//       );
//       console.log('ON  LOAD', autocomplete);
//     })();
//   }, []);
//   const onChange = async(e, { newValue, method }) => {
//     console.log('ONCHANGE', method, e, newValue);

//     const { selectionStart } = e.target;
//     // don't add trailing enter, it should be done in different way, but...
//     if (newValue.slice(-1).charCodeAt(0) === 10) {
//       return;
//     }

//     if (method === 'type') {
//       dispatch({
//         type: 'inputChanged',
//         caretPosition: selectionStart,
//         inputText: newValue,
//         model: props.model,
//       });
//     }
//   };
//   const {
//     inputText,
//     filterStr,
//     filteredSuggestions,
//     selectedIndex,
//     caretPosition,
//   } = state;

//   const inputComponent = (
//     <div className="pf-c-select__toggle-wrapper">
//       <div style={{ display: 'flex' }}>
//         {/* {statusDiv(state.isValid, inputText.length === 0)} */}
//         <Autosuggest
//           alwaysRenderSuggestions
//           theme={{}}
//           suggestions={state.filteredSuggestions}
//           getSuggestionValue={(x) => x}
//           inputProps={{
//             value: state.inputText,
//             onChange,
//             onKeyDown: (e) => {
//               const actions = (
//                 keyCodeToActions(e.keyCode, {
//                   caretPosition: e.target.selectionStart,
//                   inputText,
//                   filterStr,
//                   newValue: filteredSuggestions[selectedIndex],
//                   model: props.model,
//                 }) || (() => [])
//               )();
//               actions.map((action) => dispatch(action));
//             },
//             onKeyUp: async(e) => {
//               console.log(
//                 'KEY UP',
//                 state.next,
//                 state.partialAST,
//                 e.keyCode,
//                 e.key
//               );
//               const { selectionStart } = e.target;
//               const changed = JSON.stringify(state.partialAST)
//                 !== JSON.stringify(state.previousPartialAST);
//               // fire request only when something "important" happened
//               // like type '.' or ' ' or delete piece of expression that contains '.' or ' '.
//               if (
//                 e.key === '.'
//                 || e.key === ' '
//                 || ((e.keyCode == 46 || e.keyCode == 8) && changed)
//               ) {
//                 const input = state.partialAST
//                   .slice(0, -1)
//                   .map((i) => i.value.replace(/"'/g));
//                 console.log('RELOAD', props.model, state.next, input);
//                 autocomplete = await reloadSuggestions(
//                   props.model,
//                   state.next,
//                   input
//                 );
//               }
//               if (e.keyCode == 37 || e.keyCode == 39) {
//                 dispatch({
//                   type: 'inputChanged',
//                   inputText,
//                   caretPosition: selectionStart,
//                   model: props.model,
//                 });
//               } else {
//                 dispatch({ type: 'getSuggestions' });
//               }
//             },
//             onClick: (e) => console.log(e.target.selectionStart),
//             style: props.style,
//           }}
//           renderSuggestion={(item) =>
//             props.renderSuggestion(
//               item,
//               state.filteredSuggestions[state.selectedIndex] === item
//             )}
//           onSuggestionsFetchRequested={(x) => x}
//           onSuggestionSelected={(_e, { suggestionValue }) =>
//             dispatch(
//               inputTextAction(
//                 inputText,
//                 suggestionValue,
//                 caretPosition,
//                 filterStr,
//                 props.model
//               )
//             )}
//           renderSuggestionsContainer={props.renderSuggestionsContainer}
//           renderInputComponent={props.renderInputComponent}
//         />
//       </div>
//     </div>
//   );

//   return (
//     <div>
//       {inputComponent}
//       <pre
//         style={{
//           'white-space': 'pre-wrap',
//           visibility: inputText.length === 0 ? 'hidden' : 'visible',
//         }}
//       >
//         {state.parsedAST}
//       </pre>
//     </div>
//   );
// }

const ExpressionEditor = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  console.log('STATE:', state);
  reloadSuggestions = AwesomeDebouncePromise(props.reloadSuggestions, 500);
  useEffect(() => {
    (async() => {
      autocomplete = await reloadSuggestions(
        props.model,
        ['exp_type', 'entity'],
        []
      );
      console.log('ON  LOAD', autocomplete);
    })();
  }, []);
  const onChange = async(e, { newValue, method }) => {
    console.log('ONCHANGE', method, e, newValue);

    const { selectionStart } = e.target;
    // don't add trailing enter, it should be done in different way, but...
    if (newValue.slice(-1).charCodeAt(0) === 10) {
      return;
    }

    if (method === 'type') {
      dispatch({
        type: 'inputChanged',
        caretPosition: selectionStart,
        inputText: newValue,
        model: props.model,
      });
    }
  };

  const {
    inputText,
    filterStr,
    filteredSuggestions,
    selectedIndex,
    caretPosition,
  } = state;
  const inputComponent = (
    <div className="pf-c-select__toggle-wrapper">
      <div style={{ display: 'flex' }}>
        {/* {statusDiv(state.isValid, inputText.length === 0)} */}
        <Autosuggest
          alwaysRenderSuggestions
          theme={{}}
          suggestions={state.filteredSuggestions}
          getSuggestionValue={(x) => x}
          inputProps={{
            value: state.inputText,
            onChange,
            onKeyDown: (e) => {
              const actions = (
                keyCodeToActions(e.keyCode, {
                  caretPosition: e.target.selectionStart,
                  inputText,
                  filterStr,
                  newValue: filteredSuggestions[selectedIndex],
                  model: props.model,
                }) || (() => [])
              )();
              actions.map((action) => dispatch(action));
            },
            onKeyUp: async(e) => {
              console.log(
                'KEY UP',
                state.next,
                state.partialAST,
                e.keyCode,
                e.key
              );
              const { selectionStart } = e.target;
              const changed = JSON.stringify(state.partialAST)
                    !== JSON.stringify(state.previousPartialAST);
              // fire request only when something "important" happened
              // like type '.' or ' ' or delete piece of expression that contains '.' or ' '.
              if (
                e.key === '.'
                    || e.key === ' '
                    || ((e.keyCode == 46 || e.keyCode == 8) && changed)
              ) {
                const input = state.partialAST
                  .slice(0, -1)
                  .map((i) => i.value.replace(/"'/g));
                console.log('RELOAD', props.model, state.next, input);
                autocomplete = await reloadSuggestions(
                  props.model,
                  state.next,
                  input
                );
              }
              if (e.keyCode == 37 || e.keyCode == 39) {
                dispatch({
                  type: 'inputChanged',
                  inputText,
                  caretPosition: selectionStart,
                  model: props.model,
                });
              } else {
                dispatch({ type: 'getSuggestions' });
              }
            },
            onClick: (e) => console.log(e.target.selectionStart),
            style: props.style,
          }}
          renderSuggestion={(item) =>
            props.renderSuggestion(
              item,
              state.filteredSuggestions[state.selectedIndex] === item
            )}
          onSuggestionsFetchRequested={(x) => x}
          onSuggestionSelected={(_e, { suggestionValue }) =>
            dispatch(
              inputTextAction(
                inputText,
                suggestionValue,
                caretPosition,
                filterStr,
                props.model
              )
            )}
          renderSuggestionsContainer={props.renderSuggestionsContainer}
          renderInputComponent={props.renderInputComponent}
        />
      </div>
    </div>
  );
  return (
    <div>
      {inputComponent}
      <pre
        style={{
          'white-space': 'pre-wrap',
          visibility: inputText.length === 0 ? 'hidden' : 'visible',
        }}
      >
        {state.parsedAST}
      </pre>
    </div>
  );
};
export default ExpressionEditor;
