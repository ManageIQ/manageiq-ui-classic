class MiddlewareDomainController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include EmsCommon
  include MiddlewareCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.display_methods
    %i(middleware_server_groups)
  end

  menu_section :cnt

  private

  def textual_group_list
    [%i(properties), %i(relationships smart_management)]
  end
  helper_method :textual_group_list
end
