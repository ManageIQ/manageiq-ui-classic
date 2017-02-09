module Mixins
  module ManagerControllerMixin
    def index
      redirect_to :action => 'explorer'
    end

    def show_list
      redirect_to :action => 'explorer', :flash_msg => @flash_array.try(:fetch_path, 0, :message)
    end

    def add_provider
      find_or_build_provider
      sync_form_to_instance

      update_authentication_provider(:save)
    end

    def update_authentication_provider(mode = :validate)
      @provider.update_authentication(build_credentials, :save => mode == :save)
    end

    def build_credentials
      return {} unless params[:log_userid]
      {
        :default => {
          :userid   => params[:log_userid],
          :password => params[:log_password] || @provider.authentication_password
        }
      }
    end

    def save_provider
      if @provider.save
        construct_edit_for_audit
        AuditEvent.success(build_created_audit(@provider, @edit))
        @in_a_form = false
        @sb[:action] = nil
        model = "#{model_to_name(@provider.type)} #{ui_lookup(:model => 'ExtManagementSystem')}"
        if params[:id] == "new"
          add_flash(_("%{model} \"%{name}\" was added") % {:model => model, :name => @provider.name})
          process_managers([@provider.instance_eval(manager_prefix).id], "refresh_ems")
        else
          add_flash(_("%{model} \"%{name}\" was updated") % {:model => model, :name => @provider.name})
        end
        replace_right_cell
      else
        @provider.errors.each do |field, msg|
          @sb[:action] = nil
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        render_flash
      end
    end

    def cancel_provider
      @in_a_form = false
      @sb[:action] = nil
      if params[:id] == "new"
        add_flash(_("Add of %{provider} was cancelled by the user") %
          {:provider => ui_lookup(:model => 'ExtManagementSystem')})
      else
        add_flash(_("Edit of %{provider} was cancelled by the user") %
          {:provider => ui_lookup(:model => 'ExtManagementSystem')})
      end
      replace_right_cell
    end

    def authentication_validate
      find_or_build_provider
      sync_form_to_instance
      update_authentication_provider

      begin
        @provider.verify_credentials(params[:type])
      rescue => error
        render_flash(_("Credential validation was not successful: %{details}") % {:details => error}, :error)
      else
        render_flash(_("Credential validation was successful"))
      end
    end

    def explorer
      @explorer = true
      @lastaction = "explorer"

      # if AJAX request, replace right cell, and return
      if request.xml_http_request?
        replace_right_cell
        return
      end

      if params[:accordion]
        self.x_active_tree   = "#{params[:accordion]}_tree"
        self.x_active_accord = params[:accordion]
      end
      if params[:button]
        @miq_after_onload = "miqAjax('/#{controller_name}/x_button?pressed=#{params[:button]}');"
      end

      build_accordions_and_trees

      params.instance_variable_get(:@parameters).merge!(session[:exp_parms]) if session[:exp_parms] # Grab any explorer parm overrides
      session.delete(:exp_parms)
      @in_a_form = false

      if params[:id] # If a tree node id came in, show in one of the trees
        nodetype, id = params[:id].split("-")
        # treebuilder initializes x_node to root first time in locals_for_render,
        # need to set this here to force & activate node when link is clicked outside of explorer.
        @reselect_node = self.x_node = "#{nodetype}-#{to_cid(id)}"
        get_node_info(x_node)
      end
      render :layout => "application"
    end

    def tree_autoload
      @view ||= session[:view]
      super
    end

    def change_tab
      @sb[:active_tab] = params[:tab_id]
      replace_right_cell
    end

    def cs_edit_get_form_vars
      @edit[:new][:name] = params[:name] if params[:name]
      @edit[:new][:description] = params[:description] if params[:description]
      @edit[:new][:draft] = params[:draft] == "true" if params[:draft]
      @edit[:new][:dialog_name] = params[:dialog_name] if params[:dialog_name]
    end

    def cs_form_field_changed
      id = params[:id]
      return unless load_edit("cs_edit__#{id}", "replace_cell__explorer")
      cs_edit_get_form_vars
      render :update do |page|
        page << javascript_prologue
        page << javascript_hide("buttons_off")
        page << javascript_show("buttons_on")
      end
    end

    def show(id = nil)
      @flash_array = [] if params[:display]
      @sb[:action] = nil

      @display = params[:display] || "main"
      @lastaction = "show"
      @record = if managed_group_record?
                  find_record(managed_group_kls, id || params[:id])
                else
                  find_record(ConfiguredSystem, id || params[:id])
                end
      return if record_no_longer_exists?(@record)

      @explorer = true if request.xml_http_request? # Ajax request means in explorer

      @gtl_url = "/show"
    end

    def tree_select
      @lastaction = "explorer"
      @flash_array = nil
      self.x_active_tree = params[:tree] if params[:tree]
      self.x_node = params[:id]
      load_or_clear_adv_search
      apply_node_search_text if x_active_tree == "#{manager_prefix}_providers_tree".to_sym

      if action_name == "reload"
        replace_right_cell(:replace_trees => [x_active_accord])
      else
        @sb[:active_tab] = if active_tab_configured_systems?
                             'configured_systems'
                           else
                             'summary'
                           end
        replace_right_cell
      end
    end

    def accordion_select
      @lastaction = "explorer"

      @sb["#{controller_name.underscore}_search_text".to_sym] ||= {}
      @sb["#{controller_name.underscore}_search_text".to_sym]["#{x_active_accord}_search_text"] = @search_text

      self.x_active_accord = params[:id].sub(/_accord$/, '')
      self.x_active_tree   = "#{x_active_accord}_tree"

      @search_text = @sb["#{controller_name.underscore}_search_text".to_sym]["#{x_active_accord}_search_text"]

      load_or_clear_adv_search
      replace_right_cell(:replace_trees => [x_active_accord])
    end

    private ###########

    def replace_right_cell(options = {})
      replace_trees = options[:replace_trees]
      return if @in_a_form
      @explorer = true
      @in_a_form = false
      @sb[:action] = nil
      trees = rebuild_trees(replace_trees)

      record_showing = leaf_record
      presenter, r = rendering_objects
      update_partials(record_showing, presenter, r)
      replace_search_box(presenter, r)
      handle_bottom_cell(presenter, r)
      replace_trees_by_presenter(presenter, trees)
      rebuild_toolbars(record_showing, presenter)
      presenter[:right_cell_text] = @right_cell_text
      presenter[:osf_node] = x_node # Open, select, and focus on this node

      render :json => presenter.for_render
    end

    def display_node(id, _mode)
      if @record.nil?
        self.x_node = "root"
        get_node_info("root")
      else
        show_record(from_cid(id))
        model_string = ui_lookup(:model => @record.class.to_s)
        @right_cell_text = _("%{model} \"%{name}\"") % {:name => @record.name, :model => model_string}
      end
    end

    def sync_form_to_instance
      @provider.name       = params[:name]
      @provider.url        = params[:url]
      @provider.verify_ssl = params[:verify_ssl].eql?("on")
      @provider.zone       = Zone.find_by(:name => params[:zone].to_s)
    end

    def provider_list(id, model)
      return provider_node(id, model) if id
      options = {:model => model.to_s}
      @right_cell_text = _("All %{title} Providers") % {:title => model_to_name(model)}
      process_show_list(options)
    end

    def configured_system_list(id, model)
      return configured_system_node(id, model) if id
      if x_active_tree == :configuration_manager_cs_filter_tree || x_active_tree == :automation_manager_cs_filter_tree
        options = {:model => model.to_s}
        @right_cell_text = _("All %{title} Configured Systems") % {:title => model_to_name(model)}
        process_show_list(options)
      end
    end

    def configured_system_node(id, model)
      @record = @configured_system_record = find_record(ConfiguredSystem, id)
      display_node(id, model)
    end

    def display_adv_searchbox
      !(@configured_system_record || @in_a_form || group_summary_tab_selected?)
    end

    def miq_search_node
      options = {:model => "ConfiguredSystem"}
      process_show_list(options)
      @right_cell_text = _("All Configured Systems")
    end

    def rendering_objects
      presenter = ExplorerPresenter.new(
        :active_tree => x_active_tree,
        :delete_node => @delete_node,
      )
      r = proc { |opts| render_to_string(opts) }
      return presenter, r
    end

    def render_form
      presenter, r = rendering_objects
      @in_a_form = true
      presenter.update(:main_div, r[:partial => 'form', :locals => {:controller => controller_name}])
      update_title(presenter)
      rebuild_toolbars(false, presenter)
      handle_bottom_cell(presenter, r)

      render :json => presenter.for_render
    end

    def render_tagging_form
      return if %w(cancel save).include?(params[:button])
      @in_a_form = true
      @right_cell_text = _("Edit Tags")
      clear_flash_msg
      presenter, r = rendering_objects
      update_tagging_partials(presenter, r)
      update_title(presenter)
      rebuild_toolbars(false, presenter)
      handle_bottom_cell(presenter, r)

      render :json => presenter.for_render
    end

    def render_service_dialog_form
      return if %w(cancel save).include?(params[:button])
      @in_a_form = true
      clear_flash_msg
      presenter, r = rendering_objects
      update_service_dialog_partials(presenter, r)
      rebuild_toolbars(false, presenter)
      handle_bottom_cell(presenter, r)
      presenter[:right_cell_text] = @right_cell_text

      render :json => presenter.for_render
    end

    def update_tree_and_render_list(replace_trees)
      @explorer = true
      get_node_info(x_node)
      presenter, r = rendering_objects
      replace_explorer_trees(replace_trees, presenter, r)

      presenter.update(:main_div, r[:partial => 'layouts/x_gtl'])
      rebuild_toolbars(false, presenter)
      handle_bottom_cell(presenter, r)

      render :json => presenter.for_render
    end

    def update_title(presenter)
      @right_cell_text =
        case action_name
        when "new"  then _("Add a new Provider")
        when "edit" then _("Edit Provider")
        end
      presenter[:right_cell_text] = @right_cell_text
    end

    def apply_node_search_text
      setup_search_text_for_node
      previous_nodetype = search_text_type(@sb["#{controller_name.underscore}_search_text".to_sym][:previous_node])
      current_nodetype  = search_text_type(@sb["#{controller_name.underscore}_search_text".to_sym][:current_node])

      @sb["#{controller_name.underscore}_search_text".to_sym]["#{previous_nodetype}_search_text"] = @search_text
      @search_text = @sb["#{controller_name.underscore}_search_text".to_sym]["#{current_nodetype}_search_text"]
      @sb["#{controller_name.underscore}_search_text".to_sym]["#{x_active_accord}_search_text"] = @search_text
    end

    def setup_search_text_for_node
      @sb["#{controller_name.underscore}_search_text".to_sym] ||= {}
      @sb["#{controller_name.underscore}_search_text".to_sym][:current_node] ||= x_node
      @sb["#{controller_name.underscore}_search_text".to_sym][:previous_node] = @sb["#{controller_name.underscore}_search_text".to_sym][:current_node]
      @sb["#{controller_name.underscore}_search_text".to_sym][:current_node] = x_node
    end

    def replace_search_box(presenter, r)
      # Replace the searchbox
      presenter.replace(:adv_searchbox_div,
                        r[:partial => 'layouts/x_adv_searchbox'])

      presenter[:clear_gtl_list_grid] = @gtl_type && @gtl_type != 'list'
    end

    def handle_bottom_cell(presenter, r)
      # Handle bottom cell
      if @pages || @in_a_form
        if @pages && !@in_a_form
          @ajax_paging_buttons = true
          if @sb[:action] && @record # Came in from an action link
            presenter.update(:paging_div, r[:partial => 'layouts/x_pagingcontrols',
                                            :locals  => {:action_url    => @sb[:action],
                                                         :action_method => @sb[:action],
                                                         :action_id     => @record.id}])
          else
            presenter.update(:paging_div, r[:partial => 'layouts/x_pagingcontrols'])
          end
          presenter.hide(:form_buttons_div).show(:pc_div_1)
        elsif @in_a_form
          presenter.hide(:pc_div_1).show(:form_buttons_div)
        end
        presenter.show(:paging_div)
      else
        presenter.hide(:paging_div)
      end
    end

    def rebuild_toolbars(record_showing, presenter)
      if group_summary_tab_selected?
        center_tb = "blank_view_tb"
        record_showing = true
      end

      if !@in_a_form && !@sb[:action]
        center_tb ||= center_toolbar_filename
        c_tb = build_toolbar(center_tb)
        v_tb = build_toolbar(record_showing ? "x_summary_view_tb" : "x_gtl_view_tb")
      end

      h_tb = build_toolbar("x_history_tb") unless @in_a_form

      presenter.reload_toolbars(:history => h_tb, :center => c_tb, :view => v_tb)

      presenter.set_visibility(h_tb.present? || c_tb.present? || v_tb.present?, :toolbar)

      presenter[:record_id] = @record.try(:id)

      # Hide/show searchbox depending on if a list is showing
      presenter.set_visibility(display_adv_searchbox, :adv_searchbox_div)
      presenter[:clear_search_toggle] = clear_search_status

      presenter.hide(:blocker_div) unless @edit && @edit[:adv_search_open]
      presenter.hide(:quicksearchbox)
      presenter[:hide_modal] = true

      presenter.lock_tree(x_active_tree, @in_a_form)
    end

    def construct_edit_for_audit
      @edit ||= {}
      @edit[:current] = {:name       => @provider.name,
                         :provtype   => model_to_name(@provider.type),
                         :url        => @provider.url,
                         :verify_ssl => @provider.verify_ssl}
      @edit[:new] = {:name       => params[:name],
                     :provtype   => params[:provtype],
                     :url        => params[:url],
                     :verify_ssl => params[:verify_ssl]}
    end

    def breadcrumb_name(_model)
      "#{ui_lookup(:ui_title => 'foreman')} #{ui_lookup(:model => 'ExtManagementSystem')}"
    end

    def tagging_explorer_controller?
      @explorer
    end

    def valid_configured_system_record?(configured_system_record)
      configured_system_record.try(:id)
    end

    def find_record(model, id)
      raise _("Invalid input") unless is_integer?(from_cid(id))
      begin
        record = model.where(:id => from_cid(id)).first
      rescue ActiveRecord::RecordNotFound, StandardError => ex
        if @explorer
          self.x_node = "root"
          add_flash(ex.message, :error, true)
          session[:flash_msgs] = @flash_array.dup
        end
      end
      record
    end

    def title
      _("Providers")
    end
  end
end
