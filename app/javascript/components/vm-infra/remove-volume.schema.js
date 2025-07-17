import { componentTypes } from "@@ddf";

const createDetachSchema = (volumes = []) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      name: "volumeName",
      id: "volumeName",
      label: __("Select Volume to Detach"),
      placeholder: volumes.length > 0 ? __("Select Volume") : __("No Volumes Available"),
      options: volumes.length > 0
        ? [
            { label: __("Select Volume"), value: "", isDisabled: true },
            ...volumes.map(({ metadata }) => ({
              label: metadata.name,
              value: metadata.name,
            })),
          ]
        : [{ label: __("No Volumes Available"), value: "", isDisabled: true }],
      isRequired: true,
      validate: [{ type: "required", message: __("Volume selection is required") }],
    },
  ],
});

export default createDetachSchema;
