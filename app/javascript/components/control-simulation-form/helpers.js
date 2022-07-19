// Helper Functions

var showPassedPolicies = true;
var showFailedPolicies = true;
var showOutOfScopeItems = true;

const convertApi = (apiData, showPassedPolicies, showFailedPolicies, showOutOfScopeSelected) => {
  showPassedPolicies = showPassedPolicies;
  showFailedPolicies = showFailedPolicies;
  showOutOfScopeItems = showOutOfScopeSelected;

  if (apiData === undefined) {
    return '';
  }
  console.log('api Data');
  console.log(apiData);

  const convToString = [{
    key: 'root',
    text: apiData.name,
    icon: 'fa fa-star',
    class: 'no-cursor',
    selectable: false,
    state: {
      expanded: true,
    },
    nodes: findAllVms(apiData.task_results),
  }];
  return convToString;
};

const findAllVms = (allVms) => {
  // TODO: test this, there are cases with more than one vm (By Clusters -> Cluster)
  const holdAllVms = [];

  allVms.forEach((vmData) => {
    const vmObj = {
      key: `xx-${vmData.id}`,
      text: `\u003cstrong\u003eVM:\u003c/strong\u003e ${vmData.name}`,
      icon: 'pficon pficon-virtual-machine',
      class: 'no-cursor',
      selectable: false,
      nodes: findAllProfiles(vmData.profiles, `xx-${vmData.id}`),
      state: {
        expanded: false,
      },
    };
    holdAllVms.push(vmObj);
  });
  return holdAllVms;
};

const findAllProfiles = (allProfiles, upperKey) => {
  const holdAllPolicies = [];

  allProfiles.forEach((profileData) => {
    const profileObj = {
      key: `${upperKey}_xx-${profileData.id}`,
      text: `\u003cstrong\u003eProfile:\u003c/strong\u003e ${profileData.name}`,
      icon: determineIcon(profileData.result),
      class: 'no-cursor',
      selectable: false,
      nodes: findAllPolicies(profileData.policies, `${upperKey}_xx-${profileData.id}`),
      state: {
        expanded: false,
      },
    };
    holdAllPolicies.push(profileObj);
  });
  return holdAllPolicies;
};

const findAllPolicies = (allPolicies, upperKey) => {
  const holdAllPolicies = [];
  allPolicies.forEach((policyData) => {
    // NOTE: you cannot give the tree a {} option it will break
    const nodes = [];
    if (policyData.scope) {
      nodes.push(findAllScope(policyData.scope, `${upperKey}_xx-${policyData.id}`));
    }
    if (policyData.conditions.length !== 0) {
      nodes.push(findAllConditions(policyData.conditions, `${upperKey}_xx-${policyData.id}`));
    }
    if (policyData.actions.length !== 0) {
      nodes.push(findAllActions(policyData.actions, `${upperKey}_xx-${policyData.id}`));
    }
    const policyObj = {
      key: `${upperKey}_xx-${policyData.id}`,
      text: `\u003cstrong\u003ePolicy:\u003c/strong\u003e ${policyData.description}`,
      icon: determineIcon(policyData.result),
      class: 'no-cursor',
      selectable: false,
      nodes,
      state: {
        expanded: false,
      },
    };

    // NOTE: policyData.result can be: deny || allow || N/A
    if (policyData.result === 'deny' && showFailedPolicies === true) {
      holdAllPolicies.push(policyObj);
    } else if (policyData.result === 'allow' && showPassedPolicies === true) {
      holdAllPolicies.push(policyObj);
    } else if (policyData.result === 'N/A' && showOutOfScopeItems === true) {
      holdAllPolicies.push(policyObj);
    }
  });
  return holdAllPolicies;
};

const findAllConditions = (allConditions, upperKey) => {
  let holdAllConditions = {};

  allConditions.forEach((conditionData) => {
    const conditionObj = {
      key: `${upperKey}_xx-${conditionData.id}`,
      text: `\u003cstrong\u003eCondition:\u003c/strong\u003e ${conditionData.description}`,
      icon: determineIcon(conditionData.result),
      class: 'no-cursor',
      selectable: false,
      nodes: [findAllExpressions(conditionData.expression, `${upperKey}_xx-${conditionData.id}`)],
      state: {
        expanded: false,
      },
    };
    holdAllConditions = conditionObj;
  });
  return holdAllConditions;
};

const findAllActions = (allActions, upperKey) => {
  let holdAllActions = {};

  allActions.forEach((actionData) => {
    const actionObj = {
      key: `${upperKey}_xx-${actionData.id}`,
      text: `\u003cstrong\u003eAction:\u003c/strong\u003e ${actionData.description}`,
      icon: determineIcon(actionData.result),
      class: 'no-cursor',
      selectable: false,
      state: {
        expanded: false,
      },
    };
    holdAllActions = actionObj;
  });
  return holdAllActions;
};

const findAllExpressions = (allExpressions, upperKey) => {
  const dynamicallyBuildText = createSentance(allExpressions, '');
  const holdExpression = {
    key: `${upperKey}_xx-`, // NOTE: this doesnt have an id
    text: `\u003cstrong\u003eExpression:\u003c/strong\u003e ${determineTextColor(allExpressions.result, dynamicallyBuildText)}`,
    tooltip: dynamicallyBuildText,
    icon: determineIcon(allExpressions.result),
    class: 'no-cursor',
    selectable: false,
    state: {
      expanded: false,
    },
  };
  return holdExpression;
};

const findAllScope = (allScope, upperKey) => {
  const dynamicallyBuildText = createSentance(allScope, '');
  const holdScope = {
    key: `${upperKey}_xx-`, // NOTE: this doesnt have an id
    text: `\u003cstrong\u003eScope:\u003c/strong\u003e ${determineTextColor(allScope.result, dynamicallyBuildText)}`,
    tooltip: dynamicallyBuildText,
    icon: determineIcon(allScope.result), // TODO: Is scope always red x ?
    class: 'no-cursor',
    selectable: false,
    state: {
      expanded: false,
    },
  };
  return holdScope;
};

export { convertApi };

// ==================================================================== //

const createSentance = (object, runOnSentence) => {
  // TODO: Test more
  let result = runOnSentence;
  // var useAnd = result == "" ? "" : " && ";
  for (const key in object) {
    if (key == 'result') {
      return result;
    } if (object[key].field != undefined) {
      result = `${result + (result === '' ? '' : ' and ') + object[key].field} ${key} ${object[key].value}`;
    } else {
      result = result + (result === '' ? '' : ' and ') + createSentance(object[key], runOnSentence);
    }
  }
  return result;
};

const determineIcon = (resultValue) => {
  // "icon" :
  // "fa fa-ban"                    <- grey crossed circle
  // "pficon pficon-ok"             <- green check circle
  // "pficon pficon-error-circle-o" <- red x circle
  switch (resultValue) {
    case 'deny':
      return 'pficon pficon-error-circle-o';
    case 'N/A':
      return 'fa fa-ban';
    case 'allow':
      return 'pficon pficon-ok';
    case true: // this happens in the scope / expression level
      return 'pficon pficon-ok'; // "fa fa-bell";
    case false:
      return 'pficon pficon-error-circle-o'; // "fa fa-bell-o";
    default:
      return 'fa fa-ban'; // "fa fa-bell-slash";
  }
};

const determineTextColor = (resultValue, text) => {
  switch (resultValue) {
    case true: // this happens in the scope / expression level
      return `\u003cfont color="green"\u003e${text}\u003c/font\u003e`;
    case false:
      return `\u003cfont color="red"\u003e${text}\u003c/font\u003e`;
    default:
      return text;
  }
};
