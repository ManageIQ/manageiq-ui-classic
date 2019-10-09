class ApplicationHelper::Toolbar::CloudObjectStoreObjectsCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'cloud_object_store_object_vmdb',
    [
      select(
        :cloud_object_store_object_vmdb_choice,
        nil,
        t = N_('Configuration'),
        t,
        :enabled => false,
        :onwhen  => "1+",
        :items   => [
          button(
            :cloud_object_store_object_delete,
            'pficon pficon-delete fa-lg',
            N_('Remove selected Object Storage Objects from Inventory'),
            N_('Remove Object Storage Objects from Inventory'),
            :url_parms    => "main_div",
            :send_checked => true,
            :confirm      => N_("Warning: The selected Object Storage Object will be permanently removed!"),
            :enabled      => false,
            :onwhen       => "1+"
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
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :cloud_object_store_object_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for the selected items'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+")
      ]
    )
  ])
end
