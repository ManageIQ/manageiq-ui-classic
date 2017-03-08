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

  def button
    if params[:pressed] == "embedded_configuration_script_source_edit"
      binding.pry
      id = from_cid(params[:miq_grid_checks])
      javascript_redirect :action => 'edit', :id => id
    elsif params[:pressed] == "embedded_configuration_script_source_add"
      javascript_redirect :action => 'new'
    elsif params[:pressed] == "embedded_configuration_script_source_delete"
      ids = params[:miq_grid_checks].split(',')
      ids.each do |id|
        ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource.delete(from_cid(id).to_i)
      end
      # TODO nicer way?
      add_flash(_('Selected repositories were deleted'), :success)
      show_list
      replace_gtl_main_div
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

  def show
    @center_toolbar = 'ansible_repository'
    super
  end

  def show_list
    @center_toolbar = 'ansible_repositories'
    # TODO remove adding stuff
    if params[:message].present?
      add_flash(params[:message], params[:level].to_sym)
      ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource.create(:name => 'dummy Repository', :description => "Couldn't save your repository :P ")
    end
    super
  end

  private

  def textual_group_list
    [%i(properties relationships)]
  end
  helper_method :textual_group_list
end
