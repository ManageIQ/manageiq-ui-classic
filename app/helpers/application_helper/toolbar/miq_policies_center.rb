class ApplicationHelper::Toolbar::MiqPoliciesCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_policy_vmdb', [
    select(
      :miq_policy_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_policy_new,
          'pficon pficon-add-circle-o fa-lg',
          t = proc do
              _('Add a New %{model} %{mode} Policy') % {
                :model => ui_lookup(:model => @sb[:nodeid].camelize),
                :mode  => _(@sb[:mode]).capitalize
              }
          end,
          t,
          :url_parms => "?typ=basic",
          :klass     => ApplicationHelper::Button::ButtonNewDiscover),
      ]
    ),
  ])
end
