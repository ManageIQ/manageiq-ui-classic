class MiddlewareServerGroupController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include EmsCommon
  include MiddlewareCommonMixin
  include Mixins::MiddlewareDeploymentsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  OPERATIONS = {
    :middleware_server_group_reload         => {:op  => :reload_middleware_server_group,
                                                :msg => N_('Reload')},
    :middleware_server_group_suspend        => {:op    => :suspend_middleware_server_group,
                                                :msg   => N_('Suspend'),
                                                :param => :timeout},
    :middleware_server_group_resume         => {:op  => :resume_middleware_server_group,
                                                :msg => N_('Resume')},
    :middleware_server_group_restart        => {:op  => :restart_middleware_server_group,
                                                :msg => N_('Restart')},
    :middleware_server_group_start          => {:op  => :start_middleware_server_group,
                                                :msg => N_('Start')},
    :middleware_server_group_stop           => {:op    => :stop_middleware_server_group,
                                                :msg   => N_('Stop'),
                                                :param => :timeout},
    :middleware_server_group_add_deployment => {:op    => :add_middleware_deployment,
                                                :msg   => N_('Deployment initiated for selected server group(s)'),
                                                :param => :file},
  }.freeze

  def self.operations
    OPERATIONS
  end

  def show
    return unless init_show
    @display = params[:display] unless params[:display].nil?
    case @display
    when 'middleware_servers' then show_middleware_entities(MiddlewareServer)
    else show_middleware
    end
  end
end
