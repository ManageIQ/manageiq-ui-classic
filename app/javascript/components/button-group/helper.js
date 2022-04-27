/** Function to change the format of the props available_fields & fields from the format
   * [[string,number]] to [{label:string, value:number}] to use as options in dual-list-select
   * available_fields or an empty array is passed as props. */
export const formatButton = (buttons, isGenericObject = false) => {
  if (buttons.length <= 0) {
    return [];
  }
  const options = [];
  if (isGenericObject) {
    buttons.forEach((btn) => options.push({ label: btn.name, value: parseInt(btn.id, 10) }));
  } else {
    buttons.forEach((btn) => options.push({ label: btn[0], value: btn[1] }));
  }
  return options;
};

/** Function to extract the ButtonGroupName from api result like 'ButtonGroupName | xyz'. */
export const formatName = (buttonGroupName) => {
  if (!buttonGroupName) {
    return undefined;
  }
  return buttonGroupName.split('|')[0].trim('');
};

/** Function to update the field set_data's values during form submit */
export const formatSetData = (setData, buttonIcon, appliesToClass, appliesToId) => {
  if (appliesToId) {
    return ({
      ...setData,
      button_color: (setData && setData.button_color) ? setData.button_color : '#000',
      button_icon: buttonIcon,
      applies_to_class: appliesToClass,
      applies_to_id: appliesToId,
    });
  }
  return ({
    ...setData,
    button_color: (setData && setData.button_color) ? setData.button_color : '#000',
    button_icon: buttonIcon,
    applies_to_class: appliesToClass,
  });
};

export const getGenericObjectButtonList = (buttonGroups, data, recId) => {
  const buttons = [];
  const assignedButtons = [];
  let unassignedButtons = [];

  if (buttonGroups.resources) {
    buttonGroups.resources.forEach((buttonGroup) => {
      if (buttonGroup.set_data.button_order) {
        if (recId !== parseInt(buttonGroup.id, 10)) {
          assignedButtons.push(...buttonGroup.set_data.button_order);
        }
      }
    });
  }

  if (data.resources) {
    data.resources.forEach((button) => {
      unassignedButtons.push(parseInt(button.id, 10));
    });

    unassignedButtons = unassignedButtons.filter((button) => !assignedButtons.includes(button));

    data.resources.forEach((button) => {
      if (unassignedButtons.includes(parseInt(button.id, 10))) {
        buttons.push({ label: button.name, value: parseInt(button.id, 10) });
      }
    });
  }

  return buttons;
};
