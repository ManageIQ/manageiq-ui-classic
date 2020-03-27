class AnsibleCredentialController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::ListnavMixin
  include Mixins::BreadcrumbsMixin

  menu_section :ansible_credentials

  def self.display_methods
    %w[repositories]
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
    return 'ansible_repositories_center' if %w[repositories].include?(@display) # for nested list screen

    %w[show_list].include?(@lastaction) ? 'ansible_credentials_center' : 'ansible_credential_center'
  end

  private

  def textual_group_list
    [%i[properties relationships options smart_management]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Ansible")},
        {:title => _("Credentials"), :url => controller_url},
      ],
    }
  end
end
