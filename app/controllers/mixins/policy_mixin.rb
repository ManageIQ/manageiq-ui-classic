module Mixins
  module PolicyMixin
    def send_button_changes
      if @edit
        @changed = (@edit[:new] != @edit[:current])
      elsif @assign
        @changed = (@assign[:new] != @assign[:current])
      end
      render :update do |page|
        page << javascript_prologue
        if @edit
          if @refresh_inventory
            page.replace("action_options_div", :partial => "action_options")
          end
          if @action_type_changed || @snmp_trap_refresh
            page.replace("action_options_div", :partial => "action_options")
          elsif @alert_refresh
            page.replace("alert_details_div",  :partial => "alert_details")
          elsif @to_email_refresh
            page.replace("edit_to_email_div",
                         :partial => "layouts/edit_to_email",
                         :locals  => {:action_url => "alert_field_changed", :record => @alert})
          elsif @alert_snmp_refresh
            page.replace("alert_snmp_div", :partial => "alert_snmp")
          elsif @alert_mgmt_event_refresh
            page.replace("alert_mgmt_event_div", :partial => "alert_mgmt_event")
          end
        elsif @assign
          if params.key?(:chosen_assign_to) || params.key?(:chosen_cat)
            page.replace("alert_profile_assign_div", :partial => "alert_profile_assign")
          end
        end
        page << javascript_for_miq_button_visibility_changed(@changed)
        page << "miqSparkle(false);"
      end
    end

    def set_search_text
      @sb[:pol_search_text] ||= {}
      if params[:search_text]
        @search_text = params[:search_text].strip
        @sb[:pol_search_text][x_active_tree] = @search_text unless @search_text.nil?
      else
        @sb[:pol_search_text].delete(x_active_tree) if params[:action] == 'search_clear'
        @search_text = @sb[:pol_search_text][x_active_tree]
      end
    end

    def peca_get_all(what, get_view)
      @no_checkboxes       = true
      @showlinks           = true
      @lastaction          = "#{what}_get_all"
      @force_no_grid_xml   = true
      @gtl_type            = "list"
      if params[:ppsetting]                                               # User selected new per page value
        @items_per_page = params[:ppsetting].to_i                         # Set the new per page value
        @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
      end
      sortcol_key = "#{what}_sortcol".to_sym
      sortdir_key = "#{what}_sortdir".to_sym
      @sortcol    = (session[sortcol_key] || 0).to_i
      @sortdir    =  session[sortdir_key] || 'ASC'
      set_search_text
      @_params[:search_text] = @search_text if @search_text && @_params[:search_text] # Added to pass search text to get_view method
      @view, @pages = get_view.call # Get the records (into a view) and the paginator
      @current_page = @pages[:current] unless @pages.nil? # save the current page number
      session[sortcol_key]     = @sortcol
      session[sortdir_key]     = @sortdir

      if pagination_or_gtl_request? && @show_list
        render :update do |page|
          page << javascript_prologue
          page.replace("gtl_div", :partial => "layouts/gtl", :locals => {:action_url => "#{what}_get_all", :button_div => 'policy_bar'})
          page << "miqSparkleOff();"
        end
      end

      @sb[:tree_typ]   = what.pluralize
      @right_cell_text = _("All %{items}") % {:items => what.pluralize.titleize}
      @right_cell_div  = "#{what}_list"
    end

    def validate_snmp_options(options)
      if options[:host].nil? || options[:host] == ""
        add_flash(_("Host is required"), :error)
      end

      if options[:trap_id].nil? || options[:trap_id] == ""
        trap_text = if options[:snmp_version] == "v1" || options[:snmp_version].nil?
                      _("Trap Number is required")
                    else
                      _("Trap Object ID is required")
                    end
        add_flash(trap_text, :error)
      end
      options[:variables].each_with_index do |var, _i|
        if var[:oid].blank? || var[:value].blank? || var[:var_type] == "<None>"
          if var[:oid].present? && var[:var_type] != "<None>" && var[:var_type] != "Null" && var[:value].blank?
            add_flash(_("Value missing for %{field}") % {:field => var[:oid]}, :error)
          elsif var[:oid].blank? && var[:var_type] != "<None>" && var[:var_type] != "Null" && var[:value].present?
            add_flash(_("Object ID missing for %{field}") % {:field => var[:value]}, :error)
          elsif var[:oid].present? && var[:var_type] == "<None>" && var[:value].blank?
            add_flash(_("Type missing for %{field}") % {:field => var[:oid]}, :error)
            add_flash(_("Value missing for %{field}") % {:field => var[:oid]}, :error)
          elsif var[:oid].blank? && var[:var_type] == "Null" && var[:value].blank?
            add_flash(_("Object ID missing for %{field}") % {:field => var[:var_type]}, :error)
          elsif var[:oid].blank? && var[:var_type] != "<None>" && var[:value].blank?
            add_flash(_("Object ID and Values missing for %{field}") % {:field => var[:var_type]}, :error)
          elsif var[:oid].blank? && var[:var_type] != "Null" && var[:var_type] != "<None>" && var[:value].blank?
            add_flash(_("Object ID missing for %{field}") % {:field => var[:var_type]}, :error)
          end
        end
      end
    end

    def build_snmp_options(subkey, process_variables)
      refresh = false
      @edit[:new][subkey][:host] = params[:host] if params[:host]         # Actions support a single host in this key
      @edit[:new][subkey][:host][0] = params[:host_1] if params[:host_1]  # Alerts support an array of hosts
      @edit[:new][subkey][:host][1] = params[:host_2] if params[:host_2]
      @edit[:new][subkey][:host][2] = params[:host_3] if params[:host_3]
      @edit[:new][subkey][:snmp_version] = params[:snmp_version] if params[:snmp_version]
      @edit[:new][subkey][:trap_id]      = params[:trap_id] if params[:trap_id]
      refresh = true if params[:snmp_version]
      if process_variables
        params.each do |var, _value|
          vars = var.split("__")
          next unless %w[oid var_type value].include?(vars[0])

          10.times do |i|
            f = ("oid__" + (i + 1).to_s)
            t = ("var_type__" + (i + 1).to_s)
            v = ("value__" + (i + 1).to_s)
            @edit[:new][subkey][:variables][i][:oid] = params[f] if params[f.to_s]
            @edit[:new][subkey][:variables][i][:var_type] = params[t] if params[t.to_s]
            if params[t.to_s] == "<None>" || params[t.to_s] == "Null"
              @edit[:new][subkey][:variables][i][:value] = ""
            end
            if params[t.to_s] == "<None>"
              @edit[:new][subkey][:variables][i][:oid] = ""
            end
            refresh = true if params[t.to_s]
            @edit[:new][subkey][:variables][i][:value] = params[v] if params[v.to_s]
          end
        end
      end
      refresh
    end
  end
end
