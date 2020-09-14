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

    def handle_selection_buttons_left(members, members_chosen, choices, _choices_chosen)
      if params[members_chosen].nil?
        add_flash(_("No %{members} were selected to move left") % {:members => members.to_s.split("_").first.titleize},
                  :error)
        return
      end

      if @edit[:event_id]
        # Handle Actions for an Event
        params[members_chosen].each do |mc|
          idx = nil
          # Find the index of the new members array
          @edit[:new][members].each_with_index { |mem, i| idx = mem[-1] == mc.to_i ? i : idx }
          next if idx.nil?

          desc = @edit[:new][members][idx][0].slice(4..-1) # Remove (x) prefix from the chosen item
          @edit[choices][desc] = mc.to_i # Add item back into the choices hash
          @edit[:new][members].delete_at(idx) # Remove item from the array
        end
      else
        mems = @edit[:new][members].invert
        params[members_chosen].each do |mc|
          @edit[choices][mems[mc.to_i]] = mc.to_i
          @edit[:new][members].delete(mems[mc.to_i])
        end
      end
    end

    def handle_selection_buttons_right(members, _members_chosen, choices, choices_chosen)
      if params[choices_chosen].nil?
        add_flash(_("No %{member} were selected to move right") %
                    {:member => members.to_s.split("_").first.titleize}, :error)
        return
      end

      mems = @edit[choices].invert
      if @edit[:event_id]
        # Handle Actions for an Event
        params[choices_chosen].each do |mc|
          # Add selection to chosen members array, default to synch = true
          @edit[:new][members].push(["(S) " + mems[mc.to_i], true, mc.to_i])
          @edit[choices].delete(mems[mc.to_i]) # Remove from the choices hash
        end
      else
        params[choices_chosen].each do |mc|
          @edit[:new][members][mems[mc.to_i]] = mc.to_i
          @edit[choices].delete(mems[mc.to_i])
        end
      end
    end

    def handle_selection_buttons_allleft(members, _members_chosen, choices, _choices_chosen)
      if @edit[:new][members].empty?
        add_flash(_("No %{member} were selected to move left") %
                    {:member => members.to_s.split("_").first.titleize}, :error)
        return
      end

      if @edit[:event_id]
        # Handle Actions for an Event
        @edit[:new][members].each do |m|
          # Put description/id of each chosen member back into choices hash
          @edit[choices][m.first.slice(4..-1)] = m.last
        end
      else
        @edit[:new][members].each do |key, value|
          @edit[choices][key] = value
        end
      end
      @edit[:new][members].clear
    end

    def handle_selection_buttons_sortout_selected(members_chosen)
      if params[:button].starts_with?("true")
        @true_selected = params[members_chosen][0].to_i
      else
        @false_selected = params[members_chosen][0].to_i
      end
    end

    def handle_selection_buttons_up_down(members, members_chosen, _choices, _choices_chosen, up)
      if params[members_chosen].nil? || params[members_chosen].length != 1
        message = if up
                    _("Select only one or consecutive %{member} to move up")
                  else
                    _("Select only one or consecutive %{member} to move down")
                  end

        add_flash(message % {:member => members.to_s.split("_").first.singularize.titleize}, :error)
        return
      end

      handle_selection_buttons_sortout_selected(members_chosen)
      idx = nil
      mc = params[members_chosen][0]
      # Find item index in new members array
      @edit[:new][members].each_with_index { |mem, i| idx = mem[-1] == mc.to_i ? i : idx }

      return if idx.nil?
      return if up && idx.zero? # cannot go higher
      return if !up && idx >= @edit[:new][members].length - 1 # canot go lower

      pulled = @edit[:new][members].delete_at(idx)
      delta  = up ? -1 : 1
      @edit[:new][members].insert(idx + delta, pulled)
    end

    def handle_selection_buttons_sync_async(members, members_chosen, _choices, _choices_chosen, sync)
      if params[members_chosen].nil?
        msg = if sync
                _("No %{member} selected to set to Synchronous")
              else
                _("No %{member} selected to set to Asynchronous")
              end
        add_flash(msg % {:member => members.to_s.split("_").first.titleize}, :error)
        return
      end

      handle_selection_buttons_sortout_selected(members_chosen)

      params[members_chosen].each do |mc|
        idx = nil
        # Find the index in the new members array
        @edit[:new][members].each_with_index { |mem, i| idx = mem[-1] == mc.to_i ? i : idx }
        next if idx.nil?

        letter = sync ? 'S' : 'A'
        @edit[:new][members][idx][0] = "(#{letter}) " + @edit[:new][members][idx][0].slice(4..-1) # Change prefix to (A)
        @edit[:new][members][idx][1] = sync # true for sync
      end
    end

    # Handle the middle buttons on the add/edit forms
    # pass in member list symbols (i.e. :policies)
    def handle_selection_buttons(members,
                                 members_chosen = :members_chosen,
                                 choices = :choices,
                                 choices_chosen = :choices_chosen)
      if params[:button].ends_with?("_left")
        handle_selection_buttons_left(members, members_chosen, choices, choices_chosen)
      elsif params[:button].ends_with?("_right")
        handle_selection_buttons_right(members, members_chosen, choices, choices_chosen)
      elsif params[:button].ends_with?("_allleft")
        handle_selection_buttons_allleft(members, members_chosen, choices, choices_chosen)
      elsif params[:button].ends_with?("_up")
        handle_selection_buttons_up_down(members, members_chosen, choices, choices_chosen, true)
      elsif params[:button].ends_with?("_down")
        handle_selection_buttons_up_down(members, members_chosen, choices, choices_chosen, false)
      elsif params[:button].ends_with?("_sync")
        handle_selection_buttons_sync_async(members, members_chosen, choices, choices_chosen, true)
      elsif params[:button].ends_with?("_async")
        handle_selection_buttons_sync_async(members, members_chosen, choices, choices_chosen, false)
      end
    end

    def apply_search_filter(search_str, results)
      if search_str.first == "*"
        results.delete_if { |r| !r.description.downcase.ends_with?(search_str[1..-1].downcase) }
      elsif search_str.last == "*"
        results.delete_if { |r| !r.description.downcase.starts_with?(search_str[0..-2].downcase) }
      else
        results.delete_if { |r| !r.description.downcase.include?(search_str.downcase) }
      end
    end

    # Get list of folder contents
    def folder_get_info(folder_node)
      nodetype, nodeid = folder_node.split("_")
      @sb[:mode] = nil
      @sb[:nodeid] = nil
      @sb[:folder] = nodeid.nil? ? nodetype.split("-").last : nodeid
      if x_active_tree == :policy_tree
        if nodeid.nil? && %w[compliance control].include?(nodetype.split('-').last)
          # level 1 - compliance & control
          _, mode = nodetype.split('-')
          @folders = UI_FOLDERS.collect do |model|
            "#{model.name.titleize} #{mode.titleize}"
          end
          @right_cell_text = case mode
                             when 'compliance' then _('Compliance Policies')
                             when 'control'    then _('Control Policies')
                             else _("%{typ} Policies") % {:typ => mode.titleize}
                             end
        else
          # level 2 - host, vm, etc. under compliance/control - OR deeper levels
          @sb[:mode] = nodeid.split("-")[1]
          @sb[:nodeid] = nodeid.split("-").last
          @sb[:folder] = "#{nodeid.split("-")[1]}-#{nodeid.split("-")[2]}"
          set_search_text
          policy_get_all if folder_node.split("_").length <= 2
          @right_cell_text = _("All %{typ} Policies") % {:typ => ui_lookup(:model => @sb[:nodeid].try(:camelize))}
          @right_cell_div = "policy_list"
        end
      elsif x_active_tree == :alert_profile_tree
        @alert_profiles = MiqAlertSet.where(:mode => @sb[:folder]).sort_by { |as| as.description.downcase }
        set_search_text
        @alert_profiles = apply_search_filter(@search_text, @alert_profiles) if @search_text.present?
        @right_cell_text = _("All %{typ} Alert Profiles") % {:typ => ui_lookup(:model => @sb[:folder].try(:camelize))}
        @right_cell_div = "alert_profile_list"
      end
    end

    def build_expression(parent, model)
      @edit[:new][:expression] = parent.expression.kind_of?(MiqExpression) ? parent.expression.exp : nil
      # Populate exp editor fields for the expression column
      @edit[:expression] ||= ApplicationController::Filter::Expression.new
      @edit[:expression][:expression] = [] # Store exps in an array
      if @edit[:new][:expression].blank?
        @edit[:expression][:expression] = {"???" => "???"}                    # Set as new exp element
        @edit[:new][:expression] = copy_hash(@edit[:expression][:expression]) # Copy to new exp
      else
        @edit[:expression][:expression] = copy_hash(@edit[:new][:expression])
      end
      @edit[:expression_table] = exp_build_table_or_nil(@edit[:expression][:expression])

      @expkey = :expression # Set expression key to expression
      @edit[@expkey].history.reset(@edit[:expression][:expression])
      @edit[:expression][:exp_table] = exp_build_table(@edit[:expression][:expression])
      @edit[:expression][:exp_model] = model
    end
  end
end
