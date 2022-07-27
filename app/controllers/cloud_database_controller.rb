class CloudDatabaseController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericButtonMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions
  include Mixins::GenericShowMixin
  include Mixins::EmsCommon
  include Mixins::BreadcrumbsMixin

  def button
    case params[:pressed]
    when "cloud_database_new"
      javascript_redirect(:action => "new")
    when "cloud_database_edit"
      javascript_redirect(:action => "edit", :id => checked_item_id)
    when 'cloud_database_delete'
      super
      ## TODO processing of multiple deletes
      ## Consider: we should check that 'delete' is only allowed if the db state isn't deleted (example in oracle cloud)
      ## If user tries to delete a 'deleted' db and an 'active' db then the button should be enabled if both are selected
      ## but an error message should pop up for the db that was not properly deleted (this logic might need to go in the modal?)
    end
  end

  def self.display_methods
    %w[ems_cloud instances cloud_volumes custom_button_events]
  end

  ## TODO Does this belong here???
  def model_feature_for_action(action)
    case action
    when :edit
      :update
    end
  end

  def breadcrumb_name(_model)
    _("Cloud Databases")
  end

  def self.table_name
    @table_name ||= "cloud_database"
  end

  def download_data
    assert_privileges('cloud_database_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('cloud_database_show')
    super
  end

  private

  def textual_group_list
    [%i[relationships properties], %i[tags]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Clouds")},
        {:title => _("Cloud Databases"), :url => controller_url},
      ],
    }
  end

  menu_section :clo
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
end
