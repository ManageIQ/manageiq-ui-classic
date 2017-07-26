class GenericObjectController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  menu_section :automate

  def self.model
    GenericObject
  end

  private

  def textual_group_list
    []
  end

  helper_method :textual_group_list
end
