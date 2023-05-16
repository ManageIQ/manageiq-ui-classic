class ApplicationHelper::Toolbar::PhysicalStoragesCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'physical_storage_vmdb',
    [
      select(
        :physical_storage_vmdb_choice,
        nil,
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :physical_storage_refresh,
            'fa fa-refresh fa-lg',
            N_('Refresh selected Physical Storages'),
            N_('Refresh selected Physical Storages'),
            :image        => "refresh",
            :confirm      => N_("Refresh the selected Physical Storages?"),
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+',
            :options      => {:feature => :refresh},
            :api          => {
              :action => 'refresh',
              :entity => 'physical_storages'
            }
          ),
          button(
            :physical_storage_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Attach a new storage system'),
            t
          ),
          button(
            :physical_storage_edit,
            'pficon pficon-edit fa-lg',
            t = N_('Edit selected Physical Storage'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1'
          ),
          api_button(
            :physical_storage_delete,
            nil,
            t = N_('Delete selected Physical Storage'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
            :options      => {:feature      => :delete,
                              :parent_class => "PhysicalStorage"},
            :api          => {
              :action => 'delete',
              :entity => 'physical_storages'
            },
            :confirm      => N_("Are you sure you want to delete the selected Physical Storages?\nNote that all of the attached services (e.g. volumes) will be unmapped."),
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+'
          ),
        ]
      ),
    ]
  )
end
