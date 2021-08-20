const dataHelper = (values) => {
  const vd = values.description;
  const vt = values.action_type;
  const optionValue = values.options;
  delete values.action_type;
  delete values.description;
  let data = {};
  switch (vt) {
    case 'delete_snapshots_by_age': {
      const optionsValue = parseInt(optionValue.age, 10);
      data = {
        name: vd,
        description: vd,
        action_type: vt,
        options: { age: optionsValue },
      };
      break;
    }
    case 'custom_automation': {
      const catValue = optionValue.ae_hash;
      const buildCatValue = (catValue) => {
        const obj = {};
        catValue.forEach((pt) => {
          obj[pt.attribute] = pt.value;
        });
        return obj;
      };
      const aeHash = buildCatValue(catValue);
      data = {
        name: vd,
        description: vd,
        action_type: vt,
        options: { ae_message: optionValue.ae_message, ae_request: optionValue.ae_request, ae_hash: aeHash },
      };
      break;
    }
    case 'inherit_parent_tags':
    case 'remove_tags': {
      const tagValue = optionValue.cats;
      const buildCatValue = (tagValue) => {
        const obj = [];
        tagValue.forEach((tg) => {
          obj.push(tg.value);
        });
        return obj;
      };
      const catOptions = buildCatValue(tagValue);
      data = {
        name: vd,
        description: vd,
        action_type: vt,
        options: { parent_type: optionValue.parent_type, cats: catOptions },
      };
      break;
    }
    case 'run_ansible_playbook': {
      const inventory = optionValue.inventory_type;
      if (inventory === 'LocalHost') {
        data = {
          name: vd,
          description: vd,
          action_type: vt,
          options: { service_template_name: [optionValue.service_template_name], use_localhost: true },
        };
      } else if (inventory === 'Target Machine') {
        data = {
          name: vd,
          description: vd,
          action_type: vt,
          options: { service_template_name: [optionValue.service_template_name], use_event_target: true },
        };
      } else {
        data = {
          name: vd,
          description: vd,
          action_type: vt,
          options: { service_template_name: [optionValue.service_template_name], hosts: optionValue.hosts },
        };
      }
      break;
    }
    case 'tag':
      data = {
        name: vd,
        description: vd,
        action_type: vt,
        options: { tags: [`/managed/${optionValue.tags}`] },
      };
      break;
    default:
      data = {
        name: vd,
        description: vd,
        action_type: vt,
        options: optionValue,
      };
  }
  return data;
};

const constructAeHash = (aeHashPairs) => {
  const options = [];
  const aeHashAttribute = Object.keys(aeHashPairs);
  aeHashAttribute.forEach((pt) => {
    const tempObj = { attribute: pt, value: Object.values(aeHashPairs)[0] };
    options.push(tempObj);
  });
  return options;
};

const assignProfiles = [
  { label: __('Copy of sample'), value: 'Copy of sample' },
  { label: __('default'), value: 'default' },
  { label: __('host default'), value: 'host default' },
  { label: __('host sample'), value: 'host sample' },
  { label: __('sample'), value: 'sample' },
];

const findInitialValue = (inventoryType, recordId) => {
  let value = '';
  if (recordId === false || inventoryType === 'localhost') {
    value = 'LocalHost';
  } else if (inventoryType === 'event_target') {
    value = 'Target Machine';
  } else {
    value = 'Specific Hosts';
  }
  return value;
};

const buildParentTypeOptions = (parentType) => {
  const parentTypeArray = [];
  parentType.forEach((pt) => {
    const tempObj = { label: pt[0], value: pt[1] };
    parentTypeArray.push(tempObj);
  });
  parentTypeArray.splice(0, 1);
  return parentTypeArray;
};

const buildSnapShotAgeOptions = (snapshotAge) => {
  const snapshotAgeArray = [];
  snapshotAge.forEach((sa) => {
    const tempObj = { label: sa[0].toString(), value: sa[1].toString() };
    snapshotAgeArray.push(tempObj);
  });
  return snapshotAgeArray;
};

const buildInheritTagOptions = (inheritTags) => {
  const inheritTagArray = [];
  inheritTags.forEach((it) => {
    const tempObj = { label: it[1], value: it[0] };
    inheritTagArray.push(tempObj);
  });
  return inheritTagArray;
};

const buildAlertOptions = (alertOptions) => {
  const alertOptionArray = [];
  alertOptions.forEach((ao) => {
    const tempObj = { label: ao[0], value: ao[1] };
    alertOptionArray.push(tempObj);
  });
  return alertOptionArray;
};

const buildRunAnsible = (ansibleOptions) => {
  const ansibleOptionsArray = [];
  ansibleOptions.forEach((ao) => {
    const tempObj = { label: ao[0], value: ao[0] };
    ansibleOptionsArray.push(tempObj);
  });
  return ansibleOptionsArray;
};

const findLabel = (inheritTags, catLabel) => {
  let ansibleOptionsArray = [];
  inheritTags.forEach((pt) => {
    const tempObj = { label: pt[0], value: pt[1] };
    if (tempObj.value === catLabel) {
      ansibleOptionsArray = tempObj.label;
    }
  });
  return ansibleOptionsArray;
};

const buildTags = (tags, inheritTags) => {
  const entry = Object.entries(tags);
  const tagArray = [];
  entry.forEach((pt) => {
    const catOptions = [];
    const tempObj = { label: pt[0], value: pt[1] };
    tempObj.value.forEach((to) => {
      const val = findLabel(inheritTags, tempObj.label);
      const catObj = { label: to[0], value: `${val}/${to[0]}` };
      catOptions.push(catObj);
    });
    const tagObj = { label: tempObj.label.toUpperCase(), options: catOptions };
    tagArray.push(tagObj);
  });
  return tagArray;
};

export {
  dataHelper, constructAeHash, assignProfiles, findInitialValue, buildParentTypeOptions, buildSnapShotAgeOptions,
  buildInheritTagOptions, buildAlertOptions, buildRunAnsible, findLabel, buildTags,
};
