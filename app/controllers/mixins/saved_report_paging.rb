module Mixins
  module SavedReportPaging
    # Handle paging bar controls
    def saved_report_paging
      # Check new paging parms coming in
      if params[:ppsetting]
        @settings.store_path(:perpage, :reports, params[:ppsetting].to_i)
        @sb[:pages][:current] = 1
        total = @sb[:pages][:items] / settings(:perpage, :reports)
        total += 1 if @sb[:pages][:items] % settings(:perpage, :reports) != 0
        @sb[:pages][:total] = total
      end
      @sb[:pages][:current] = params[:page].to_i if params[:page]
      @sb[:pages][:perpage] = settings(:perpage, :reports)

      rr = MiqReportResult.find(@sb[:pages][:rr_id])
      @html = report_build_html_table(rr.report,
                                      rr.html_rows(:page     => @sb[:pages][:current],
                                                   :per_page => @sb[:pages][:perpage]).join)

      render :update do |page|
        page << javascript_prologue
        page.replace("report_html_div", :partial => "layouts/report_html")
        page.replace_html("paging_div", :partial => 'layouts/saved_report_paging_bar',
                                        :locals  => {:pages => @sb[:pages]})
        page << javascript_hide_if_exists("form_buttons_div")
        page << javascript_show_if_exists("rpb_div_1")
        page << "miqSparkle(false)"
      end
    end
  end
end
