class AnsibleCredentialController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  menu_section :ansible
  toolbar :ansible_credential

  def self.display_methods
    %w(repositories)
  end

  def self.model
    ManageIQ::Providers::EmbeddedAutomationManager::Authentication
  end

  def display_repositories
    nested_list("repository", ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource)
  end

  def button
    if params[:pressed] == 'embedded_automation_manager_credentials_add'
      javascript_redirect :action => 'new'
    elsif params[:pressed] == 'embedded_automation_manager_credentials_edit'
      javascript_redirect :action => 'edit', :id => from_cid(params[:miq_grid_checks])
    elsif params[:pressed] == 'embedded_automation_manager_credentials_delete'
      delete_credentials
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
    @id = params[:id]
  end

  private

  def textual_group_list
    [%i(properties relationships options)]
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
    javascript_redirect :action => 'show_list'
  end
end
