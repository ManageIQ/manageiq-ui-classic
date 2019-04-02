class ApplicationHelper::Toolbar::AutomationManagerProviderCenter < ApplicationHelper::Toolbar::Basic
  button_group('provider_vmdb', [
    select(
      :provider_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :enabled => true,
      :items   => [
        button(
          :automation_manager_refresh_provider,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships for all items related to this Provider'),
          N_('Refresh Relationships and Power states'),
          :url     => "refresh",
          :confirm => N_("Refresh relationships for all items related to this Provider?"),
          :klass   => ApplicationHelper::Button::EmsRefresh
        ),
        separator,
        button(
          :automation_manager_edit_provider,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Provider'),
          t,
          :url => "edit"
        ),
        button(
          :automation_manager_resume,
          'pficon pficon-trend-up fa-lg',
          t = N_('Resume this Automation Manager Provider'),
          t,
          :confirm   => N_("Resume this Automation Manager Provider?"),
          :enabled   => proc { !@record.enabled? },
          :url_parms => "main_div"),
        button(
          :automation_manager_pause,
          'pficon pficon-trend-down fa-lg',
          t = N_('Pause this Automation Manager Provider'),
          t,
          :confirm   => N_("Warning: While this provider is paused no data will be collected from it. " \
                         "This may cause gaps in inventory, metrics and events!"),
          :enabled   => proc { @record.enabled? },
          :url_parms => "main_div"),
        button(
          :automation_manager_delete_provider,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Provider from Inventory'),
          t,
          :url     => "delete",
          :confirm => N_("Warning: The selected Provider and ALL of their components will be permanently removed!")
        )
      ]
    ),
  ])
end
