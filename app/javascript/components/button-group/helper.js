/** Function to change the format of the props available_fields & fields from the format
   * [[string,number]] to [{label:string, value:number}] to use as options in dual-list-select
   * available_fields or an empty array is passed as props. */
export const formatButton = (buttons) => {
  if (buttons.length <= 0) {
    return [];
  }
  const options = [];
  buttons.forEach((btn) => options.push({ label: btn[0], value: btn[1] }));
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
export const formatSetData = (setData, buttonIcon, appliesToClass) => ({
  ...setData,
  button_color: (setData && setData.button_color) ? setData.button_color : '#000',
  button_icon: buttonIcon,
  applies_to_class: appliesToClass,
});
