class EmsStorageController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::EmsCommon
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::StorageCommonMixin
  include Mixins::DashboardViewMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::StorageManager
  end

  def self.table_name
    @table_name ||= "ems_storage"
  end

  def breadcrumb_name(_model)
    _('Storage Managers')
  end

  # Show the main MS list view
  def show_list
    opts = {:layout => "ems_storage", :model => model}
    process_show_list(opts)
  end

  def download_data
    assert_privileges('ems_storage_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('ems_storage_show')
    super
  end

  TYPE_CHECK_SHOW_IDENTIFIERS = %w[ems_storage_show ems_storage-show_list].freeze

  def check_generic_rbac
    ident = "#{controller_name}_#{action_name == 'report_data' ? 'show_list' : action_name}"
    return true if TYPE_CHECK_SHOW_IDENTIFIERS.include?(ident)

    super
  end

  def type_feature_role_check
    return true unless TYPE_CHECK_SHOW_IDENTIFIERS.include?("#{controller_name}_#{action_name}") && respond_to?(:feature_role)

    handle_generic_rbac(role_allows?(:feature => feature_role(@record)))
  end

  def init_show(model_class = self.class.model)
    @ems = @record = identify_record(params[:id], model_class)

    return true unless type_feature_role_check

    super
  end

  def feature_role(_record)
    'ems_storage_show'
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Managers"), :url => controller_url},
      ],
    }
  end

  private

  def record_class
    params[:pressed].starts_with?('cloud_object_store_object') ? CloudObjectStoreObject : CloudObjectStoreContainer
  end

  def textual_group_list
    [
      %i[properties status],
      %i[relationships smart_management]
    ]
  end
  helper_method :textual_group_list

  menu_section :sto
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  has_custom_buttons
end
