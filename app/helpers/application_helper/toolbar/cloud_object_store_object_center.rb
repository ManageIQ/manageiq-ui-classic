class ApplicationHelper::Toolbar::CloudObjectStoreObjectCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'cloud_object_store_object_vmdb',
    [
      select(
        :cloud_object_store_object_vmdb_choice,
        nil,
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :cloud_object_store_object_delete,
            'pficon pficon-delete fa-lg',
            N_('Remove Object Storage Object from Inventory'),
            N_('Remove Object Storage Object from Inventory'),
            :url_parms    => "main_div",
            :send_checked => true,
            :confirm      => N_("Warning: The selected Object Storage Object will be permanently removed!"),
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :delete}
          ),
        ]
      ),
    ]
  )
  button_group('cloud_object_store_object_policy', [
    select(
      :cloud_object_store_object_policy_choice,
      nil,
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
