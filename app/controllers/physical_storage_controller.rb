class PhysicalStorageController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericButtonMixin

  before_action :check_privileges
  before_action :session_data
  after_action :cleanup_action
  after_action :set_session_data

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  toolbar :physical_storage, :physical_storages

  def breadcrumb_name(_model)
    _('Physical Storages')
  end

  def new
    @in_a_form = true
    if params[:storage_manager_id]
      @storage_manager = find_record_with_rbac(ExtManagementSystem, params[:storage_manager_id])
    end
    drop_breadcrumb(:name => _("Add New %{table}") % {:table => ui_lookup(:table => table_name)},
                    :url  => "/#{controller_name}/new")
  end

  def edit
    params[:id] = checked_item_id if params[:id].blank?
    assert_privileges("physical_storage_edit")
    @storage = find_record_with_rbac(PhysicalStorage, params[:id])
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Edit Physical Storage \"%{name}\"") % {:name => @storage.name},
      :url  => "/physical_storage/edit/#{@storage.id}"
    )
  end

  def self.table_name
    @table_name ||= "physical_storages"
  end

  def session_data
    @title  = _("Physical Storages")
    @layout = "physical_storage"
    @lastaction = session[:physical_storage_lastaction]
  end

  def set_session_data
    session[:layout] = @layout
    session[:physical_storage_lastaction] = @lastaction
  end

  def show_list
    process_show_list
  end

  def button
    if params[:pressed] == "physical_storage_timeline"
      @record = find_record_with_rbac(PhysicalStorage, params[:id])
      show_timeline
      javascript_redirect(:action => 'show', :id => @record.id, :display => 'timeline')
    end
  end

  def download_summary_pdf
    assert_privileges('physical_storage_show')
    super
  end

  def textual_group_list
    [
      %i[properties relationships asset_details],
    ]
  end
  helper_method(:textual_group_list)

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Physical Infrastructure")},
        {:title => _("Storages"), :url => controller_url},
      ],
    }
  end

  def download_data
    assert_privileges('physical_storage_show_list')
    super
  end

  private

  def specific_buttons(pressed)
    case pressed
    when 'physical_storage_new'
      javascript_redirect(:action => 'new')
    when 'physical_storage_edit'
      javascript_redirect(:action => 'edit', :id => checked_item_id)
    else
      return false
    end
    true
  end
end
