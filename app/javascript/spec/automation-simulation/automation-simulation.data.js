export const notice = { notice: 'Enter Automation Simulation options on the left and press Submit.' };

export const treeData = [
  {
    cells: {
      label: '',
      value: {
        component: 'TREE_VIEW_REDUX',
        input: 'component',
        name: 'ae_simulation_tree',
        props: {
          // eslint-disable-next-line max-len
          bs_tree: '[{"key":"root","text":"All Tenants","tooltip":"All Tenants","icon":"pficon pficon-tenant","hideCheckbox":true,"selectable":true,"state":{"expanded":true,"checked":"undefined"},"nodes":[{"key":"tn-1","text":"My Company","icon":"pficon pficon-tenant","selectable":true,"nodes":[{"key":"tn-14","text":"kmtest1","icon":"pficon pficon-tenant","selectable":true,"nodes":[{"key":"tn-21","text":"Codie1","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":false,"expanded":false}}],"state":{"checked":false,"expanded":false}},{"key":"tn-12","text":"LOICA","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":false,"expanded":false}},{"key":"tn-16","text":"new","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-2","text":"OpenStack Cloud Provider OpenStack","icon":"pficon pficon-tenant","selectable":true,"nodes":[{"key":"tn-3","text":"admin","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-4","text":"cloud-southeast","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-5","text":"cloud-user-demo","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-6","text":"cloudwest","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-18","text":"loic","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-7","text":"Loic Tenant","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-13","text":"Massachusetts","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-15","text":"Moneta_demo","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-8","text":"openshift_demo","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-19","text":"test-ivy","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-17","text":"testetot","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}},{"key":"tn-9","text":"testtel","icon":"pficon pficon-tenant","selectable":true,"nodes":[{"key":"tn-20","text":"test-ivr","icon":"pficon pficon-tenant","selectable":true,"state":{"checked":true,"expanded":false}}],"state":{"checked":true,"expanded":false}}],"state":{"checked":true,"expanded":false}}],"state":{"checked":"undefined","expanded":false}}]}]', // Tree data goes here.
          select_node: '-MiqAeObject',
          tree_id: 'ae_simulation_treebox',
          tree_name: 'ae_simulation_tree',
        },
      },
    },
  },
];

export const objectData = [
  {
    cells: {
      label: 'URI',
      value: '/SYSTEM/PROCESS/GenericObject?CloudVolume',
    },
  },
];

export const xmlData = [
  {
    cells: {
      label: '',
      value: {
        component: 'XML_HOLDER',
        input: 'component',
        name: 'ae_simulation_tree',
        props: {
          xmlData: `<MiqAeWorkspace>
                      <MiqAeObject namespace="ManageIQ/System" class="PROCESS" instance="GenericObject">
                        <MiqAeAttribute name="aa">
                          <String>11</String>
                        </MiqAeAttribute>
                      </MiqAeObject>
                    </MiqAeWorkspace>`,
        },
      },
    },
  },
];
