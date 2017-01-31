class NetworkPortController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  # app/views/network_port/_main.html.haml
  def textual_group_list
    [%i(properties tags), %i(relationships)]
  end
  helper_method :textual_group_list


  def self.display_methods
    %w(cloud_subnets floating_ips)
  end

  menu_section :net
end
