import React from "react";
import ExpressionEditor from "../expression-editor";

import { storiesOf } from "@storybook/react";

const autocomplete = {
  exp_type: ["FIELD:", "TAGS:", "COUNT OF:", "FIND:", "REGKEY:"],
  entity: ["host."],
  field: ["name ", "status ", "system ", "owner "],
  category: ["environment ", "location "],
  operator: [
    "= ",
    "CONTAINS ",
    "< ",
    "> ",
    "<= ",
    ">= ",
    "INCLUDES ",
    "IS NOT EMPTY ",
    "IS ",
    "STARTS WITH ",
    "REGULAR EXPRESSION MATCHES ",
  ],
  tag_operator: ["= ", "CONTAINS  ", ": "],
  exp_operator: ["AND ", "OR "],
  value: ["value "],
  check: ["CHECK ALL:", "CHECK ANY:", "CHECK COUNT:"],
};
const getSuggestions = (next) => next.map((n) => autocomplete[n]).flat();
const reloadSuggestions = (model, autocompleteActions, input) => {
  console.log("RELOAD");
  return autocomplete;
};
const renderInputComponent = (inputProps) => <textarea {...inputProps} />;
const renderSuggestionsContainer = ({ containerProps, children, query }) => {
  return (
    <div
      className="pf-c-select pf-m-expanded expression-options"
      {...containerProps}
    >
      {children}
    </div>
  );
};
const renderSuggestion = (item, focused) => (
  <button
    type="button"
    className={`pf-c-select__menu-item ${focused ? "pf-m-focus" : ""}`}
  >
    {item}
  </button>
);
const style = { width: "500px", "font-size": "14px" };

storiesOf("Expression Editor", module).add("Expression Editor", () => (
  <ExpressionEditor
    getSuggestions={getSuggestions}
    renderSuggestion={renderSuggestion}
    renderInputComponent={renderInputComponent}
    renderSuggestionsContainer={renderSuggestionsContainer}
    reloadSuggestions={reloadSuggestions}
    style={style}
    model="Host"
  />
));
