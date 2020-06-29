class ApplicationHelper::Toolbar::ContainerTemplateCenter < ApplicationHelper::Toolbar::Basic
  button_group('orchestration_template_vmdb', [
    select(
      :orchestration_template_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :service_dialog_from_ct,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Create Service Dialog from Container Template'),
          t,
          :options => {:feature => :instantiate},
          :klass   => ApplicationHelper::Button::GenericFeatureButtonWithDisable
        ),
      ]
    ),
  ])
  button_group('container_template_policy', [
    select(
      :container_template_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :container_template_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Container Template'),
          N_('Edit Tags')),
      ]
    ),
  ])
end
