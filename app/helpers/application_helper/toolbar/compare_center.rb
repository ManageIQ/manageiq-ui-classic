class ApplicationHelper::Toolbar::CompareCenter < ApplicationHelper::Toolbar::Basic
  button_group('compare_tasks', [
    twostate(
      :compare_all,
      'ff ff-compare-all fa-lg',
      N_('All attributes'),
      nil,
      :klass     => ApplicationHelper::Button::ButtonWithoutRbacCheck,
      :url       => "compare_miq_all",
      :url_parms => "?compare_task=all"),
    twostate(
      :compare_diff,
      'ff ff-compare-different fa-lg',
      N_('Attributes with different values'),
      nil,
      :klass     => ApplicationHelper::Button::ButtonWithoutRbacCheck,
      :url       => "compare_miq_differences",
      :url_parms => "?compare_task=different"),
    twostate(
      :compare_same,
      'ff ff-compare-same fa-lg',
      N_('Attributes with same values'),
      nil,
      :klass     => ApplicationHelper::Button::ButtonWithoutRbacCheck,
      :url       => "compare_miq_same",
      :url_parms => "?compare_task=same"),
  ])
  button_group('compare_mode', [
    twostate(
      :comparemode_details,
      'fa fa-bars fa-lg',
      N_('Details Mode'),
      nil,
      :klass     => ApplicationHelper::Button::ButtonWithoutRbacCheck,
      :url => "compare_mode"),
    twostate(
      :comparemode_exists,
      'ff ff-exists fa-lg',
      N_('Exists Mode'),
      nil,
      :klass     => ApplicationHelper::Button::ButtonWithoutRbacCheck,
      :url => "compare_mode"),
  ])
end
