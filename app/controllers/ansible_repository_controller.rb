class AnsibleRepositoryController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  menu_section :ansible
  toolbar :ansible_repository

  def self.display_methods
    %w(playbooks)
  end

  def self.model
    ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource
  end

  def button
    if params[:pressed] == "embedded_configuration_script_source_edit"
      id = from_cid(params[:miq_grid_checks])
      javascript_redirect :action => 'edit', :id => id
    elsif params[:pressed] == "embedded_configuration_script_source_add"
      javascript_redirect :action => 'new'
    elsif params[:pressed] == "embedded_configuration_script_source_delete"
      delete_repositories
      # ids = params.key?('id') ? [params[:id]] : params[:miq_grid_checks].split(',')
     # ids.each do |id|
     #   ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource.find(from_cid(id).to_i).delete_in_provider
     # end
     # binding.pry
     # add_flash(_('Delete of selected repositories was initialized.'), :success)
     # show_list
     # replace_gtl_main_div
    end
  end

  def delete_repositories
    checked = find_checked_items
    checked[0] = params[:id] if checked.blank? && params[:id]
    AnsibleRepositoryController.model.where(:id => checked).each do |repo|
      begin
        repo.delete_in_provider_queue
        add_flash(_("Deletion of Repository \"%{name}\" was successfully initiated.") % {:name => repo.name})
      rescue => ex
        add_flash(_("Unable to delete Credential \"%{name}\": %{details}") % {:name => repo.name, :details => ex}, :error)
      end
    end
    session[:flash_msgs] = @flash_array
    javascript_redirect :action => 'show_list'
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
