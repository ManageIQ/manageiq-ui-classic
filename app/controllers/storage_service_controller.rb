class StorageServiceController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericButtonMixin
  include Mixins::EmsCommon::Refresh

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def breadcrumb_name(_model)
    _("Storage Services")
  end

  def new
    assert_privileges("storage_service_new")

    @in_a_form = true
    if params[:storage_manager_id]
      @storage_manager = find_record_with_rbac(ExtManagementSystem, params[:storage_manager_id])
    end
    drop_breadcrumb(:name => _("Create New %{table}") % {:table => ui_lookup(:table => table_name)},
                    :url  => "/#{controller_name}/new")
  end

  def edit
    params[:id] = checked_item_id if params[:id].blank?
    assert_privileges("storage_service_edit")
    @service = find_record_with_rbac(StorageService, params[:id])
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Edit Storage Service \"%{name}\"") % {:name => @service.name},
      :url  => "/storage_service/edit/#{@service.id}"
    )
  end

  def show
    if params[:id].nil?
      @breadcrumbs.clear
    end
    super
  end

  private

  def textual_group_list
    [%i[properties relationships capabilities storage_resources cloud_volumes], %i[tags]]
  end
  helper_method :textual_group_list

  def set_session_data
    session[:layout] = @layout
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Storage Services"), :url => controller_url},
      ],
    }
  end

  menu_section "storage_service"

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_show_list", :download_data
  feature_for_actions "#{controller_name}_show", :download_summary_pdf

  toolbar :storage_service, :storage_services

  def specific_buttons(pressed)
    case pressed
    when 'storage_service_new'
      javascript_redirect(:action => 'new')
    when "storage_service_edit"
      javascript_redirect(:action => "edit", :id => checked_item_id)
    when 'storage_service_refresh'
      queue_refresh(controller_to_model)
    else
      return false
    end
    true
  end
end
