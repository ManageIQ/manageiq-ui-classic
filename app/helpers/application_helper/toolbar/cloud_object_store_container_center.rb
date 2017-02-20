class ApplicationHelper::Toolbar::CloudObjectStoreContainerCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'cloud_object_store_container_vmdb',
    [
      select(
        :cloud_object_store_container_vmdb_choice,
        'fa fa-cog fa-lg',
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :cloud_object_store_container_clear,
            'pficon pficon-delete fa-lg',
            N_('Clear Object Storage Container'),
            N_('Clear Object Storage Container'),
            :url_parms => "main_div",
            :confirm   => N_("Warning: ALL Objects will be permanently removed from the Object Storage Container!"),
            :klass     => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options   => {:feature => :cloud_object_store_container_clear}
          ),
          separator,
          button(
            :cloud_object_store_container_delete,
            'pficon pficon-delete fa-lg',
            N_('Remove Object Storage Container'),
            N_('Remove Object Storage Container'),
            :url_parms => "main_div",
            :confirm   => N_("Warning: The selected Object Storage Container and ALL related Objects will be "\
                             "permanently removed!"),
            :klass     => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options   => {:feature => :delete}
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
      :items => [
        button(
          :cloud_object_store_container_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for this Cloud Object Store'),
          N_('Edit Tags'))
      ]
    )
  ])
end
