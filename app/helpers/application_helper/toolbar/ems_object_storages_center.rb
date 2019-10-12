class ApplicationHelper::Toolbar::EmsObjectStoragesCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_storage_vmdb', [
                 select(
                   :ems_storage_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :ems_object_storage_refresh,
                       'fa fa-refresh fa-lg',
                       N_('Refresh relationships and power states for all items related to the selected Object Storage Managers'),
                       N_('Refresh Relationships and Power States'),
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :confirm      => N_("Refresh relationships and power states for all items related to the selected Object Storage Managers?"),
                       :enabled      => false,
                       :onwhen       => "1+"),
                     separator,
                     button(
                       :ems_object_storage_delete,
                       'pficon pficon-delete fa-lg',
                       N_('Remove selected Object Storage Managers from Inventory'),
                       N_('Remove Object Storage Managers from Inventory'),
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :confirm      => N_("Warning: The selected Object Storage Managers and ALL of their components will be permanently removed!"),
                       :enabled      => false,
                       :onwhen       => "1+"),
                   ]
                 ),
               ])
  button_group('ems_storage_policy', [
                 select(
                   :ems_storage_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :enabled => false,
                   :onwhen  => "1+",
                   :items   => [
                     button(
                       :ems_object_storage_protect,
                       'pficon pficon-edit fa-lg',
                       N_('Manage Policies for the selected Object Storage Managers'),
                       N_('Manage Policies'),
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1+"),
                     button(
                       :ems_object_storage_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for the selected Object Storage Managers'),
                       N_('Edit Tags'),
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1+"),
                   ]
                 ),
               ])
end
