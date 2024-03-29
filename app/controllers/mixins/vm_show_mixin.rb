module Mixins
  module VmShowMixin
    extend ActiveSupport::Concern

    def explorer
      @explorer = true
      @lastaction = "explorer"
      @timeline = @timeline_filter = true # need to set these to load timelines on vm show screen
      if params[:menu_click]              # Came in from a chart context menu click
        @_params[:id] = parse_nodetype_and_id(x_node_right_cell).last
        @explorer = true
        perf_menu_click                   # Handle the menu action
        return
      end
      # if AJAX request, replace right cell, and return
      if request.xml_http_request?
        replace_right_cell
        return
      end

      if params[:accordion]
        self.x_active_tree   = "#{params[:accordion]}_tree"
        self.x_active_accord = params[:accordion]
      end

      # Build the Explorer screen from scratch
      allowed_features = build_accordions_and_trees_only

      params.instance_variable_get(:@parameters).merge!(session[:exp_parms]) if session[:exp_parms] # Grab any explorer parm overrides
      session.delete(:exp_parms)

      if params[:commit] == "Upload" && session.fetch_path(:edit, :new, :sysprep_enabled, 1) == "Sysprep Answer File"
        upload_sysprep_file
        set_form_locals_for_file_upload
      elsif params[:commit] == 'Upload Script'
        upload_user_script
        set_form_locals_for_file_upload
      elsif params[:commit] == "Clear Script"
        clear_user_script
        set_form_locals_for_file_upload
      end

      if params[:id]
        # if you click on a link to VM on a dashboard widget that will redirect you
        # to explorer with params[:id] and you get into the true branch
        redirected = set_elements_and_redirect_unauthorized_user
      else
        set_active_elements(allowed_features.first) unless @upload_sysprep_file || @upload_user_script
      end

      render :layout => "application" unless redirected
    end

    def set_form_locals_for_file_upload
      _partial, action, @right_cell_text = set_right_cell_vars
      locals = {:submit_button => true,
                :no_reset      => true,
                :action_url    => action}
      @x_edit_buttons_locals = locals
    end

    # VM or Template show selected, redirect to proper controller, to get links on tasks screen working
    def vm_show
      record = VmOrTemplate.find(params[:id])
      redirect_to(:action => 'show', :controller => record.class.base_model.to_s.underscore, :id => record.id)
    end

    private

    def set_active_elements(feature, _x_node_to_set = nil)
      if feature
        self.x_active_tree ||= feature.tree_name
        self.x_active_accord ||= feature.accord_name
      end
      get_node_info(x_node_right_cell)
    end

    def set_active_elements_authorized_user(tree_name, accord_name)
      self.x_active_tree   = tree_name
      self.x_active_accord = accord_name
    end

    def show_record(id = nil)
      @display = params[:display] || "main" unless pagination_or_gtl_request?

      @lastaction = "show"
      @showtype   = "config"
      @vm = @record = identify_record(id, VmOrTemplate) unless @record

      if @record.nil?
        add_flash(_("Error: Record no longer exists in the database"), :error)
        if request.xml_http_request? && params[:id] # Is this an Ajax request clicking on a node that no longer exists?
          @delete_node = params[:id]                # Set node to be removed from the tree
        end
        return
      end

      case @display
      when "download_pdf", "main"
        get_tagdata(@record)
        @showtype = "main"
        set_summary_pdf_data if ["download_pdf"].include?(@display)

      when "performance"
        @showtype = "performance"
        perf_gen_init_options                # Initialize perf chart options, charts will be generated async

      when "timeline"
        @showtype = "timeline"
        tl_build_timeline                    # Create the timeline report
      end

      get_host_for_vm(@record)
      session[:tl_record_id] = @record.id
    end

    def get_filters
      session[:vm_filters]
    end

    def get_session_data
      @title          = _("VMs And Templates")
      @layout         = controller_name
      @lastaction     = session[:vm_lastaction]
      @showtype       = session[:vm_showtype]
      @filters        = get_filters
      @catinfo        = session[:vm_catinfo]
      @display        = session[:vm_display]
      @polArr         = session[:polArr] || "" # current tags in effect
      @policy_options = session[:policy_options] || ""
    end

    def set_session_data
      session[:vm_lastaction]   = @lastaction
      session[:vm_showtype]     = @showtype
      session[:miq_compressed]  = @compressed unless @compressed.nil?
      session[:miq_exists_mode] = @exists_mode unless @exists_mode.nil?
      session[:vm_filters]      = @filters
      session[:vm_catinfo]      = @catinfo
      session[:vm_display]      = @display unless @display.nil?
      session[:polArr]          = @polArr unless @polArr.nil?
      session[:policy_options]  = @policy_options unless @policy_options.nil?
    end

    def breadcrumb_name(model)
      ui_lookup(:models => model || self.class.model.name)
    end
  end
end
