class AnsibleCredentialController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::EmbeddedAnsibleRefreshMixin
  include Mixins::ListnavMixin

  menu_section :ansible_credentials

  def self.display_methods
    %w(repositories)
  end

  def self.model
    ManageIQ::Providers::EmbeddedAutomationManager::Authentication
  end

  def display_repositories
    nested_list(ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource)
  end

  def button
    case params[:pressed]
    when 'embedded_automation_manager_credentials_add'
      javascript_redirect(:action => 'new')
    when 'embedded_automation_manager_credentials_edit'
      javascript_redirect(:action => 'edit', :id => params[:miq_grid_checks])
    when 'embedded_automation_manager_credentials_delete'
      delete_credentials
    when 'ansible_credential_tag'
      tag(self.class.model)
    when "ansible_repository_tag" # repositories from nested list
      tag(ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource)
    end
  end

  def new
    assert_privileges('embedded_automation_manager_credentials_add')
    drop_breadcrumb(:name => _("Add a new Credential"), :url => "/ansible_credential/new")
    @in_a_form = true
    @id = 'new'
  end

  def edit
    assert_privileges('embedded_automation_manager_credentials_edit')
    auth = ManageIQ::Providers::EmbeddedAutomationManager::Authentication.find(params[:id].to_i)
    drop_breadcrumb(:name => _("Edit a Credential \"%{name}\"") % {:name => auth.name},
                    :url  => "/ansible_credential/edit/#{params[:id]}")
    @in_a_form = true
    @id = auth.id
  end

  def toolbar
    return 'ansible_repositories_center' if %w(repositories).include?(@display) # for nested list screen
    %w(show_list).include?(@lastaction) ? 'ansible_credentials_center' : 'ansible_credential_center'
  end

  private

  def textual_group_list
    [%i(properties relationships options smart_management)]
  end
  helper_method :textual_group_list

  def delete_credentials
    checked = find_checked_items
    checked[0] = params[:id] if checked.blank? && params[:id]
    ManageIQ::Providers::EmbeddedAutomationManager::Authentication.where(:id => checked).each do |auth|
      begin
        auth.delete_in_provider_queue
        add_flash(_("Deletion of Credential \"%{name}\" was successfully initiated.") % {:name => auth.name})
      rescue => ex
        add_flash(_("Unable to delete Credential \"%{name}\": %{details}") % {:name => auth.name, :details => ex}, :error)
      end
    end
    session[:flash_msgs] = @flash_array
    javascript_redirect(:action => 'show_list')
  end
end
