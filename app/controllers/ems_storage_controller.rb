class EmsStorageController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::EmsCommon
  include Mixins::EmsCommon::Angular
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

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

  def ems_path(*args)
    path_hash = {:action => 'show', :id => args[0].id.to_s }
    path_hash.merge(args[1])
  end

  def new_ems_path
    {:action => 'new'}
  end

  def ems_storage_form_fields
    ems_form_fields
  end

  TYPE_CHECK_SHOW_IDENTIFIERS = %w(ems_storage_show).freeze

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

  def feature_role(record)
    if record.supports_object_storage?
      'ems_object_storage_show'
    elsif record.supports_block_storage?
      'ems_block_storage_show'
    end
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
      ],
    }
  end

  menu_section :sto
  has_custom_buttons
end
