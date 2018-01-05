class MiddlewareServerGroupController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include EmsCommon
  include MiddlewareCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.display_methods
    %w(middleware_servers)
  end

  def self.default_show_template
    "#{model.name.underscore}/show"
  end

  def textual_group_list
    [%i(properties), %i(relationships smart_management)]
  end
  helper_method :textual_group_list

  def run_operation
    selected_server_groups = identify_selected_entities
    if selected_server_groups.nil?
      render :json => {:status => :error, :msg => _('No Server Groups selected')}
      return
    end
    operation = ('middleware_server_group_' + params['operation']).to_sym
    if OPERATIONS.key?(operation)
      do_run_operation(operation, selected_server_groups)
    else
      msg = _('Unknown server group operation: ') + operation.to_s
      render :json => {:status => :error, :msg => msg}
    end
  end

  private

  def do_run_operation(operation, selected_server_groups)
    operation_info = OPERATIONS.fetch(operation)
    triggered = run_specific_operation(operation_info, selected_server_groups)
    if triggered
      initiated_msg = _('%{operation} initiated for given server group.') % {:operation => operation_info.fetch(:msg)}
      render :json => {:status => :ok, :msg => initiated_msg}
    else
      fail_msg = _('%{operation} was not initiated for given group.') % {:operation => operation_info.fetch(:msg)}
      render :json => {:status => :error, :msg => fail_msg}
    end
  end
end
