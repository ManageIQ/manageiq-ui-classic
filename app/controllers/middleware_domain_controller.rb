class MiddlewareDomainController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include EmsCommon
  include MiddlewareCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  OPERATIONS = {
    :middleware_domain_stop => {:op   => :stop_middleware_server,
                                :skip => true,
                                :hawk => N_('stopping'),
                                :msg  => N_('Stopping selected domain(s)')}
  }.freeze

  def self.display_methods
    %w(middleware_server_groups)
  end

  def self.default_show_template
    "#{model.name.underscore}/show"
  end

  def self.operations
    OPERATIONS
  end

  menu_section :mdl

  private

  def textual_group_list
    [%i(properties), %i(relationships smart_management)]
  end
  helper_method :textual_group_list
end
