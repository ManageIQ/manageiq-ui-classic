import { componentTypes, validatorTypes } from '@@ddf';

const MAX_DESC_LEN = 255;
const MAX_NOTES_LEN = 512;

// Build the DDF schema for ConditionForm.
const createSchema = (isCopy, towhat, towhatOptions) => {
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      id: 'basic-information',
      name: 'basic-information',
      title: __('Basic Information'),
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          id: 'description',
          name: 'description',
          label: __('Description'),
          maxLength: MAX_DESC_LEN,
          validate: [
            { type: validatorTypes.REQUIRED },
            { type: validatorTypes.MAX_LENGTH, threshold: MAX_DESC_LEN },
          ],
          isRequired: true,
        },
        // In copy mode show the locked towhat as read-only text; otherwise a select.
        ...(isCopy
          ? [
            {
              component: componentTypes.TEXT_FIELD,
              id: 'towhat-label',
              name: 'towhat-label',
              label: __('Applies To'),
              isReadOnly: true,
              initialValue: towhatOptions.find(([, v]) => v === towhat)?.[0] || towhat,
            },
          ]
          : [
            {
              component: componentTypes.SELECT,
              id: 'towhat',
              name: 'towhat',
              label: __('Applies To'),
              placeholder: __('<Choose>'),
              isRequired: true,
              options: towhatOptions.map(([label, value]) => ({ label, value })),
              includeEmpty: true,
            },
          ]),
      ],
    },

    // Scope expression — hidden until towhat is chosen
    {
      component: 'expression-editor',
      id: 'applies_to_exp',
      name: 'applies_to_exp',
      label: __('Scope'),
      sectionTitle: __('Scope'),
      towhatField: 'towhat',
      onlyTags: false,
      condition: {
        when: 'towhat',
        isNotEmpty: true,
      },
    },

    // Main expression — hidden until towhat is chosen
    {
      component: 'expression-editor',
      id: 'expression',
      name: 'expression',
      label: __('Expression'),
      sectionTitle: __('Expression'),
      towhatField: 'towhat',
      onlyTags: false,
      isRequired: true,
      condition: {
        when: 'towhat',
        isNotEmpty: true,
      },
    },

    {
      component: componentTypes.TEXTAREA,
      id: 'notes',
      name: 'notes',
      label: __('Notes'),
      maxLength: MAX_NOTES_LEN,
      rows: 4,
      resolveProps: (_props, { input }) => ({
        helperText: `(${(input.value || '').length} / ${MAX_NOTES_LEN})`,
      }),
    },
  ];

  return { fields };
};

export default createSchema;
