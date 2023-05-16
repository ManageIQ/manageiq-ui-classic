class ApplicationHelper::Toolbar::MiqRequestsCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_request_reloading', [
                 button(
                   :miq_request_reload,
                   'fa fa-refresh fa-lg',
                   N_('Refresh this page'),
                   N_('Refresh'),
                   :url_parms    => "main_div",
                   :send_checked => true,
                   :klass        => ApplicationHelper::Button::MiqRequest,
                   :options      => {:feature => 'miq_request_reload'}
                 ),
               ])
end
