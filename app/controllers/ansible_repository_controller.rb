class AnsibleRepositoryController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::EmbeddedAnsibleRefreshMixin

  menu_section :ansible_repositories
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
    case params[:pressed]
    when "embedded_configuration_script_source_edit"
      id = params[:miq_grid_checks]
      javascript_redirect :action => 'edit', :id => id
    when "embedded_configuration_script_source_add"
      javascript_redirect :action => 'new'
    when "embedded_configuration_script_source_delete"
      delete_repositories
    when "ansible_repositories_reload"
      show_list
      render :update do |page|
        page << javascript_prologue
        page.replace("gtl_div", :partial => "layouts/gtl")
      end
    when "ansible_repository_reload"
      params[:display] = @display if @display
      show
      render :update do |page|
        page << javascript_prologue
        page.replace("main_div", :template => "ansible_repository/show")
      end
    when "ansible_repository_tag"
      tag(self.class.model)
    end
  end

  def check_button_rbac
    # Allow reload to skip RBAC check
    if %w(ansible_repository_reload ansible_repositories_reload).include?(params[:pressed])
      true
    else
      super
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
    nested_list(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook, :breadcrumb_title => _('Playbooks'))
  end

  def repository_refresh
    assert_privileges("embedded_configuration_script_source_refresh")
    checked = find_checked_items
    checked[0] = params[:id] if checked.blank? && params[:id]
    objects = AnsibleRepositoryController.model.find(checked)
    embedded_ansible_refresh(objects)
    javascript_flash
  end

  private

  def textual_group_list
    [%i(properties relationships options smart_management)]
  end
  helper_method :textual_group_list
end
