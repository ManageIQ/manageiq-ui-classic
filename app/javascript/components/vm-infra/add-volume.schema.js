import { componentTypes } from "@@ddf";

const createSchema = (volumes = []) => ({
  fields: [
    {
      component: componentTypes.RADIO,
      name: "volumeSourceType",
      label: __("Volume Source Type"),
      isRequired: true,
      options: [
        { label: __("Select Existing PVC"), value: "existing" },
        { label: __("Create New PVC"), value: "new" },
      ],
      initialValue: "existing",
    },
    // Existing PVC selection
    {
      component: componentTypes.SELECT,
      name: "pvcName",
      id: "pvcName",
      label: __("Select Persistent Volume Claim"),
      placeholder: volumes.length > 0 ? __("Select PVC") : __("No PVCs available"),
      options: volumes.length > 0
        ? [
            { label: __("Select PVC"), value: null, isDisabled: true },
            ...volumes.map(({ metadata }) => ({
              label: metadata.name,
              value: metadata.name,
            })),
          ]
        : [{ label: __("No PVCs available"), value: "", isDisabled: true }],
      condition: {
        when: "volumeSourceType",
        is: "existing",
      },
      isRequired: true,
      validate: [{ type: "required", message: __("PVC selection is required") }],
    },
    
   
    // New volume name
    {
      component: componentTypes.TEXT_FIELD,
      name: "newVolumeName",
      id: "newVolumeName",
      label: __("New Volume Name"),
      isRequired: true,
      condition: {
        when: "volumeSourceType",
        is: "new",
      },
      validate: [{ type: "required", message: __("Volume name is required") }],
    },
    // New volume size
    {
      component: componentTypes.TEXT_FIELD,
      name: "newVolumeSize",
      id: "newVolumeSize",
      label: __("New Volume Size (e.g., 3Gi)"),
      isRequired: true,
      condition: {
        when: "volumeSourceType",
        is: "new",
      },
      validate: [
        { type: "required", message: __("Volume size is required") },
        {
          type: "pattern",
          pattern: "^[0-9]+Gi$",
          message: __("Size must be in Gi format (e.g., 3Gi)"),
        },
      ],
    },
  ],
});

export default createSchema;
