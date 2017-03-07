class AnsibleRepositoryController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  menu_section :ansible

  def self.display_methods
    %w(playbooks)
  end

  def self.model
    ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource
  end

  def get_session_data
    @center_toolbar = 'ansible_repositories'
    super
  end

  def button
    if params[:pressed] == "embedded_configuration_script_source_edit"
      id = from_cid(params[:miq_grid_checks])
      javascript_redirect :action => 'edit', :id => id
    elsif params[:pressed] == "embedded_configuration_script_source_add"
      javascript_redirect :action => 'new'
    elsif params[:pressed] == "embedded_configuration_script_source_delete"
      binding.pry
    end
  end

  def edit
    @id = params[:id]
    @in_a_form = true
  end

  def new
    @id = 'new'
    @in_a_form = true
  end

  def display_playbooks
    nested_list("ansible_playbook", ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook)
  end

  private

  def textual_group_list
    [%i(properties relationships)]
  end
  helper_method :textual_group_list
end
