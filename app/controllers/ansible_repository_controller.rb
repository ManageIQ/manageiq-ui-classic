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

  def edit
    @in_a_form = true
  end

  def new
    @in_a_form = true
  end

  def dummy_data
    @record = ConfigurationScriptSource.all[0]
    render :json => { :name => @record.name,
                      :description => @record.description,
                      scm_type: 'Troll',
                      url: 'localhost:3000',
                      scm_credentials: 'nope',
                      branch: 'none',
                      clean: true,
                      deleteOnUpdate: true,
                      updateOnLaunch: true,}
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
