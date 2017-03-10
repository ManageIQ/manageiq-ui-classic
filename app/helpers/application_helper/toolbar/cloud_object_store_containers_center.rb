class ApplicationHelper::Toolbar::CloudObjectStoreContainersCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'cloud_object_store_container_vmdb',
    [
      select(
        :cloud_object_store_container_vmdb_choice,
        'fa fa-cog fa-lg',
        t = N_('Configuration'),
        t,
        :enabled => false,
        :onwhen  => "1+",
        :items   => [
          button(
            :cloud_object_store_container_delete,
            'pficon pficon-delete fa-lg',
            N_('Remove selected Object Storage Containers'),
            N_('Remove Object Storage Containers'),
            :url_parms => "main_div",
            :confirm   => N_("Warning: The selected Object Storage Containers and ALL related Objects will be "\
                             "permanently removed!"),
            :enabled   => false,
            :onwhen    => "1+"
          ),
        ]
      ),
    ]
  )
  button_group('cloud_object_store_container_policy', [
    select(
      :cloud_object_store_container_policy_choice,
      'fa fa-shield fa-lg',
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
          :url_parms => "main_div",
          :enabled   => false,
          :onwhen    => "1+")
      ]
    )
  ])
end
