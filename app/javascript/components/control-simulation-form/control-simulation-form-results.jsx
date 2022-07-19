import React, { useState, useReducer } from 'react';
import { Checkbox, Button } from 'carbon-components-react';
import { Add16, Subtract16 } from '@carbon/icons-react';
import { TreeViewRedux } from '../tree-view';
import { convertApi } from './helpers';

const ControlSimulationFormResults = () => {
  const [{
    rawApiResponse,
    formatedApiResponse,
    showPoliciesPassSelected,
    showPoliciesFailSelected,
    showOutOfScopeSelected,
    treeIsExpanded,
  }, setState] = useState({
    rawApiResponse: undefined,
    formatedApiResponse: '',
    showPoliciesPassSelected: true,
    showPoliciesFailSelected: true,
    showOutOfScopeSelected: true,
    treeIsExpanded: true,
  });

  const subscribeToSubject = (dispatch, setState) => {
    listenToRx(
      (event) => {
        setState((state) => ({
          ...state,
          rawApiResponse: event.namedScope,
          formatedApiResponse: convertApi(event.namedScope, showPoliciesPassSelected, showPoliciesFailSelected, showOutOfScopeSelected),
        }));
      },
      (err) => console.error('Error: ', err),
      () => console.debug('Error in control-simulation-form-results.jsx.'),
    );
  };

  const initState = {};
  const [dispatch] = useReducer({}, initState);
  const subscription = subscribeToSubject(dispatch, setState);

  console.log('formatedApiResponse');
  console.log(formatedApiResponse);
  console.log('rawApiResponse');
  console.log(rawApiResponse);

  // NOTE: this dummy data works (and it includes the formating ie bold and colors)
  const dummyData = [{ "key": "root", "text": "Policy Simulation Results for Event [Login failed]", "icon": "fa fa-star", "class": "no-cursor", "selectable": false, "state": { "expanded": true }, "nodes": [{ "key": "xx-4680", "text": "\u003cstrong\u003eVM:\u003c/strong\u003e ag_destroy_test", "icon": "pficon pficon-virtual-machine", "class": "no-cursor", "selectable": false, "nodes": [{ "key": "xx-4680_xx-220", "text": "\u003cstrong\u003eProfile:\u003c/strong\u003e _luds_policy_profile", "icon": "fa fa-ban", "class": "no-cursor", "selectable": false, "nodes": [{ "key": "xx-4680_xx-220_xx-61", "text": "\u003cstrong\u003ePolicy:\u003c/strong\u003e _luds_policy", "icon": "fa fa-ban", "class": "no-cursor", "selectable": false, "nodes": [{ "key": "xx-4680_xx-220_xx-61_xx-", "text": "\u003cstrong\u003eScope:\u003c/strong\u003e \u003cfont color=\"red\"\u003eVM and Instance : Name INCLUDES \u0026quot;luds\u0026quot;\u003c/font\u003e", "tooltip": "VM and Instance : Name INCLUDES \u0026quot;luds\u0026quot;", "icon": "pficon pficon-error-circle-o", "class": "no-cursor", "selectable": false, "state": { "expanded": false } }], "state": { "expanded": false } }], "state": { "expanded": false } }, { "key": "xx-4680_xx-215", "text": "\u003cstrong\u003eProfile:\u003c/strong\u003e _mels_policy_profile", "icon": "pficon pficon-ok", "class": "no-cursor", "selectable": false, "nodes": [{ "key": "xx-4680_xx-215_xx-61", "text": "\u003cstrong\u003ePolicy:\u003c/strong\u003e _luds_policy", "icon": "fa fa-ban", "class": "no-cursor", "selectable": false, "nodes": [{ "key": "xx-4680_xx-215_xx-61_xx-", "text": "\u003cstrong\u003eScope:\u003c/strong\u003e \u003cfont color=\"red\"\u003eVM and Instance : Name INCLUDES \u0026quot;luds\u0026quot;\u003c/font\u003e", "tooltip": "VM and Instance : Name INCLUDES \u0026quot;luds\u0026quot;", "icon": "pficon pficon-error-circle-o", "class": "no-cursor", "selectable": false, "state": { "expanded": false } }], "state": { "expanded": false } }, { "key": "xx-4680_xx-215_xx-60", "text": "\u003cstrong\u003ePolicy:\u003c/strong\u003e _mels_policy", "icon": "pficon pficon-ok", "class": "no-cursor", "selectable": false, "nodes": [{ "key": "xx-4680_xx-215_xx-60_xx-39", "text": "\u003cstrong\u003eCondition:\u003c/strong\u003e _mels", "icon": "pficon pficon-ok", "class": "no-cursor", "selectable": false, "nodes": [{ "key": "xx-4680_xx-215_xx-60_xx-39_xx-", "text": "\u003cstrong\u003eExpression:\u003c/strong\u003e \u003cfont color=\"green\"\u003eVM and Instance : Name INCLUDES \u0026quot;test\u0026quot;\u003c/font\u003e", "tooltip": "VM and Instance : Name INCLUDES \u0026quot;test\u0026quot;", "icon": "pficon pficon-ok", "class": "no-cursor", "selectable": false, "state": { "expanded": false } }], "state": { "expanded": false } }, { "key": "xx-4680_xx-215_xx-60_xx-2", "text": "\u003cstrong\u003eAction:\u003c/strong\u003e Generate log message", "icon": "pficon pficon-ok", "class": "no-cursor", "selectable": false, "state": { "expanded": false } }], "state": { "expanded": false } }], "state": { "expanded": false } }], "state": { "expanded": false } }] }]

  const expandTreeButtonPressed = () => {
    window.miqSquashToggle('rsop_tree');
    setState((state) => ({
      ...state,
      treeIsExpanded: (!treeIsExpanded),
    }));
  };

  const explanationText = <div>{__('* Items in RED do not change the output of the scope or expression')}</div>;
  const expandTreeButton = formatedApiResponse === '' ? <div /> : (
    <div>
      {explanationText}
      <Button id="squash_button" size="sm" kind="ghost" renderIcon={treeIsExpanded ? Add16 : Subtract16} iconDescription="Collapse All" hasIconOnly onClick={expandTreeButtonPressed} />
    </div>
  );
  const policySimulationResults = formatedApiResponse == '' ? <div>{__(`* Enter Policy Simulation options on the left and press Submit`)}</div> : <TreeViewRedux bs_tree={JSON.stringify(formatedApiResponse)} select_node="root" tree_id="rsop_treebox" tree_name="rsop_tree" />;

  const onCheckClicked = (value, id) => {
    let pass = showPoliciesPassSelected;
    let fail = showPoliciesFailSelected;
    let outOfScope = showOutOfScopeSelected;
    if (id === 'passedPolicies') {
      pass = value;
      if ((fail === pass) && value === false) {
        fail = true;
      }
    } else if (id === 'failedPolicies') {
      fail = value;
      if ((fail === pass) && value === false) {
        pass = true;
      }
    }
    if (id === 'showOutOfScope') {
      outOfScope = value;
    }
    setState((state) => ({
      ...state,
      showPoliciesPassSelected: pass,
      showPoliciesFailSelected: fail,
      showOutOfScopeSelected: outOfScope,
      formatedApiResponse: convertApi(rawApiResponse, pass, fail, outOfScope),
    }));
  };

  const defaultCheckedBoxCheckedState = () => ({
    checked: boolean('Checked (checked)', false),
  });

  const checkboxesBlock = (
    <div>
      {__(`Display Options`)}
      <Checkbox {...defaultCheckedBoxCheckedState} checked={showOutOfScopeSelected} labelText="Show out of scope items" id="showOutOfScope" onChange={(value, id, event) => { onCheckClicked(value, id, event); }} />
      {__(`Show Policies:`)}
      <Checkbox {...defaultCheckedBoxCheckedState} checked={showPoliciesPassSelected} labelText="Passed" id="passedPolicies" onChange={(value, id, event) => { onCheckClicked(value, id, event); }} />
      <Checkbox {...defaultCheckedBoxCheckedState} checked={showPoliciesFailSelected} labelText="Failed" id="failedPolicies" onChange={(value, id, event) => { onCheckClicked(value, id, event); }} />
    </div>
  );

  return (
    <div>
      {checkboxesBlock}
      {expandTreeButton}
      {policySimulationResults}
    </div>
  );
};

ControlSimulationFormResults.propTypes = {

};

ControlSimulationFormResults.defaultProps = {

};

export default ControlSimulationFormResults;
