class AvailabilityZoneController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::MoreShowActions
  include EmsCommon

  def show
    return if perfmenu_click?
    @display = params[:display] || "main" unless pagination_or_gtl_request?

    @lastaction = "show"
    @showtype = "config"
    @availability_zone = @record = identify_record(params[:id])
    return if record_no_longer_exists?(@availability_zone)

    @gtl_url = "/show"
    drop_breadcrumb({:name => _("Availabilty Zones"),
                     :url  => "/availability_zones/show_list?page=#{@current_page}&refresh=y"}, true)
    case @display
    when "main", "summary_only"
      get_tagdata(@availability_zone)
      drop_breadcrumb(:name => _("%{name} (Summary)") % {:name => @availability_zone.name},
                      :url  => "/availability_zone/show/#{@availability_zone.id}")
      @showtype = "main"
      set_summary_pdf_data if @display == "summary_only"

    when "performance"
      show_performance

    when "ems_cloud"
      drop_breadcrumb(:name => _("%{name} (%{table}(s))") % {:name  => @availability_zone.name,
                                                             :table => ui_lookup(:table => "ems_cloud")},
                      :url  => "/availability_zone/show/#{@availability_zone.id}?display=ems_cloud")
      @view, @pages = get_view(ManageIQ::Providers::CloudManager, :parent => @availability_zone)  # Get the records (into a view) and the paginator
      @showtype = "ems_cloud"

    when "instances"
      title = ui_lookup(:tables => "vm_cloud")
      drop_breadcrumb(:name => _("%{name} (All %{title})") % {:name => @availability_zone.name, :title => title},
                      :url  => "/availability_zone/show/#{@availability_zone.id}?display=#{@display}")
      @view, @pages = get_view(ManageIQ::Providers::CloudManager::Vm, :parent => @availability_zone)  # Get the records (into a view) and the paginator
      @showtype = @display

    when "cloud_volumes"
      title = ui_lookup(:tables => "cloud_volume")
      drop_breadcrumb(
        :name => _("%{name} (All %{title})") % {:name => @availability_zone.name, :title => title},
        :url  => "/availability_zone/show/#{@availability_zone.id}?display=#{@display}"
      )
      # Get the records (into a view) and the paginator
      @view, @pages = get_view(CloudVolume, :parent => @availability_zone)
      @showtype = @display

    when "timeline"
      show_timeline

    end

    replace_gtl_main_div if pagination_request?
  end

  private

  def textual_group_list
    [%i(relationships), %i(availability_zone_totals tags)]
  end
  helper_method :textual_group_list

  menu_section :clo
end
