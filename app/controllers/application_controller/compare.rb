module ApplicationController::Compare
  extend ActiveSupport::Concern

  DRIFT_TIME_COLUMNS = %w[last_scan_on boot_time last_logon].freeze

  def get_compare_report(model)
    db = model.kind_of?(String) ? model.constantize : model
    MiqReport.find_by(:filename => "#{db.table_name}.yaml", :template_type => "compare")
  end

  def create_compare_view
    @sb[:miq_temp_params] = "all"

    rpt = get_compare_report(@sb[:compare_db])
    session[:miq_sections] = MiqCompare.sections(rpt)
    ids = session[:miq_selected].collect(&:to_i)
    @compare = MiqCompare.new({:ids     => ids,
                               :include => session[:miq_sections]},
                              rpt)
    get_formatted_time("_model_", "compare")
    session[:compare_state] = {}
    @compare
  end

  # Compare multiple VMs
  def compare_miq(_db = nil)
    @compressed = session[:miq_compressed]
    @exists_mode = session[:miq_exists_mode]
    if @compare.nil? # == nil
      compare_init("compare") # Init compare screen variables
    end
    session[:db_title] = case @sb[:compare_db]
                         when 'Vm'          then 'VMs'
                         when 'Host'        then 'Hosts'
                         when 'EmsCluster'  then 'Clusters'
                         when 'MiqTemplate' then 'Templates'
                         else                    'VMs'
                         end
    drop_breadcrumb(:name => _("Compare %{name}") % {:name => ui_lookup(:model => @sb[:compare_db])},
                    :url  => "/#{session[:db_title].singularize.downcase}/compare_miq")
    @lastaction = "compare_miq"
    if params[:ppsetting] # User selected new per page value
      @items_per_page = params[:ppsetting].to_i # Set the new per page value
    end
    @compare = create_compare_view
    @sections_tree = TreeBuilderSections.new(:all_sections_tree,
                                             @sb,
                                             true,
                                             :data            => @compare,
                                             :controller_name => controller_name,
                                             :current_tenant  => current_tenant.name)
    compare_to_json(@compare)
    if params[:ppsetting] # Came in from per page setting
      replace_main_div({:partial => "layouts/compare"}, {:spinner_off => true})
    elsif @explorer
      @refresh_partial = "layouts/compare"
    else
      @showtype = "compare"
      render :template => 'compare'
    end
  end

  # Compare multiple VMs to show differences
  def compare_miq_same
    @sb[:miq_temp_params] = "same"
    compare_all_diff_same
  end

  # Compare multiple VMs to show all
  def compare_miq_all
    @sb[:miq_temp_params] = "all"
    compare_all_diff_same
  end

  def update_compare_partial(command, mode)
    render :update do |page|
      page << javascript_prologue
      case mode
      when 'different'
        page << "ManageIQ.toolbars.enableItem('#center_tb', '#{command}_all');"
        page << "ManageIQ.toolbars.unmarkItem('#center_tb', '#{command}_all');"
        page << "ManageIQ.toolbars.enableItem('#center_tb', '#{command}_same');"
        page << "ManageIQ.toolbars.unmarkItem('#center_tb', '#{command}_same');"
        page << "ManageIQ.toolbars.disableItem('#center_tb', '#{command}_diff');"
        page << "ManageIQ.toolbars.markItem('#center_tb', '#{command}_diff');"
      when 'same'
        page << "ManageIQ.toolbars.enableItem('#center_tb', '#{command}_all');"
        page << "ManageIQ.toolbars.unmarkItem('#center_tb', '#{command}_all');"
        page << "ManageIQ.toolbars.disableItem('#center_tb', '#{command}_same');"
        page << "ManageIQ.toolbars.markItem('#center_tb', '#{command}_same');"
        page << "ManageIQ.toolbars.enableItem('#center_tb', '#{command}_diff');"
        page << "ManageIQ.toolbars.unmarkItem('#center_tb', '#{command}_diff');"
      else
        page << "ManageIQ.toolbars.disableItem('#center_tb', '#{command}_all');"
        page << "ManageIQ.toolbars.markItem('#center_tb', '#{command}_all');"
        page << "ManageIQ.toolbars.enableItem('#center_tb', '#{command}_same');"
        page << "ManageIQ.toolbars.unmarkItem('#center_tb', '#{command}_same');"
        page << "ManageIQ.toolbars.enableItem('#center_tb', '#{command}_diff');"
        page << "ManageIQ.toolbars.unmarkItem('#center_tb', '#{command}_diff');"
      end
      page.replace_html('main_div', :partial => 'layouts/compare')
      page << 'miqSparkle(false);'
    end
  end

  def compare_all_diff_same
    @compare = Marshal.load(session[:miq_compare])
    @compressed = session[:miq_compressed]
    @exists_mode = session[:miq_exists_mode]
    @compare.remove_id(params[:id].to_i) if @lastaction == "compare_remove"
    drop_breadcrumb(:name => _("Compare %{name}") % {:name => session[:db_title]},
                    :url  => "/#{session[:db_title].singularize.downcase}/compare_miq")
    @lastaction = "compare_miq"
    if params[:ppsetting]                                 # User selected new per page value
      @items_per_page = params[:ppsetting].to_i           # Set the new per page value
    end
    compare_to_json(@compare)
    update_compare_partial('compare', @sb[:miq_temp_params])
  end

  # Compare multiple VMs to show same
  def compare_miq_differences
    @sb[:miq_temp_params] = "different"
    compare_all_diff_same
  end

  # User selected a new base VM
  def compare_choose_base
    @compare = Marshal.load(session[:miq_compare])
    @compressed = session[:miq_compressed]
    @exists_mode = session[:miq_exists_mode]
    @compare.set_base_record(params[:id].to_i) if @lastaction == "compare_miq" # Remove the VM from the vm compare
    compare_to_json(@compare)
    replace_main_div({:partial => "layouts/compare"}, {:spinner_off => true})
  end

  # Toggle compressed/expanded view
  def compare_compress
    @compare = Marshal.load(session[:miq_compare])
    @exists_mode = session[:miq_exists_mode]
    session[:miq_compressed] = !session[:miq_compressed]
    @compressed = session[:miq_compressed]
    compare_to_json(@compare)
    render :update do |page|
      page << javascript_prologue
      if @compressed
        page << "ManageIQ.toolbars.enableItem('#view_tb', 'compare_expanded');"
        page << "ManageIQ.toolbars.unmarkItem('#view_tb', 'compare_expanded');"
        page << "ManageIQ.toolbars.disableItem('#view_tb', 'compare_compressed');"
        page << "ManageIQ.toolbars.markItem('#view_tb', 'compare_compressed');"
      else
        page << "ManageIQ.toolbars.disableItem('#view_tb', 'compare_expanded');"
        page << "ManageIQ.toolbars.markItem('#view_tb', 'compare_expanded');"
        page << "ManageIQ.toolbars.enableItem('#view_tb', 'compare_compressed');"
        page << "ManageIQ.toolbars.unmarkItem('#view_tb', 'compare_compressed');"
      end
      page.replace_html("main_div", :partial => "layouts/compare") # Replace the main div area contents
      page << "miqSparkle(false);"
    end
  end

  # Toggle exists/details view
  def compare_mode
    @keep_compare = true
    @compare = Marshal.load(session[:miq_compare])
    session[:miq_exists_mode] = !session[:miq_exists_mode]
    @exists_mode = session[:miq_exists_mode]
    compare_to_json(@compare)
    render :update do |page|
      page << javascript_prologue
      if @exists_mode
        page << "ManageIQ.toolbars.enableItem('#center_tb', 'comparemode_details');"
        page << "ManageIQ.toolbars.unmarkItem('#center_tb', 'comparemode_details');"
        page << "ManageIQ.toolbars.disableItem('#center_tb', 'comparemode_exists');"
        page << "ManageIQ.toolbars.markItem('#center_tb', 'comparemode_exists');"
      else
        page << "ManageIQ.toolbars.disableItem('#center_tb', 'comparemode_details');"
        page << "ManageIQ.toolbars.markItem('#center_tb', 'comparemode_details');"
        page << "ManageIQ.toolbars.enableItem('#center_tb', 'comparemode_exists');"
        page << "ManageIQ.toolbars.unmarkItem('#center_tb', 'comparemode_exists');"
      end
      page.replace_html("main_div", :partial => "layouts/compare") # Replace the main div area contents
      page << "miqSparkle(false);"
    end
  end

  def compare_set_state
    @keep_compare = true
    session[:compare_state] ||= {}
    if !session[:compare_state].include?(params["rowId"])
      session[:compare_state][params["rowId"]] = params["state"]
    elsif session[:compare_state].include?(params["rowId"]) && params["state"].to_i == -1
      session[:compare_state].delete(params["rowId"])
    end
    render :update do |page|
      page << javascript_prologue
      page << "miqSparkle(false);"
      # head :ok
    end
  end

  # User checked/unchecked a compare section
  def compare_checked
    section_checked(:compare)
  end

  # Remove one of the VMs from the @compare object
  def compare_remove
    @compare = Marshal.load(session[:miq_compare])
    @compressed = session[:miq_compressed]
    @exists_mode = session[:miq_exists_mode]
    @compare.remove_record(params[:id].to_i) if @lastaction == "compare_miq" # Remove the VM from the vm compare
    compare_to_json(@compare)
    replace_main_div({:partial => "layouts/compare"}, {:spinner_off => true})
  end

  # Send the current compare data in text format
  def compare_to_txt
    @compare = Marshal.load(session[:miq_compare])
    rpt = create_compare_report
    filename = "compare_report_" + format_timezone(Time.now, Time.zone, "fname")
    disable_client_cache
    send_data(rpt.to_text, :filename => "#{filename}.txt")
  end

  # Send the current compare data in CSV format
  def compare_to_csv
    @compare = Marshal.load(session[:miq_compare])
    rpt = create_compare_report(true)
    filename = "compare_report_" + format_timezone(Time.now, Time.zone, "fname")
    disable_client_cache
    send_data(rpt.to_csv, :filename => "#{filename}.csv")
  end

  # Send the current compare data in PDF format
  def compare_to_pdf
    @compare = Marshal.load(session[:miq_compare])
    rpt = create_compare_report
    render_pdf(rpt)
  end

  # Cancel Compare and return to the previous screen; for non-explorer screens
  def compare_cancel
    javascript_prologue
    redirect_to(previous_breadcrumb_url)
  end

  # Create an MIQ_Report object from a compare object
  def create_compare_report(csv = false)
    create_compare_or_drift_report(:compare, csv)
  end

  # Create an MIQ_Report object from a compare object
  def create_drift_report(csv = false)
    create_compare_or_drift_report(:drift, csv)
  end

  def build_download_rpt(cols, csv, typ)
    if typ.nil? || typ == "all"
      if csv # If generating CSV, remove * from data
        cols.each_with_index do |c, i|
          if c.to_s.starts_with?("* ")
            cols[i].gsub!(/\*\s/, "")
          end
        end
      end
      @data.push(cols) # Add the row to the data array
    elsif typ == "same"
      same = true
      cols.each_with_index do |c, i|
        if c.to_s.starts_with?("* ")
          cols[i].gsub!(/\*\s/, "") if csv # If generating CSV
          same = false
        end
      end
      @data.push(cols) if same # Add the row to the data array
    elsif typ == "different"
      same = true
      cols.each_with_index do |c, i|
        if c.to_s.starts_with?("* ")
          cols[i].gsub!(/\*\s/, "") if csv # If generating CSV
          same = false
        end
      end
      @data.push(cols) unless same # Add the row to the data array
    end
  end

  def identify_obj
    @drift_obj = nil
    begin
      db = @sb[:compare_db].constantize
      @record = @drift_obj = if @sb[:compare_db] == "Host"
                               @host = find_record_with_rbac(db, params[:id])
                             elsif @sb[:compare_db] == "MiqTemplate"
                               @miq_templates = find_record_with_rbac(db, params[:id])
                             elsif @sb[:compare_db] == "Vm"
                               @vm = find_record_with_rbac(db, params[:id])
                             elsif @sb[:compare_db] == "EmsCluster"
                               find_record_with_rbac(db, params[:id])
                             else
                               find_record_with_rbac(db, params[:id])
                             end
    rescue ActiveRecord::RecordNotFound
    end
  end

  def create_drift_view
    @sb[:miq_drift_params] = "all"
    compare_init("drift") # Init compare screen variables
    identify_obj

    rpt = get_compare_report(@sb[:compare_db])
    session[:miq_sections] = MiqCompare.sections(rpt)
    @compare ||= MiqCompare.new(
      {
        :id         => @drift_obj.id.to_i,
        :mode       => :drift,
        :timestamps => session[:timestamps],
        :include    => session[:miq_sections]
      },
      rpt
    )
    get_formatted_time("_model_", "drift")
    session[:compare_state] = {}
    @compare
  end

  def format_timezone_value_for_compare(datum)
    if datum[1].kind_of?(Hash) && datum[1].key?(:_value_) &&
       datum[1][:_value_].kind_of?(Time) && datum[1][:_value_].present? &&
       datum[1][:_value_] != "" && datum[1][:_value_] != MiqCompare::EMPTY
      datum[1][:_value_] = format_timezone(datum[1][:_value_], Time.zone, "view")
    end
  end

  def format_timezone_value_for_drift(datum)
    if DRIFT_TIME_COLUMNS.include?(datum[0].to_s) && datum[1].kind_of?(Hash) &&
       datum[1].key?(:_value_) && datum[1][:_value_].present? &&
       datum[1][:_value_] != "" && datum[1][:_value_] != MiqCompare::EMPTY
      datum[1][:_value_] = format_timezone(datum[1][:_value_], Time.zone, "view")
    end
  end

  def format_data_in_section(section, method)
    @compare.results.each do |vm|
      vm[1][section.to_sym].each do |s|
        @compare.master_list.each_slice(3) do |sections, records, _fields| # section is a symbol, records and fields are arrays
          next unless sections[:name].to_s == section.to_s

          if records.blank?
            method.call(s)
          else
            next unless s[1].kind_of?(Hash)

            s[1].each { |f| method.call(f) }
          end
        end
      end
    end
  end

  def get_formatted_time(section, typ = "compare")
    method_name = typ == 'compare' ? :format_timezone_value_for_compare : :format_timezone_value_for_drift
    format_data_in_section(section, method(method_name))
  end

  # Show drift analysis for multiple VM scans
  def drift
    @lastaction = "drift"
    @compare = create_drift_view
    @sections_tree = TreeBuilderSections.new(
      :all_sections_tree,
      @sb,
      true,
      :data            => @compare,
      :controller_name => controller_name,
      :current_tenant  => current_tenant.name
    )
    drift_to_json(@compare)
    drop_breadcrumb(:name => _("'%{name}' Drift Analysis") % {:name => @drift_obj.name},
                    :url  => "/#{@sb[:compare_db].downcase}/drift")
    @sb[:miq_vm_name] = @drift_obj.name
    if params[:ppsetting] # Came in from per page setting
      replace_main_div(:partial => "layouts/compare", :id => @drift_obj.id)
    else
      @showtype = "drift"
      if @explorer
        @refresh_partial = "layouts/compare"
      else
        render :template => "compare"
      end
    end
  end

  def drift_all_same_dff
    @compare = Marshal.load(session[:miq_compare])
    @compressed = session[:miq_compressed]
    @exists_mode = session[:miq_exists_mode]
    identify_obj

    drift_to_json(@compare)
    drop_breadcrumb(:name => _("'%{name}' Drift Analysis") % {:name => @sb[:miq_vm_name]},
                    :url  => "/#{@sb[:compare_db].downcase}/drift")
    @lastaction = "drift"
    @showtype = "drift"
    update_compare_partial('drift', @sb[:miq_drift_params])
  end

  def drift_all
    @sb[:miq_drift_params] = "all"
    drift_all_same_dff
  end

  def drift_differences
    @sb[:miq_drift_params] = "different"
    drift_all_same_dff
  end

  def drift_same
    @sb[:miq_drift_params] = "same"
    drift_all_same_dff
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def sections_field_changed
    @keep_compare = true
    @explorer = %w[VMs Templates].include?(session[:db_title])
    if params[:check] == "drift"
      drift_checked
    elsif params[:check] == "compare_miq"
      compare_checked
    else
      set_checked_sections
      render :update do |page|
        page << javascript_prologue
        page << javascript_for_miq_button_visibility(!session[:selected_sections].empty?)
        page << "miqSparkle(false);"
        # head :ok
      end
    end
  end

  def set_checked_sections
    session[:selected_sections] = []
    if params[:all_checked]
      params[:all_checked].each do |a|
        s = a.split(':')
        if s.length > 1
          session[:selected_sections].push(s[1])
        end
      end
    end
  end

  def drift_checked
    section_checked(:drift)
  end

  # Toggle exists/details view
  def drift_mode
    @compare = Marshal.load(session[:miq_compare])
    identify_obj
    session[:miq_exists_mode] = !session[:miq_exists_mode]
    @exists_mode = session[:miq_exists_mode]
    drift_to_json(@compare)
    render :update do |page|
      page << javascript_prologue
      if @exists_mode
        page << "ManageIQ.toolbars.enableItem('#center_tb', 'driftmode_details');"
        page << "ManageIQ.toolbars.unmarkItem('#center_tb', 'driftmode_details');"
        page << "ManageIQ.toolbars.disableItem('#center_tb', 'driftmode_exists');"
        page << "ManageIQ.toolbars.markItem('#center_tb', 'driftmode_exists');"
      else
        page << "ManageIQ.toolbars.disableItem('#center_tb', 'driftmode_details');"
        page << "ManageIQ.toolbars.markItem('#center_tb', 'driftmode_details');"
        page << "ManageIQ.toolbars.enableItem('#center_tb', 'driftmode_exists');"
        page << "ManageIQ.toolbars.unmarkItem('#center_tb', 'driftmode_exists');"
      end
      page.replace_html("main_div", :partial => "layouts/compare") # Replace the main div area contents
      page << "miqSparkle(false);"
    end
  end

  # Toggle drift compressed/expanded view
  def drift_compress
    @compare = Marshal.load(session[:miq_compare])
    session[:miq_compressed] = !session[:miq_compressed]
    @compressed = session[:miq_compressed]
    drift_to_json(@compare)
    render :update do |page|
      page << javascript_prologue
      if @compressed
        page << "ManageIQ.toolbars.enableItem('#view_tb', 'drift_expanded');"
        page << "ManageIQ.toolbars.unmarkItem('#view_tb', 'drift_expanded');"
        page << "ManageIQ.toolbars.disableItem('#view_tb', 'drift_compressed');"
        page << "ManageIQ.toolbars.markItem('#view_tb', 'drift_compressed');"
      else
        page << "ManageIQ.toolbars.disableItem('#view_tb', 'drift_expanded');"
        page << "ManageIQ.toolbars.markItem('#view_tb', 'drift_expanded');"
        page << "ManageIQ.toolbars.enableItem('#view_tb', 'drift_compressed');"
        page << "ManageIQ.toolbars.unmarkItem('#view_tb', 'drift_compressed');"
      end
      page.replace_html("main_div", :partial => "layouts/compare") # Replace the main div area contents
      page << "miqSparkle(false);"
    end
  end

  # Send the current drift data in text format
  def drift_to_txt
    @compare = Marshal.load(session[:miq_compare])
    rpt = create_drift_report
    filename = "drift_report_" + format_timezone(Time.now, Time.zone, "fname")
    disable_client_cache
    send_data(rpt.to_text, :filename => "#{filename}.txt")
  end

  # Send the current drift data in CSV format
  def drift_to_csv
    @compare = Marshal.load(session[:miq_compare])
    rpt = create_drift_report(true)
    filename = "drift_report_" + format_timezone(Time.now, Time.zone, "fname")
    disable_client_cache
    send_data(rpt.to_csv, :filename => "#{filename}.csv")
  end

  # Send the current drift data in PDF format
  def drift_to_pdf
    @compare = Marshal.load(session[:miq_compare])
    rpt = create_drift_report
    render_pdf(rpt)
  end

  def drift_history
    @sb[:compare_db] = compare_db(controller_name)
    identify_obj
    @timestamps = @drift_obj.drift_state_timestamps
    session[:timestamps] = @timestamps
    @showtype = "drift_history"
    drop_breadcrumb(:name => _("Drift History"), :url => "/#{controller_name}/drift_history/#{@drift_obj.id}")
    @lastaction = "drift_history"
    @display = "main"
    if @explorer || request.xml_http_request? # Is this an Ajax request?
      @sb[:action] = params[:action]
      @refresh_partial = "vm_common/#{@showtype}"
      replace_right_cell
    else
      render :action => 'show'
    end
  end

  private

  def prepare_data_for_compare_or_drift_report(mode, csv)
    sb_key = mode == :compare ? :miq_temp_params : :miq_drift_params

    # Collect the data from the @compare object
    @data = []
    @compare.master_list.each_slice(3) do |section, records, fields| # section is a symbol, records and fields are arrays
      next unless @compare.include[section[:name]][:checked] # Only grab the sections that are checked
      if records.present?
        records.each do |attr|
          cols = [section[:header].to_s, attr, ""] # Start the row with section and attribute names
          # Grab the base VM's value
          bas = if records.include?(attr)
                  "Found"
                else
                  "Missing"
                end
          cols.push(bas)

          # Grab the other VMs values
          @compare.ids.each_with_index do |r, idx| # Go thru each of the VMs
            next if idx.zero? # Skip the base VM
            if @compare.results[r][section[:name]].include?(attr) # Set the report value
              rval = "Found"
              val = "Found"
            else
              rval = "Missing"
              val = "Missing"
            end
            if mode == :compare && bas.to_s != val.to_s # Mark the ones that don't match the base
              rval = "* " + rval
            elsif @compare.results[r][section[:name]][attr] && !@compare.results[r][section[:name]][attr][:_match_] # Mark the ones that don't match the base
              rval = "* " + rval
            end
            cols.push(rval)
          end
          build_download_rpt(cols, csv, @sb[sb_key]) # Add the row to the data array
        end
      end

      if records.nil? && fields.present?
        fields.each do |attr|
          cols = [section[:header].to_s, attr[:header].to_s, ""] # Start the row with section and attribute names
          @compare.ids.each_with_index do |r, idx| # Go thru each of the VMs
            rval = if !@compare.results[r][section[:name]].nil?
                     @compare.results[r][section[:name]][attr[:name]][:_value_]
                   else
                     "(missing)"
                   end
            unless idx.zero? # If not generating CSV
              if mode == :compare
                rval = "* " + rval.to_s if @compare.results[@compare.ids[0]][section[:name]][attr[:name]][:_value_].to_s != rval.to_s # Mark the ones that don't match the base
              else
                rval = "* " + rval.to_s unless @compare.results[@compare.ids[idx]][section[:name]][attr[:name]][:_match_] # Mark the ones that don't match the base
              end
            end
            cols.push(rval)
          end
          build_download_rpt(cols, csv, @sb[sb_key]) # Add the row to the data array
        end
      end

      if !records.nil? && !fields.nil? && !fields.empty?
        records.each do |level2|
          fields.each do |attr|
            cols = [section[:header].to_s, level2, attr[:header]] # Start the row with section and attribute names
            @compare.ids.each_with_index do |r, idx| # Go thru each of the VMs
              rval = if !@compare.results[r][section[:name]][level2].nil?
                       @compare.results[r][section[:name]][level2][attr[:name]][:_value_].to_s
                     else
                       "(missing)"
                     end
              if idx.positive?
                # Mark the ones that don't match the base
                if mode == :compare && @compare.results[@compare.ids[1]][section[:name]][level2].present? && @compare.results[@compare.ids[0]][section[:name]][level2][attr[:name]][:_value_].to_s != rval.to_s
                  rval = "* " + rval.to_s
                # Mark the ones that don't match the base
                elsif mode == :compare && @compare.results[@compare.ids[0]][section[:name]][level2].nil? && rval.to_s != "(missing)"
                  rval = "* " + rval.to_s
                elsif @compare.results[r][section[:name]][level2] && @compare.results[r][section[:name]][level2][attr[:name]] && !@compare.results[r][section[:name]][level2][attr[:name]][:_match_]
                  # Mark the ones that don't match the prior VM
                  rval = "* " + rval
                end
              end
              cols.push(rval)
            end
            build_download_rpt(cols, csv, @sb[sb_key]) # Add the row to the data array
          end
        end
      end

      unless csv # Don't generate % lines for csv output
        cols = if mode == :compare
                 ["#{section[:header]} - % Match:", "", "", "Base"] # Generate % line, first 3 cols
               else
                 ["#{section[:header]} - Changed:", "", ""] # Generate % line, first 3 cols
               end

        @compare.results.each do |r| # Go thru each of the VMs
          if mode == :compare
            next if r[0] == @compare.records[0]["id"] # Skip the base VM
            cols.push(r[1][section[:name]][:_match_].to_s + "%") # Grab the % value for this attr for this VM
          elsif r[1][section[:name]][:_match_] # Does it match?
            cols.push("") # Yes, push a blank string
          else
            cols.push("*") # No, mark it with an *
          end
        end
        build_download_rpt(cols, csv, "all") # Add the row to the data array
      end
    end
  end

  def column_names_for_compare_or_drift_report(mode)
    # Collect the column names from the @compare object
    column_names = ["Section", "Entry", "Sub-Entry"]

    if mode == :compare
      column_names << @compare.records[0].name
      @compare.records[1..-1].each do |r|
        column_names.push(r["name"]) unless r["id"] == @compare.records[0]["id"]
      end
    else
      @compare.ids.each do |r|
        t = r.getgm
        column_names.push(t.strftime("%m/%d/%y") + " " + t.strftime("%H:%M ") + t.zone)
      end
    end

    column_names
  end

  # Create an MIQ_Report object from a compare object
  def create_compare_or_drift_report(mode, csv = false)
    column_names = column_names_for_compare_or_drift_report(mode)
    prepare_data_for_compare_or_drift_report(mode, csv) # fills @data

    rpt           = MiqReport.new
    rpt.table     = Ruport::Data::Table.new(:data => @data, :column_names => column_names)
    rpt.cols      = column_names
    rpt.col_order = column_names
    rpt.headers   = column_names
    rpt.sortby    = [column_names[0]] # Set sortby to the first column

    if mode == :compare
      rpt.db = "<compare>" # Set special db setting for report formatter
      rpt.title = _("%{name} Compare Report (* = Value does not match base)") % {:name => ui_lookup(:model => @sb[:compare_db])}
    else
      rpt.db = "<drift>" # Set special db setting for report formatter
      rpt.title = _("%{name} '%{vm_name}' Drift Report") % {:name    => ui_lookup(:model => @sb[:compare_db]),
                                                            :vm_name => @sb[:miq_vm_name]}
    end

    rpt
  end

  # Initialize the VM compare array
  def compare_init(mode)
    @compare = nil # Clear the compare array to have it rebuilt
    if mode == "compare"
      session[:miq_compressed]  = (settings(:views, :compare) == "compressed")
      session[:miq_exists_mode] = (settings(:views, :compare_mode) == "exists")
    else
      session[:miq_compressed]  = (settings(:views, :drift) == "compressed")
      session[:miq_exists_mode] = (settings(:views, :drift_mode) == "exists")
    end
    @compressed = session[:miq_compressed]
    @exists_mode = session[:miq_exists_mode]
  end

  # Compare selected items
  def comparemiq
    assert_privileges(params[:pressed])
    items = if !session[:checked_items].nil? && @lastaction == "set_checked_items"
              session[:checked_items]
            else
              find_checked_items
            end

    title = case request.parameters["controller"].downcase
            when "ems_cluster"  then _("Clusters")
            when "vm"           then _("Virtual Machines")
            when "miq_template" then _("VM Templates")
            else request.parameters["controller"].pluralize.titleize
            end

    if items.length < 2
      add_flash(_("At least 2 %{model} must be selected for Compare") % {:model => title}, :error)
      if @layout == "vm" # In vm controller, refresh show_list, else let the other controller handle it
        show_list
        @refresh_partial = "layouts/gtl"
      end
    elsif items.length > 32
      add_flash(_("No more than 32 %{model} can be selected for Compare") % {:model => title}, :error)
      if @layout == "vm" # In vm controller, refresh show_list, else let the other controller handle it
        show_list
        @refresh_partial = "layouts/gtl"
      end
    else
      if params[:pressed]
        model, = pressed2model_action(params[:pressed])
        klass_name = compare_db(model)
        @sb[:compare_db] = klass_name
        assert_rbac(klass_name.constantize, items)
      end
      session[:miq_selected] = items # save the selected items array for the redirect to compare_miq
      if @explorer
        compare_miq(@sb[:compare_db])
      else
        javascript_redirect(:action => 'compare_miq') # redirect to build the compare screen
      end
    end
  end
  alias_method :image_compare, :comparemiq
  alias_method :instance_compare, :comparemiq
  alias_method :vm_compare, :comparemiq
  alias_method :miq_template_compare, :comparemiq

  def compare_db(kls)
    case kls
    when "host"         then "Host"
    when "ems_cluster"  then "EmsCluster"
    when "miq_template" then "MiqTemplate"
    else                     "VmOrTemplate"
    end
  end

  # Show drift
  def drift_analysis
    assert_privileges("common_drift")
    controller_name = @sb[:compare_db].underscore
    identify_obj
    tss = find_checked_items # Get the indexes of the checked timestamps, not db IDs
    if tss.length < 2
      add_flash(_("At least 2 Analyses must be selected for Drift"), :error)
      @refresh_div = "flash_msg_div"
      @refresh_partial = "layouts/flash_msg"
    elsif tss.length > 10
      add_flash(_("No more than 10 Analyses can be selected for Drift"), :error)
      @refresh_div = "flash_msg_div"
      @refresh_partial = "layouts/flash_msg"
    else
      timestamps = []
      session[:timestamps].each_with_index do |ts, idx|
        timestamps.push(ts) if tss.include?(idx.to_s)
      end
      session[:timestamps] = timestamps
      if @explorer
        drift
      else
        javascript_redirect(:controller => controller_name, :action => 'drift', :id => @drift_obj.id)
      end
    end
  end
  alias_method :common_drift, :drift_analysis

  def section_checked(mode)
    @compare = Marshal.load(session[:miq_compare])
    @compressed = session[:miq_compressed]
    @exists_mode = session[:miq_exists_mode]
    if session[:selected_sections]
      session[:miq_sections].each do |section| # Find the section
        if session[:selected_sections].include?(section[0].to_s)
          @compare.add_section(section[0])
          get_formatted_time(section[0], "compare")
        else
          @compare.remove_section(section[0])
        end
      end
    end
    send("#{mode}_to_json", @compare)
    replace_main_div({:partial => "layouts/compare"}, {:spinner_off => true})
  end

  # Build the header row of the compare grid xml
  def drift_add_header(view)
    row = []
    rowtemp = {
      :id    => "col0",
      :name  => "",
      :field => "col0",
      :width => 220
    }
    row.push(rowtemp)

    view.ids.each_with_index do |h, i|
      txt = format_timezone(h, Time.zone, "compare_hdr")
      rowtemp = {
        :id       => "col#{i + 1}",
        :field    => "col#{i + 1}",
        :width    => @compressed ? 40 : 150,
        :cssClass => "cell-effort-driven",
        :name     => @compressed ? "<span class='rotated-text'>#{txt}</span>" : txt
      }
      row.push(rowtemp)
    end
    @cols = row
  end

  # Build the total row of the compare grid xml
  def drift_add_total(view)
    row = {
      :col0  => "<span class='cell-effort-driven cell-plain'>" + _("All Sections") + "</span>",
      :id    => "id_#{@rows.length}",
      :total => true
    }
    view.ids.each_with_index do |_id, idx|
      if idx.zero?
        row.merge!(drift_add_same_image(idx, _("Same as previous")))
      elsif view.results[view.ids[idx]][:_match_] == 100
        row.merge!(drift_add_same_image(idx, _("Same as previous")))
      else
        row.merge!(drift_add_diff_image(idx, _("Changed from previous")))
      end
    end
    @rows << row
  end

  # Build a section row for the compare grid xml
  def drift_add_section(view, section, records, fields)
    cell_text = section[:header]
    length = if records.nil? # Show records count if not nil
               drift_section_fields_total(view, section, fields)
             else # Show fields count
               records.length
             end
    cell_text += " (#{length})"
    row = {
      :col0       => cell_text,
      :id         => "id_#{@rows.length}",
      :indent     => 0,
      :parent     => nil,
      :section    => true,
      :exp_id     => section[:name].to_s,
      :_collapsed => collapsed_state(section[:name].to_s)
    }
    row.merge!(drift_section_data_cols(view, section))
    @section_parent_id = @rows.length
    @rows << row
  end

  # Section fields counter (in brackets)
  # Regarding to buttons "Attributes with same/different values"
  def drift_section_fields_total(view, section, fields)
    section_fields_total(view, section, fields, :drift)
  end

  def drift_section_data_cols(view, section)
    row = {}
    view.ids.each_with_index do |id, idx|
      if idx.zero?
        row.merge!(drift_add_same_image(idx, _("Starting values")))
      else
        match_condition = view.results[id][section[:name]][:_match_]
        match_condition = view.results[id][section[:name]][:_match_exists_] if @exists_mode

        if match_condition == 100
          row.merge!(drift_add_same_image(idx, _("Same as previous")))
        else
          row.merge!(drift_add_diff_image(idx, _("Changed from previous")))
        end
      end
    end
    row
  end

  # Build a record row for the compare grid xml
  def drift_add_record(view, section, record, ridx)
    @same = true
    row = {
      :col0       => record,
      :id         => "id_#{@rows.length}",
      :indent     => 1,
      :parent     => @section_parent_id,
      :record     => true,
      :exp_id     => "#{section[:name]}_#{ridx}",
      :_collapsed => collapsed_state("#{section[:name]}_#{ridx}")
    }
    row.merge!(drift_record_data_cols(view, section, record))

    @record_parent_id = @rows.length
    @rows << row
  end

  def drift_record_data_cols(view, section, record)
    row = {}
    last_value = false # Init base value
    match = 0
    view.ids.each_with_index do |id, idx| # Go thru all of the objects
      value_found = view.results[id][section[:name]].include?(record) # Get the value for current object
      match = view.results[id][section[:name]][record][:_match_] if view.results[id][section[:name]][record]
      if idx.zero? # On the base?
        row.merge!(drift_add_same_image(idx, value_found))
      elsif @compressed # Compressed, just check if it matches base
        row.merge!(drift_record_compressed(idx, match, value_found, last_value))
      else
        row.merge!(drift_record_expanded(idx, match, value_found, last_value))
      end
      last_value = value_found # Save this record's val as the new base val
    end
    row
  end

  def drift_record_compressed(idx, match, value_found, last_value)
    if value_found != last_value || match != 100
      @same = false
    end
    text = value_found ? _("Found") : _("Missing")
    drift_add_diff_image(idx, text)
  end

  def drift_record_expanded(idx, match, value_found, last_value)
    if !@exists_mode
      drift_record_nonexistmode(idx, match, value_found, last_value)
    else
      drift_record_existmode(idx, value_found, last_value)
    end
  end

  def drift_record_nonexistmode(idx, match, value_found, last_value)
    text = value_found ? _("Found") : _("Missing")
    if value_found # This object has the record
      if last_value && match == 100
        drift_add_same_image(idx, text)
      else # Base doesn't have the record
        @same = false
        drift_add_diff_image(idx, text)
      end
    elsif last_value # Record is missing from this object. Base has the record, no match
      @same = false
      drift_add_diff_image(idx, text)
    else
      img_src = "fa fa-plus" # Base doesn't have the record, match
      img_bkg = ""
      drift_add_image_col(idx, img_src, img_bkg, text)
    end
  end

  def drift_record_existmode(idx, value_found, last_value)
    text = value_found ? _("Found") : _("Missing")
    if value_found # This object has the record
      if last_value # Base has the record
        img_bkg = ''
      else # Base doesn't have the record
        @same = false
        img_bkg = 'orange'
      end
      drift_add_image_col(idx, 'fa fa-plus', img_bkg, text)
    else # Record is missing from this object
      if last_value # Base has the record, no match
        @same = false
        img_bkg = 'orange'
      else # Base doesn't have the record, match
        img_bkg = ''
      end
      drift_add_image_col(idx, 'fa fa-minus', img_bkg, text)
    end
  end

  # Build a field row under a record row
  def drift_add_record_field(view, section, record, field)
    row = if @compressed # Compressed
            drift_record_field_compressed(view, section, record, field)
          else # Expanded
            drift_record_field_expanded(view, section, record, field)
          end
    row.merge!(:id           => "id_#{@rows.length}",
               :indent       => 2,
               :parent       => @record_parent_id,
               :record_field => true)
    @rows << row
  end

  def drift_record_field_compressed(view, section, record, field)
    basval = ""
    row = {:col0 => field[:header].to_s}

    view.ids.each_with_index do |id, idx|
      match_condition = view.results[view.ids[0]][section[:name]][record].nil? &&
                        view.results[id][section[:name]][record][field[:name]][:_match_]

      if !view.results[id][section[:name]][record].nil? && # Record exists
         !view.results[id][section[:name]][record][field[:name]].nil? # Field exists

        val = view.results[id][section[:name]][record][field[:name]][:_value_].to_s
        row.merge!(drift_record_field_exists_compressed(idx, match_condition, val))
      else
        val = view.results[id][section[:name]].include?(record) ? _("Found") : _("Missing")
        basval = val if idx.zero? # On base object, # Hang on to base value
        row.merge!(drift_add_same_image(idx, val))
      end
    end
    row
  end

  def drift_record_field_expanded(view, section, record, field)
    row = {:col0 => field[:header].to_s}

    view.ids.each_with_index do |id, idx|
      if !view.results[id][section[:name]][record].nil? && !view.results[id][section[:name]][record][field[:name]].nil?

        match_condition = !view.results[view.ids[idx - 1]][section[:name]][record].nil? &&
                          !view.results[view.ids[idx - 1]][section[:name]][record][field[:name]].nil? &&
                          view.results[view.ids[idx - 1]][section[:name]][record][field[:name]][:_value_].to_s ==
                          view.results[id][section[:name]][record][field[:name]][:_value_].to_s

        val = view.results[id][section[:name]][record][field[:name]][:_value_].to_s
        row.merge!(drift_record_field_exists_expanded(idx, match_condition, val))
      else
        match_condition = !view.results[view.ids[0]][section[:name]][record].nil? &&
                          !view.results[view.ids[0]][section[:name]][record][field[:name]].nil?

        val = "(missing)"
        row.merge!(drift_record_field_missing_expanded(idx, match_condition, val))
      end
    end
    row
  end

  def drift_record_field_exists_compressed(idx, match_condition, val)
    if idx.zero? # On base object
      drift_add_same_image(idx, val)
    elsif !match_condition # Not on base object
      drift_add_same_image(idx, val)
    else
      drift_add_diff_image(idx, val)
    end
  end

  def drift_record_field_exists_expanded(idx, match_condition, val)
    if idx.zero?
      drift_add_txt_col(idx, val, 'cell-stripe')
    elsif match_condition
      drift_add_txt_col(idx, val, 'cell-bkg-plain-no-shade')
    else
      drift_add_txt_col(idx, val, 'cell-bkg-plain-mark-txt-no-shade')
    end
  end

  def drift_record_field_missing_expanded(idx, match_condition, val)
    if idx.zero?
      drift_add_txt_col(idx, val, 'cell-stripe')
    elsif match_condition
      drift_add_txt_col(idx, val, 'cell-bkg-plain-mark-txt-no-shade-no-bold')
    else
      drift_add_txt_col(idx, val, 'cell-bkg-plain-mark-txt-black')
    end
  end

  # Build a field row under a section row
  def drift_add_section_field(view, section, field)
    @same = true
    row = {
      :col0          => field[:header].to_s,
      :id            => "id_#{@rows.length}",
      :indent        => 1,
      :parent        => @section_parent_id,
      :section_field => true
    }

    if @compressed  # Compressed
      row.merge!(drift_add_section_field_compressed(view, section, field))
    else            # Expanded
      row.merge!(drift_add_section_field_expanded(view, section, field))
    end

    @rows << row
  end

  def drift_add_section_field_compressed(view, section, field)
    row = {}
    view.ids.each_with_index do |id, idx|
      fld = view.results.fetch_path(id, section[:name], field[:name])
      val = fld[:_value_].to_s unless fld.nil?

      if fld.nil?
        val = _("No Value Found")
        row.merge!(drift_add_diff_image(idx, val))

      elsif idx.zero? # On base object
        row.merge!(drift_add_same_image(idx, val))

      elsif fld[:_match_]
        row.merge!(drift_add_same_image(idx, val))
      else
        unset_same_flag
        row.merge!(drift_add_diff_image(idx, val))
      end
    end
    row
  end

  def drift_add_section_field_expanded(view, section, field)
    row = {:col0 => field[:header]}
    view.ids.each_with_index do |id, idx|
      fld = view.results.fetch_path(id, section[:name], field[:name])
      next if fld.nil?
      val = fld[:_value_].to_s

      if idx.zero? # On base object
        img_bkg = "cell-stripe"
      elsif fld[:_match_]
        img_bkg = "cell-bkg-plain-no-shade"
      else
        style = "color: #21a0ec;" if fld[:_match_] == false
        img_bkg = "cell-bkg-plain-mark-txt-no-shade"
        unset_same_flag
      end
      row.merge!(drift_add_txt_col(idx, val, img_bkg, style))
    end
    row
  end

  def drift_add_same_image(idx, value_found)
    img_src = "compare-same"
    img_bkg = "cell-stripe"
    drift_add_image_col(idx, img_src, img_bkg, value_found)
  end

  def drift_add_diff_image(idx, value_found)
    img_src = "drift-delta"
    img_bkg = "cell-plain"
    drift_add_image_col(idx, img_src, img_bkg, value_found)
  end

  def drift_add_image_col(idx, img_src, img_bkg, value_found)
    html = ViewHelper.content_tag(:div, :class => img_bkg) do
      ViewHelper.content_tag(:i, nil, :class => img_src, :title => value_found)
    end
    {"col#{idx + 1}".to_sym => html}
  end

  def drift_add_txt_col(idx, col, img_bkg, style = nil)
    html_text = if style
                  "<div class='#{img_bkg}' style='#{style}'>#{col}</div>"
                else
                  "<div class='#{img_bkg}'>#{col}</div>"
                end
    {"col#{idx + 1}".to_sym => html_text}
  end

  # Render the view data to json for the grid view
  def compare_to_json(view)
    @rows = []
    @cols = []
    @compressed = session[:miq_compressed]
    session[:selected_sections] ||= []

    comp_add_header(view)
    comp_add_total(view)

    # Build the sections, records, and fields rows
    view.master_list.each_slice(3) do |section, records, fields| # section is a symbol, records and fields are arrays
      session[:selected_sections].push(section[:name]) if view.include[section[:name]][:checked] && !session[:selected_sections].include?(section[:name])
      next unless view.include[section[:name]][:checked]
      comp_add_section(view, section, records, fields) # Go build the section row if it's checked
      if !records.nil? # If we have records, build record rows
        compare_build_record_rows(view, section, records, fields)
      else # Here if we have fields, with no records
        compare_build_field_rows(view, section, records, fields)
      end
    end
    comp_add_footer(view)
    @grid_rows_json = @rows.to_json.to_s.html_safe
    @grid_cols_json = @cols.to_json.to_s.html_safe

    @lastaction = "compare_miq"
    @explorer = true if request.xml_http_request? && explorer_controller?
  end

  def compare_build_record_rows(view, section, records, fields)
    records.each_with_index do |record, ridx|
      comp_add_record(view, section, record, ridx)
      unless compare_delete_row
        @rows.pop
        next
      end
      next if fields.nil? # Build field rows under records

      fields.each_with_index do |field, _fidx| # If we have fields, build field rows per record
        comp_add_record_field(view, section, record, field)
      end
    end
  end

  def compare_build_field_rows(view, section, _records, fields)
    fields.each_with_index do |field, _fidx| # Build field rows per section
      comp_add_section_field(view, section, field)
      @rows.pop unless compare_delete_row
    end
  end

  def compare_delete_row
    @sb[:miq_temp_params].nil? ||
      @sb[:miq_temp_params] == "all" ||
      (@sb[:miq_temp_params] == "same" && @same) ||
      (@sb[:miq_temp_params] == "different" && !@same)
  end

  # Build the header row of the compare grid xml
  def comp_add_header(view)
    row = []
    rowtemp = {
      :id    => "col0",
      :name  => "",
      :field => "col0",
      :width => 220
    }
    row.push(rowtemp)
    view.records.each_with_index do |h, i|
      html_text = if @compressed
                    comp_add_header_compressed(view, h, i)
                  else
                    comp_add_header_expanded(view, h, i)
                  end
      rowtemp = {
        :id       => "col#{i + 1}",
        :field    => "col#{i + 1}",
        :width    => @compressed ? 40 : 190,
        :cssClass => "cell-effort-driven",
        :name     => html_text
      }
      row.push(rowtemp)
    end
    @cols = row
  end

  def comp_add_header_compressed(view, h, i)
    txt = h[:name].truncate(16)
    html_text = ""
    if %w[Vm VmOrTemplate].include?(@sb[:compare_db])
      img = ActionController::Base.helpers.image_path(h.decorate.fileicon)
      html_text << "<a title=\"#{h[:name]}\" href=\"/#{controller_name}/show/#{h[:id]}\">
                      <img src=\"#{img}\" align=\"middle\" border=\"0\" width=\"20\" height=\"20\"/>
                    </a>"
    elsif @sb[:compare_db] == "Host"
      img = ActionController::Base.helpers.image_path(h.decorate.fileicon)
      html_text << "<a href=\"/host/show/#{h[:id]}\">
                      <img src=\"#{img}\" align=\"middle\" border=\"0\" width=\"20\" height=\"20\" />
                    </a>"
    else
      icon = h.decorate.fonticon
      html_text <<
        "<a href=\"/ems_cluster/show/#{h[:id]}\">
          <i class=\"#{icon}\" align=\"middle\" border=\"0\" width=\"20\" height=\"20\"/>
        </a>"
    end
    if i.zero?
      html_text << "<a title='" + _("%{name} is the base") % {:name => h[:name]} + "'> #{txt.truncate(16)}</a>"
    else
      url = "/#{controller_name}/compare_choose_base/#{view.ids[i]}"
      html_text <<
        "<a title = '" + _("Make %{name} the base") % {:name => h[:name]} + "'
            onclick = \"miqJqueryRequest('#{url}',
                      {beforeSend: true, complete: true});\" href='#'>"
      html_text << "  #{txt.truncate(16)}"
      html_text << "</a>"
    end
    "<div class='rotated-text'>#{html_text}</div>"
  end

  def comp_add_header_expanded(view, h, i)
    render_to_string(
      :partial => 'shared/compare_header_expanded',
      :locals  => {
        :base  => i.zero?,
        :vm_id => view.ids[i],
        :h     => h
      }
    )
  end

  def comp_add_footer(view)
    row = {
      :col0       => "",
      :id         => "id_#{@rows.length}",
      :remove_col => true
    }

    if view.ids.length > 2
      view.ids.each_with_index do |_id, idx|
        next if idx.zero?
        url = "/#{controller_name}/compare_remove/#{view.records[idx].id}"
        title = _("Remove this %{title} from the comparison") % {:title => session[:db_title].singularize}
        onclick = "miqJqueryRequest('#{url}', {beforeSend: true, complete: true}); return false;"
        html_text = ViewHelper.content_tag(:button, :class => 'btn btn-default', :onclick => onclick) do
          ViewHelper.content_tag(:i, '', :class => 'pficon pficon-delete', :title => title, :alt => title)
        end
        row.merge!("col#{idx + 1}".to_sym => html_text)
      end
    end
    @rows << row
  end

  def compare_add_txt_col(idx, txt, img_bkg = "cell-stripe", style = "")
    html_text = if style.empty?
                  "<div class='#{img_bkg} cell-text-wrap'>#{txt}</div>"
                else
                  "<div class='#{img_bkg} cell-text-wrap' style='#{style}'>#{txt}</div>"
                end
    {"col#{idx + 1}".to_sym => html_text}
  end

  def compare_add_piechart_image(idx, val, image, img_bkg = "cell-plain")
    col = "<div class=\"piechart invert fill-#{image}\" title=\"#{val}\"></div>"
    html_text = "<div class='#{img_bkg}'>#{col}</div>"
    {"col#{idx + 1}".to_sym => html_text}
  end

  def compare_add_same_image(idx, val, img_bkg = "")
    img_src = "compare-same"
    drift_add_image_col(idx, img_src, img_bkg, val)
  end

  def compare_add_diff_image(idx, val)
    img_src = "compare-diff"
    img_bkg = ""
    drift_add_image_col(idx, img_src, img_bkg, val)
  end

  # Build the total row of the compare grid xml
  def comp_add_total(view)
    row = {
      :col0  => "<span class='cell-effort-driven cell-plain'>" + _("Total Matches") + "</span>",
      :id    => "id_#{@rows.length}",
      :total => true
    }
    view.ids.each_with_index do |_id, idx|
      if idx.zero?
        row.merge!(compare_add_txt_col(idx, @compressed ? "%:" : _("% Matched:")))
      else
        key = @exists_mode ? :_match_exists_ : :_match_
        pct_match = view.results[view.ids[idx]][key]
        image = calculate_match_img(pct_match)
        row.merge!(compare_add_piechart_image(idx, "#{pct_match}% matched", image))
      end
    end
    @rows << row
  end

  # Build a section row for the compare grid xml
  def comp_add_section(view, section, records, fields)
    cell_text = _(section[:header])
    length = if records.nil? # Show records count if not nil
               comp_section_fields_total(view, section, fields)
             else # Show fields count
               records.length
             end
    cell_text += " (#{length})"
    row = {
      :col0       => cell_text,
      :id         => "id_#{@rows.length}",
      :indent     => 0,
      :parent     => nil,
      :section    => true,
      :exp_id     => section[:name].to_s,
      :_collapsed => collapsed_state(section[:name].to_s)
    }
    row.merge!(compare_section_data_cols(view, section, records))

    @section_parent_id = @rows.length
    @rows << row
  end

  # Section fields counter (in brackets)
  # Regarding to buttons "Attributes with same/different values"
  def comp_section_fields_total(view, section, fields)
    section_fields_total(view, section, fields, :comp)
  end

  def compare_section_data_cols(view, section, records)
    row = {}
    view.ids.each_with_index do |id, idx|
      if idx.zero?
        row.merge!(compare_add_txt_col(idx, @compressed ? "%:" : _("% Matched:")))
      else
        key = @exists_mode && !records.nil? ? :_match_exists_ : :_match_
        pct_match = view.results[id][section[:name]][key]
        image = calculate_match_img(pct_match)
        row.merge!(compare_add_piechart_image(idx, "#{pct_match}% matched", image))
      end
    end
    row
  end

  def calculate_match_img(val)
    val == 100 ? 20 : ((val + 2) / 5.25).round # val is the percentage value stored in _match_
  end

  # Build a record row for the compare grid xml
  def comp_add_record(view, section, record, ridx)
    @same = true
    row = {
      :col0       => _(record),
      :id         => "id_#{@rows.length}",
      :indent     => 1,
      :parent     => @section_parent_id,
      :record     => true,
      :exp_id     => "#{section[:name]}_#{ridx}",
      :_collapsed => collapsed_state("#{section[:name]}_#{ridx}")
    }
    row.merge!(comp_record_data_cols(view, section, record))

    @record_parent_id = @rows.length
    @rows << row
  end

  def comp_record_data_cols(view, section, record)
    row = {}
    base_rec = view.results.fetch_path(view.ids[0], section[:name], record)
    match = 0

    view.ids.each_with_index do |id, idx| # Go thru all of the objects
      rec = view.results.fetch_path(id, section[:name], record)
      value_found = rec.present?

      match = view.results[id][section[:name]][record][:_match_] if view.results[id][section[:name]][record]
      if @compressed # Compressed, just show passed with hover value
        row.merge!(comp_record_data_compressed(idx, match, base_rec, value_found))
      else
        row.merge!(comp_record_data_expanded(idx, match, base_rec, value_found))
      end
    end
    row
  end

  def comp_record_data_compressed(idx, match, val, basval)
    if @exists_mode
      comp_record_data_compressed_existsmode(idx, match, val, basval)
    else
      comp_record_data_compressed_nonexistsmode(idx, match, val, basval)
    end
  end

  def comp_record_data_compressed_existsmode(idx, _match, value_found, basval)
    row = {}
    text = value_found ? _("Found") : _("Missing")
    if idx.zero? # On the base?
      row.merge!(drift_add_image_col(idx, "", "cell-stripe", text)) # no icon
    elsif value_found == basval # Compare this object's value to the base
      row.merge!(compare_add_same_image(idx, text))
    else
      unset_same_flag
      row.merge!(compare_add_diff_image(idx, text))
    end
    row
  end

  def comp_record_data_nonexistsmode(idx, match, value_found, last_value)
    if idx.zero?
      compare_add_txt_col(idx, "%:")
    elsif value_found # This object has the record
      if last_value # Base has the record
        img_src = calculate_match_img(match)
        unset_same_flag(match)
        compare_add_piechart_image(idx, "#{match}% matched", img_src, "")
      else
        unset_same_flag
        compare_add_piechart_image(idx, "0% matched", "0", "")
      end
    elsif last_value
      unset_same_flag
      compare_add_piechart_image(idx, "0% matched", "0", "")
    else
      compare_add_piechart_image(idx, "100% matched", "20", "")
    end
  end

  def comp_record_data_compressed_nonexistsmode(idx, match, val, basval)
    comp_record_data_nonexistsmode(idx, match, val, basval)
  end

  def comp_record_data_expanded_nonexistsmode(idx, match, val, basval)
    comp_record_data_nonexistsmode(idx, match, val, basval)
  end

  def comp_record_data_expanded(idx, match, val, basval)
    if @exists_mode
      comp_record_data_expanded_existsmode(idx, match, val, basval)
    else
      comp_record_data_expanded_nonexistsmode(idx, match, val, basval)
    end
  end

  def comp_record_data_expanded_existsmode(idx, _match, value_found, last_value)
    text = value_found ? _("Found") : _("Missing")
    if idx.zero? # On the base?
      if value_found # Base has the record
        drift_add_image_col(idx, "fa fa-plus", "cell-stripe", text)
      else # Base doesn't have the record
        unset_same_flag
        drift_add_image_col(idx, "fa fa-minus", "cell-stripe", text)
      end
    elsif value_found # This object has the record
      if last_value # Base has the record
        drift_add_image_col(idx, "fa fa-plus", "green", text)
      else # Base doesn't have the record
        unset_same_flag
        drift_add_image_col(idx, "fa fa-plus", "red", text)
      end
    elsif last_value # Record is missing from this object
      unset_same_flag # Base has the record, no match
      drift_add_image_col(idx, "fa fa-minus", "red", text)
    else # Base doesn't have the record, match
      drift_add_image_col(idx, "fa fa-minus", "green", text)
    end
  end

  def size_formatting(field_name, val)
    if %w[used_space free_space size].include?(field_name.to_s) && val != "(empty)"
      new_val = number_with_delimiter(val, :delimiter => ",", :separator => ".")
      new_val << " bytes"
    else
      val.to_s
    end
  end

  # Build a field row under a record row
  def comp_add_record_field(view, section, record, field)
    row = {
      :col0         => _(field[:header]),
      :id           => "id_#{@rows.length}",
      :indent       => 2,
      :parent       => @record_parent_id,
      :record_field => true
    }

    if @compressed # Compressed
      row.merge!(comp_add_record_field_compressed(view, section, record, field))
    else # Expanded
      row.merge!(comp_add_record_field_expanded(view, section, record, field))
    end
    @rows << row
  end

  def comp_add_record_field_compressed(view, section, record, field)
    row = {}
    base_rec = view.results.fetch_path(view.ids[0], section[:name], record)

    view.ids.each_with_index do |id, idx|
      rec = view.results.fetch_path(id, section[:name], record)
      rec_found = rec.present?
      fld = rec.nil? ? nil : rec[field[:name]]

      if fld.nil?
        val = rec_found
        row.merge!(comp_add_record_field_missing_compressed(idx, val, base_rec))
      else
        val = fld[:_value_]
        row.merge!(comp_add_record_field_exists_compressed(idx, val, base_rec, field))
      end
    end
    row
  end

  def comp_add_record_field_missing_compressed(idx, val, base_rec)
    if @exists_mode
      passed_img = "fa fa-check"
      failed_img = "fa fa-times"
    else
      passed_img = "compare-same"
      failed_img = "compare-diff"
    end

    base_rec_found = base_rec.present?
    text = val ? _("Found") : _("Missing")

    if idx.zero? # On base object
      drift_add_same_image(idx, text)
    else # Not on base object
      drift_add_image_col(idx, base_rec_found == val ? passed_img : failed_img, "", text)
    end
  end

  def comp_add_record_field_exists_compressed(idx, val, base_rec, field)
    if @exists_mode
      passed_img = "fa fa-check"
      failed_img = "fa fa-times"
    else
      passed_img = "compare-same"
      failed_img = "compare-diff"
    end

    base_fld = base_rec.nil? ? nil : base_rec[field[:name]]
    base_val = base_fld.nil? ? nil : base_fld[:_value_]

    if idx.zero? # On base object
      drift_add_same_image(idx, val)
    else # Not on base object
      drift_add_image_col(idx, base_val == val ? passed_img : failed_img, "", val)
    end
  end

  def comp_add_record_field_expanded(view, section, record, field)
    row = {}
    base_rec = view.results.fetch_path(view.ids[0], section[:name], record)

    view.ids.each_with_index do |id, idx|
      fld = view.results.fetch_path(id, section[:name], record, field[:name])
      val = fld.nil? ? nil : fld[:_value_]

      if fld.nil?
        row.merge!(comp_add_record_field_missing_expanded(idx, base_rec, field))
      else
        row.merge!(comp_add_record_field_exists_expanded(idx, val, base_rec, field))
      end
    end
    row
  end

  def comp_add_record_field_exists_expanded(idx, val, base_rec, field)
    if @exists_mode
      passed_text_color = failed_text_color = "black"
    else
      passed_text_color = "#403990"
      failed_text_color = "#21a0ec"
    end

    base_fld = base_rec.nil? ? nil : base_rec[field[:name]]
    base_val = base_fld.nil? ? nil : base_fld[:_value_]

    if idx.zero?
      compare_add_txt_col(idx, val)
    else
      style = "color:#{base_val == val ? passed_text_color : failed_text_color};"
      compare_add_txt_col(idx, size_formatting(field[:name], val), "", style)
    end
  end

  def comp_add_record_field_missing_expanded(idx, base_rec, field)
    if @exists_mode
      passed_text_color = failed_text_color = "black"
    else
      passed_text_color = "#403990"
      failed_text_color = "#21a0ec"
    end
    base_fld = base_rec.nil? ? nil : base_rec[field[:name]]

    if idx.zero?
      compare_add_txt_col(idx, _("(missing)"))
    else
      style = "color:#{base_fld.nil? ? passed_text_color : failed_text_color};"
      compare_add_txt_col(idx, _("(missing)"), "", style)
    end
  end

  # Build a field row under a section row
  def comp_add_section_field(view, section, field)
    @same = true

    row = {
      :col0          => _(field[:header]),
      :id            => "id_#{@rows.length}",
      :indent        => 1,
      :parent        => @section_parent_id,
      :section_field => true
    }

    if @compressed  # Compressed
      row.merge!(comp_add_section_field_compressed(view, section, field))
    else            # Expanded
      row.merge!(comp_add_section_field_expanded(view, section, field))
    end

    @rows << row
  end

  def comp_add_section_field_compressed(view, section, field)
    row = {}
    base_val = view.results.fetch_path(view.ids[0], section[:name], field[:name], :_value_)
    view.ids.each_with_index do |id, idx|
      fld = view.results.fetch_path(id, section[:name], field[:name])
      val = fld[:_value_] unless fld.nil?

      if fld.nil?
        row.merge!(compare_add_diff_image(idx, _("No Value Found")))
      elsif idx.zero? # On base object
        row.merge!(compare_add_same_image(idx, val, "cell-stripe"))
      else
        if base_val == val
          img_bkg = "cell-stripe"
          img = "compare-same"
        else
          img_bkg = ""
          img = "compare-diff"
          unset_same_flag
        end
        row.merge!(drift_add_image_col(idx, img, img_bkg, val))
      end
    end
    row
  end

  def comp_add_section_field_expanded(view, section, field)
    row = {}
    base_val = view.results.fetch_path(view.ids[0], section[:name], field[:name], :_value_)
    view.ids.each_with_index do |id, idx|
      fld = view.results.fetch_path(id, section[:name], field[:name])
      next if fld.nil?
      val = fld[:_value_]

      if idx.zero? # On base object
        row.merge!(compare_add_txt_col(idx, val))
      else
        if base_val == val
          style = "color:#403990;"
          img_bkg = "cell-stripe"
        else
          style = "color:#21a0ec;"
          img_bkg = ""
          unset_same_flag
        end
        row.merge!(compare_add_txt_col(idx, val, img_bkg, style))
      end
    end
    row
  end

  def unset_same_flag(match = 0)
    @same = false if match != 100
  end

  # Render the view data to xml for the grid view
  def drift_to_json(view)
    @rows = []
    @cols = []
    @layout = view.report.db == "VmOrTemplate" ? @sb[:compare_db].underscore : view.report.db.underscore
    @compressed = session[:miq_compressed]
    @exists_mode = session[:miq_exists_mode]
    session[:selected_sections] ||= []

    drift_add_header(view)
    drift_add_total(view)

    # Build the sections, records, and fields rows
    view.master_list.each_slice(3) do |section, records, fields| # section is a symbol, records and fields are arrays
      session[:selected_sections].push(section[:name]) if view.include[section[:name]][:checked] && !session[:selected_sections].include?(section[:name])
      if view.include[section[:name]][:checked]
        drift_add_section(view, section, records, fields) # Go build the section row if it's checked
        if !records.nil? # If we have records, build record rows
          drift_build_record_rows(view, section, records, fields)
        else # Here if we have fields, with no records
          drift_build_field_rows(view, section, fields)
        end
      end
      @grid_rows_json = @rows.to_json.to_s.html_safe
      @grid_cols_json = @cols.to_json.to_s.html_safe
    end
    @lastaction = "drift"
  end

  def drift_build_record_rows(view, section, records, fields)
    records.each_with_index do |record, ridx|
      drift_add_record(view, section, record, ridx)
      unless drift_delete_row
        @rows.pop
        next
      end
      next if fields.nil? || @exists_mode # Build field rows under records
      fields.each_with_index do |field, _fidx| # If we have fields, build field rows per record
        drift_add_record_field(view, section, record, field)
      end
    end
  end

  def drift_build_field_rows(view, section, fields)
    fields.each_with_index do |field, _fidx| # Build field rows per section
      drift_add_section_field(view, section, field)
      unless drift_delete_row
        @rows.pop
        next
      end
    end
  end

  def drift_delete_row
    @sb[:miq_drift_params].nil? ||
      @sb[:miq_drift_params] == "all" ||
      (@sb[:miq_drift_params] == "same" && @same) ||
      (@sb[:miq_drift_params] == "different" && !@same)
  end

  def collapsed_state(id)
    s = session[:compare_state] || []
    !s.include?(id)
  end

  # Common evaluation of section fields total for comparation and drifts
  # @param [Symbol] comp_or_drift - :comp | :drift
  def section_fields_total(view, section, fields, comp_or_drift)
    fields_length = 0
    fields.each_with_index do |field, _fidx|
      @same = true # reset for each field
      base_val = view.results.fetch_path(view.ids[0], section[:name], field[:name], :_value_)

      section_field_compare_values(view, section, field, base_val)

      if (comp_or_drift == :comp && compare_delete_row) || (comp_or_drift == :drift && drift_delete_row)
        fields_length += 1
      end
    end
    @same = true # reset for further processing
    fields_length
  end

  # Compares one field (row) across all results (columns)
  # If different (according to base value (first column))
  # - set @same = false
  def section_field_compare_values(view, section, field, base_val)
    view.ids.each_with_index do |id, idx|
      next if idx.zero? # Not for base object

      fld = view.results.fetch_path(id, section[:name], field[:name])

      unset_same_flag unless fld.nil? || base_val == fld[:_value_]
    end
  end
end
