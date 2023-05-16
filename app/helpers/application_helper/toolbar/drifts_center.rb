class ApplicationHelper::Toolbar::DriftsCenter < ApplicationHelper::Toolbar::Basic
  button_group('common_drift_history', [
                 button(
                   :common_drift,
                   'ff ff-drift fa-lg',
                   N_('Select up to 10 timestamps for Drift Analysis'),
                   nil,
                   :url_parms    => "main_div",
                   :send_checked => true,
                   :enabled      => false,
                   :onwhen       => "2+"
                 ),
               ])
end
