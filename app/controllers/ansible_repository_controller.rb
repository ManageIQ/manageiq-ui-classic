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

  def title
    _("Repository")
  end

  def button
    if params[:pressed] == "embedded_configuration_script_source_edit"
      id = from_cid(params[:miq_grid_checks])
      javascript_redirect :action => 'edit', :id => id
    elsif params[:pressed] == "embedded_configuration_script_source_add"
      javascript_redirect :action => 'new'
    elsif params[:pressed] == "embedded_configuration_script_source_delete"
      delete_repositories
    end
  end

  def delete_repositories
    assert_privileges('embedded_configuration_script_source_delete')
    checked = find_checked_items
    checked[0] = params[:id] if checked.blank? && params[:id]
    AnsibleRepositoryController.model.where(:id => checked).each do |repo|
      begin
        repo.delete_in_provider_queue
        add_flash(_("Delete of Repository \"%{name}\" was successfully initiated.") % {:name => repo.name})
      rescue => ex
        add_flash(_("Unable to delete Repository \"%{name}\": %{details}") % {:name    => repo.name,
                                                                              :details => ex},
                  :error)
      end
    end
    session[:flash_msgs] = @flash_array
    javascript_redirect :action => 'show_list'
  end

  def edit
    assert_privileges('embedded_configuration_script_source_edit')
    @record = AnsibleRepositoryController.model.find(params[:id])
    drop_breadcrumb(:name => _("Edit a Repository \"%{name}\"") % {:name => @record.name},
                    :url  => "/ansible_repository/edit/#{@record.id}")
    @title = _("Edit Repository \"%{name}\"") % {:name => @record.name}
    @id = @record.id
    @in_a_form = true
  end

  def new
    assert_privileges('embedded_configuration_script_source_add')
    drop_breadcrumb(:name => _("Add a new Repository"), :url => "/ansible_repository/new")
    @title = _("Add new Repository")
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
