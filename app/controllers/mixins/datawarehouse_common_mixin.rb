module DatawarehouseCommonMixin
  extend ActiveSupport::Concern

  def show
    @display = params[:display] || "main" unless pagination_or_gtl_request?
    @lastaction = "show"
    @showtype = "main"
    @record = identify_record(params[:id])
    show_datawarehouse(@record, controller_name, display_name)
  end

  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if ["#{params[:controller]}s"].include?(@display) # displaying datawarehouse_*
    params[:page] = @current_page if @current_page.nil? # Save current page for list refresh

    # Handle Toolbar Policy Tag Button
    @refresh_div = "main_div" # Default div for button.rjs to refresh
    self.class.model
  end

  private

  def display_name
    ui_lookup(:tables => @record.class.base_class.name)
  end

  def show_datawarehouse(record, controller_name, display_name)
    return if record_no_longer_exists?(record)

    @gtl_url = "/show"
    drop_breadcrumb({:name => display_name,
                     :url  => "/#{controller_name}/show_list?page=#{@current_page}&refresh=y"},
                    true)
    if %w(download_pdf main summary_only).include? @display
      get_tagdata(@record)
      drop_breadcrumb(:name => _("%{name} (Summary)") % {:name => record.name},
                      :url  => "/#{controller_name}/show/#{record.id}")
      set_summary_pdf_data if %w(download_pdf summary_only).include?(@display)
    elsif @display == "timeline"
      @showtype = "timeline"
      session[:tl_record_id] = params[:id] if params[:id]
      @lastaction = "show_timeline"
      @timeline = @timeline_filter = true
      tl_build_timeline # Create the timeline report
      drop_breadcrumb(:name => _("Timelines"),
                      :url  => "/#{controller_name}/show/#{record.id}" \
                               "?refresh=n&display=timeline")
    elsif @display == "performance"
      @showtype = "performance"
      drop_breadcrumb(:name => _("%{name} Capacity & Utilization") % {:name => record.name},
                      :url  => "/#{controller_name}/show/#{record.id}" \
                               "?display=#{@display}&refresh=n")
      perf_gen_init_options # Intialize options, charts are generated async
    elsif @display == "datawarehouse_nodes" || session[:display] == "datawarehouse_nodes" && params[:display].nil?
      show_datawarehouse_display(record, "datawarehouse_nodes", DatawarehouseNode)
    end
    # Came in from outside show_list partial
    if params[:ppsetting] || params[:searchtag] || params[:entry] || params[:sort_choice]
      replace_gtl_main_div
    end
  end

  def get_session_data
    @title      = ui_lookup(:tables => self.class.table_name)
    @layout     = self.class.table_name
    prefix      = self.class.session_key_prefix
    @lastaction = session["#{prefix}_lastaction".to_sym]
    @showtype   = session["#{prefix}_showtype".to_sym]
    @display    = session["#{prefix}_display".to_sym]
  end

  def set_session_data
    prefix                                 = self.class.session_key_prefix
    session["#{prefix}_lastaction".to_sym] = @lastaction
    session["#{prefix}_showtype".to_sym]   = @showtype
    session["#{prefix}_display".to_sym]    = @display unless @display.nil?
  end

  def show_datawarehouse_display(record, display, klass, alt_controller_name = nil)
    title = ui_lookup(:tables => display)
    drop_breadcrumb(:name => _("%{name} (All %{title})") % {:name => record.name, :title => title},
                    :url  => "/#{alt_controller_name || controller_name}/show/#{record.id}?display=#{@display}")
    @view, @pages = get_view(klass, :parent => record) # Get the records (into a view) and the paginator
    @showtype = @display
  end

  def find_current_item(model)
    if params[:id].nil? || model.find_by(:id => params[:id].to_i).nil?
      add_flash(_("%{model} no longer exists") % {:table => ui_lookup(:model => model)}, :error)
      []
    else
      [params[:id].to_i]
    end
  end

  included do
    menu_section :cnt

    # include also generic show_list and index methods
    include Mixins::GenericListMixin
  end
end
