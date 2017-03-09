class AnsibleCredentialController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  menu_section :ansible

  def self.display_methods
    %w(repositories)
  end

  def self.model
    ManageIQ::Providers::EmbeddedAutomationManager::Authentication
  end

  def display_repositories
    nested_list("repository", ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource)
  end

  private

  def textual_group_list
    [%i(properties relationships)]
  end
  helper_method :textual_group_list
end
