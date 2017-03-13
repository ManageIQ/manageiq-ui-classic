class ApplicationHelper::Toolbar::CloudObjectStoreObjectCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'cloud_object_store_object_vmdb',
    [
      select(
        :cloud_object_store_object_vmdb_choice,
        'fa fa-cog fa-lg',
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :cloud_object_store_object_delete,
            'pficon pficon-delete fa-lg',
            N_('Remove Object Storage Object'),
            N_('Remove Object Storage Object'),
            :url_parms => "main_div",
            :confirm   => N_("Warning: The selected Object Storage Object will be permanently removed!"),
            :klass     => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options   => {:feature => :delete}
          ),
        ]
      ),
    ]
  )
  button_group('cloud_object_store_object_policy', [
    select(
      :cloud_object_store_object_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :items => [
        button(
          :cloud_object_store_object_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for this Cloud Object'),
          N_('Edit Tags'))
      ]
    )
  ])
end
