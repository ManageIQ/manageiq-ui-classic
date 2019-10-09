class ApplicationHelper::Toolbar::CloudObjectStoreContainersCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'cloud_object_store_container_vmdb',
    [
      select(
        :cloud_object_store_container_vmdb_choice,
        nil,
        t = N_('Configuration'),
        t,
        :enabled => true,
        :items   => [
          button(
            :cloud_object_store_container_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Add a new Cloud Object Store Container'),
            t,
            :klass => ApplicationHelper::Button::CloudObjectStoreContainerNew
          ),
          separator,
          button(
            :cloud_object_store_container_clear,
            'pficon pficon-delete fa-lg',
            N_('Clear selected Object Storage Containers'),
            N_('Clear Object Storage Containers'),
            :url_parms    => "main_div",
            :send_checked => true,
            :confirm      => N_("Warning: ALL Objects will be permanently removed from the selected "\
                             "Object Storage Containers!"),
            :enabled => false,
            :onwhen  => "1+"
          ),
          button(
            :cloud_object_store_container_delete,
            'pficon pficon-delete fa-lg',
            N_('Remove selected Object Storage Containers from Inventory'),
            N_('Remove Object Storage Containers from Inventory'),
            :url_parms    => "main_div",
            :send_checked => true,
            :confirm      => N_("Warning: The selected Object Storage Containers and ALL related Objects will be "\
                             "permanently removed!"),
            :enabled => false,
            :onwhen  => "1+"
          ),
        ]
      ),
    ]
  )
  button_group('cloud_object_store_container_policy', [
    select(
      :cloud_object_store_container_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :cloud_object_store_container_tag,
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
