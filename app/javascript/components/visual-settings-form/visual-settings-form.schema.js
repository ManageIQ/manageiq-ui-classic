import { componentTypes } from '@@ddf';

const createSchema = () => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      name: 'general-subform',
      title: __('General'),
      fields: [
        {
          component: componentTypes.SELECT,
          name: 'view.compare',
          id: 'view.compare',
          label: __('Compare'),
          initialValue: 'expanded',
          options: [
            { label: __('Expanded'), value: 'expanded' },
            { label: __('Compressed'), value: 'compressed' },
          ],
        },
        {
          component: componentTypes.SELECT,
          name: 'view.compare__mode',
          id: 'view.compare__mode',
          label: __('Compare Mode'),
          initialValue: 'details',
          options: [
            { label: __('Details'), value: 'details' },
            { label: __('Exists'), value: 'exists' },
          ],
        },
        {
          component: componentTypes.SELECT,
          name: 'view.drift',
          id: 'view.drift',
          label: __('Drift'),
          initialValue: 'expanded',
          options: [
            { label: __('Expanded'), value: 'expanded' },
            { label: __('Compressed'), value: 'compressed' },
          ],
        },
        {
          component: componentTypes.SELECT,
          name: 'view.drift__mode',
          id: 'view.drift__mode',
          label: __('Drift Mode'),
          initialValue: 'details',
          options: [
            { label: __('Details'), value: 'details' },
            { label: __('Exists'), value: 'exists' },
          ],
        },
        {
          component: componentTypes.SELECT,
          name: 'view.summary__mode',
          id: 'view.summary__mode',
          label: __('Summary Screens'),
          initialValue: 'dashboard',
          options: [
            { label: __('Dashboard'), value: 'dashboard' },
            { label: __('Textual'), value: 'textual' },
          ],
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      name: 'perpage-subform',
      title: __('Default Items Per Page'),
      fields: [
        {
          component: componentTypes.SELECT,
          name: 'perpage.list',
          id: 'perpage.list',
          label: __('List View'),
          initialValue: 20,
          options: [5, 10, 20, 50, 100, 200, 500, 1000].map((n) => ({ label: n, value: n })),
        },
        {
          component: componentTypes.SELECT,
          name: 'perpage.reports',
          id: 'perpage.reports',
          label: __('Reports'),
          initialValue: 20,
          options: [5, 10, 20, 50, 100, 200, 500, 1000].map((n) => ({ label: n, value: n })),
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      name: 'topology-subform',
      title: __('Topology Default Items in View'),
      fields: [
        {
          component: componentTypes.SELECT,
          name: 'topology.containers_max_items',
          id: 'topology.containers_max_items',
          label: __('Containers'),
          options: [
            { label: __('Unlimited'), value: 0 },
            ...[5, 10, 20, 50, 100, 200, 500, 1000].map((n) => ({ label: n, value: n })),
          ],
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      name: 'display-subform',
      title: __('Miscellaneous'),
      fields: [
        {
          component: componentTypes.SELECT,
          name: 'display.startpage',
          id: 'display.startpage',
          label: __('Start Page'),
          isSearchable: true,
          loadOptions: () => API.get('/api/shortcuts?expand=resources&attributes=description,url')
            .then(({ resources }) => resources.map(({ url, description }) => ({ value: url, label: description }))),
        },
        {
          component: componentTypes.SELECT,
          name: 'display.timezone',
          id: 'display.timezone',
          label: __('Timezone'),
          isSearchable: true,
          loadOptions: () => API.get('/api').then(({ timezones }) => timezones.map(({ name, description }) => ({ label: description, value: name }))),
        },
        {
          component: componentTypes.SELECT,
          name: 'display.locale',
          id: 'display.locale',
          label: __('Locale'),
          initialValue: 'default',
          options: [
            { label: __('Global Default'), value: 'default' },
            ...Object.keys(window.locales).map((value) => ({ value, label: window.locales[value].locale_data.app.locale_name[0] })),
          ],
        },
      ],
    },
  ],
});

export default createSchema;
