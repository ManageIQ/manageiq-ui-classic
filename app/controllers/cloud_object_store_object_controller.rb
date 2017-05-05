class CloudObjectStoreObjectController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericFormMixin

  def breadcrumb_name(_model)
    ui_lookup(:tables => "cloud_object_store_object")
  end

  def button
    @edit = session[:edit]
    params[:page] = @current_page unless @current_page.nil?

    process_cloud_object_storage_buttons(params[:pressed])

    delete_action if params[:pressed].ends_with?("delete")
  end

  def show
    @display = params[:display] || "main" unless pagination_or_gtl_request?
    @showtype = @display
    @lastaction = "show"
    @object_store_object = @record = identify_record(params[:id])
    return if record_no_longer_exists?(@object_store_object)

    @gtl_url = "/show"
    drop_breadcrumb(
      {
        :name => ui_lookup(:tables => "cloud_objects"),
        :url  => "/cloud_object_store_object/show_list?page=#{@current_page}&refresh=y"
      },
      true
    )
    case @display
    when "main", "summary_only"
      get_tagdata(@object_store_object)
      drop_breadcrumb(
        :name => _("%{name} (Summary)") % {:name => @object_store_object.key.to_s},
        :url  => "/cloud_object_store_object/show/#{@object_store_object.id}"
      )
      @showtype = "main"
      set_summary_pdf_data if @display == "summary_only"
    end

    replace_gtl_main_div if pagination_request?
  end

  def title
    _("Cloud Objects")
  end

  private

  def textual_group_list
    [%i(properties relationships), %i(tags)]
  end
  helper_method :textual_group_list

  menu_section :ost
end
