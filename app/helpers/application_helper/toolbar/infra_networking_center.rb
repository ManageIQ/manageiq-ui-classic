class ApplicationHelper::Toolbar::InfraNetworkingCenter < ApplicationHelper::Toolbar::Basic
  button_group('infra_networking_policy', [
                                          select(
                                            :infra_networking_policy_choice,
                                            nil,
                                            t = N_('Policy'),
                                            t,
                                            :items => [
                                              button(
                                                :infra_networking_tag,
                                                'pficon pficon-edit fa-lg',
                                                N_('Edit Tags for the selected Network Element'),
                                                N_('Edit Tags')),
                                            ]
                                          ),
                                        ])
end
