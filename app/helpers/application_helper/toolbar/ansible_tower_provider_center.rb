class ApplicationHelper::Toolbar::AnsibleTowerProviderCenter < ApplicationHelper::Toolbar::Basic
  button_group('provider_vmdb', [
                                select(
                                  :provider_vmdb_choice,
                                  'fa fa-cog fa-lg',
                                  t = N_('Configuration'),
                                  t,
                                  :enabled => true,
                                  :items   => [
                                    button(
                                      :ansible_tower_refresh_provider,
                                      'fa fa-refresh fa-lg',
                                      N_('Refresh relationships for all items related to this Provider'),
                                      N_('Refresh Relationships and Power states'),
                                      :url     => "refresh",
                                      :confirm => N_("Refresh relationships for all items related to this Provider?")
                                    ),
                                    separator,
                                    button(
                                      :ansible_tower_edit_provider,
                                      'pficon pficon-edit fa-lg',
                                      t = N_('Edit this Provider'),
                                      t,
                                      :url => "edit"
                                    ),
                                    button(
                                      :ansible_tower_delete_provider,
                                      'pficon pficon-delete fa-lg',
                                      t = N_('Remove this Provider'),
                                      t,
                                      :url     => "delete",
                                      :confirm => N_("Warning: The selected Provider and ALL of their components will be permanently removed!")
                                    )
                                  ]
                                ),
                              ])
end
