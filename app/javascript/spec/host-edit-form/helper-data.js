export const sampleInitialValues = {
  id: '1',
  name: '10.197.65.254',
  hostname: null,
  ipaddress: '10.197.65.254',
  ems_id: '2',
  type: 'ManageIQ::Providers::IbmPowerHmc::InfraManager::Host',
};

export const sampleSingleResponse = {
  data: {
    form_schema: {
      fields: [
        {
          component: 'sub-form',
          id: 'endpoints-subform',
          name: 'endpoints-subform',
          title: 'Endpoints',
          fields: [
            {
              component: 'tabs',
              name: 'tabs',
              fields: [
                {
                  component: 'tab-item',
                  id: 'default-tab',
                  name: 'default-tab',
                  title: 'Default',
                  fields: [
                    {
                      component: 'validate-host-credentials',
                      id: 'endpoints.default.valid',
                      name: 'endpoints.default.valid',
                      skipSubmit: true,
                      isRequired: true,
                      fields: [
                        {
                          component: 'text-field',
                          id: 'authentications.default.userid',
                          name: 'authentications.default.userid',
                          label: 'Username',
                          isRequired: true,
                          validate: [
                            {
                              type: 'required',
                            },
                          ],
                        },
                        {
                          component: 'password-field',
                          id: 'authentications.default.password',
                          name: 'authentications.default.password',
                          label: 'Password',
                          type: 'password',
                          isRequired: true,
                          validate: [
                            {
                              type: 'required',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  component: 'tab-item',
                  id: 'remote-tab',
                  name: 'remote-tab',
                  title: 'Remote Login',
                  fields: [
                    {
                      component: 'validate-host-credentials',
                      id: 'endpoints.remote.valid',
                      name: 'endpoints.remote.valid',
                      skipSubmit: true,
                      isRequired: true,
                      fields: [
                        {
                          component: 'text-field',
                          id: 'authentications.remote.userid',
                          name: 'authentications.remote.userid',
                          label: 'Username',
                          isRequired: true,
                          validate: [
                            {
                              type: 'required',
                            },
                          ],
                        },
                        {
                          component: 'password-field',
                          id: 'authentications.remote.password',
                          name: 'authentications.remote.password',
                          label: 'Password',
                          type: 'password',
                          isRequired: true,
                          validate: [
                            {
                              type: 'required',
                            },
                          ],
                          helperText: 'Required if SSH login is disabled for the Default account.',
                        },
                      ],
                    },
                  ],
                },
                {
                  component: 'tab-item',
                  id: 'ws-tab',
                  name: 'ws-tab',
                  title: 'Web Service',
                  fields: [
                    {
                      component: 'validate-host-credentials',
                      id: 'endpoints.ws.valid',
                      name: 'endpoints.ws.valid',
                      skipSubmit: true,
                      isRequired: true,
                      fields: [
                        {
                          component: 'text-field',
                          id: 'authentications.ws.userid',
                          name: 'authentications.ws.userid',
                          label: 'Username',
                          isRequired: true,
                          validate: [
                            {
                              type: 'required',
                            },
                          ],
                        },
                        {
                          component: 'password-field',
                          id: 'authentications.ws.password',
                          name: 'authentications.ws.password',
                          label: 'Password',
                          type: 'password',
                          isRequired: true,
                          validate: [
                            {
                              type: 'required',
                            },
                          ],
                          helperText: 'Used for access to Web Services.',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
};

export const sampleMultiResponse = {
  resources: [
    {
      href: 'http://localhost:3000/api/hosts/9',
      id: '9',
      name: 'aramis',
    },
    {
      href: 'http://localhost:3000/api/hosts/10',
      id: '10',
      name: '10.197.65.254',
    },
  ],
};
