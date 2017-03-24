class VmController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data
  include VmCommon # common methods for vm controllers
  include VmRemote # methods for VM remote access

  include Mixins::GenericSessionMixin

  def index
    session[:vm_type] = nil             # Reset VM type if coming in from All tab
    redirect_to :action => 'show_list'
  end

  def show_list
    options = {:association => session[:vm_type]}
    options[:model] = "ManageIQ::Providers::CloudManager::Vm" if params['sb_controller'] == 'availability_zone'
    process_show_list(options)
  end

  def get_session_data
    @polArr         = session[:polArr] || ""           # current tags in effect
    @policy_options = session[:policy_options] || ""
  end

  def set_session_data
    session[:polArr]          = @polArr unless @polArr.nil?
    session[:policy_options]  = @policy_options unless @policy_options.nil?
  end

  def title
    _("Virtual Machines")
  end
end
