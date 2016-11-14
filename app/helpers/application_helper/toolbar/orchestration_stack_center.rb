class ApplicationHelper::Toolbar::OrchestrationStackCenter < ApplicationHelper::Toolbar::Basic
  button_group('orchestration_stack_vmdb', [
    select(
      :orchestration_stack_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :orchestration_stack_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this item'),
          t,
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: This item and ALL of its components will be permanently removed!")),
      ]
    ),
  ])
  button_group('orchestration_stack_policy', [
    select(
      :orchestration_stack_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :items => [
        button(
          :orchestration_stack_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this item'),
          N_('Edit Tags')),
      ]
    ),
  ])
  button_group('orchestration_stack_lifecycle', [
    select(
      :orchestration_stack_lifecycle_choice,
      'fa fa-recycle fa-lg',
      t = N_('Lifecycle'),
      t,
      :items => [
        button(
          :orchestration_stack_retire,
          'fa fa-clock-o fa-lg',
          N_('Set Retirement Dates for this item'),
          N_('Set Retirement Date')),
        button(
          :orchestration_stack_retire_now,
          'fa fa-clock-o fa-lg',
          t = N_('Retire this item'),
          t,
          :confirm => N_("Retire this item")),
      ]
    ),
  ])
end
