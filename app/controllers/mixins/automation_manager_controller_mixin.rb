module Mixins
  module AutomationManagerControllerMixin
    extend ActiveSupport::Concern

    included do
      include Mixins::GenericFormMixin
      include Mixins::FindRecord
    end

    def index
      redirect_to(:action => 'explorer')
    end

    def show_list
      assert_privileges('automation_manager_providers_view')
      flash_to_session
      redirect_to(:action => 'explorer')
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

      render :layout => "application"
    end

    def identify_record(id, klass = self.class.model)
      type, _id = parse_nodetype_and_id(x_node)
      klass = TreeBuilder.get_model_for_prefix(type).constantize if type
      record = super(id, klass)
      record
    end

    def tree_autoload
      @view ||= session[:view]
      super
    end

    def change_tab
      assert_privileges('automation_manager_providers_view')
      @sb[:active_tab] = params[:tab_id]
      replace_right_cell
    end

    def cs_edit_get_form_vars
      copy_params_if_present(@edit[:new], params, %i[name description dialog_name])
      @edit[:new][:draft] = params[:draft] == "true" if params[:draft]
    end

    def cs_form_field_changed
      assert_privileges('automation_manager_edit_provider')
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

      assert_accordion_and_tree_privileges(x_active_tree)

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
        replace_right_cell unless @edit && @edit[:adv_search_applied] && MiqExpression.quick_search?(@edit[:adv_search_applied][:exp])
      end
    end

    def accordion_select
      @lastaction = "explorer"

      @sb["#{controller_name.underscore}_search_text".to_sym] ||= {}
      @sb["#{controller_name.underscore}_search_text".to_sym]["#{x_active_accord}_search_text"] = @search_text

      self.x_active_accord = params[:id].sub(/_accord$/, '')
      self.x_active_tree   = "#{x_active_accord}_tree"

      assert_accordion_and_tree_privileges(x_active_tree)

      @search_text = @sb["#{controller_name.underscore}_search_text".to_sym]["#{x_active_accord}_search_text"]

      load_or_clear_adv_search
      replace_right_cell(:replace_trees => [x_active_accord])
    end

    private

    def tag_action
      (params[:action] == 'x_button' && %w[automation_manager_provider_tag configuration_manager_provider_tag].include?(params[:pressed])) || (params[:action] == 'tagging' && params[:pressed] == 'reset')
    end

    def replace_right_cell(options = {})
      if tag_action
        render_tagging_form
        return
      end
      replace_trees = options[:replace_trees]
      return if @in_a_form

      @explorer = true
      @in_a_form = false
      @sb[:action] = nil
      trees = rebuild_trees(replace_trees)

      record_showing = leaf_record
      presenter = rendering_objects
      get_tagdata(@record) if @record.try(:taggings)
      update_partials(record_showing, presenter) # replace_search_box is called whithin update_partials
      handle_bottom_cell(presenter)
      reload_trees_by_presenter(presenter, trees)
      rebuild_toolbars(record_showing, presenter)
      presenter[:provider_paused] = provider_paused?(@record)
      presenter[:right_cell_text] = @right_cell_text
      presenter[:osf_node] = x_node # Open, select, and focus on this node

      render :json => presenter.for_render
    end

    def display_node(id, _mode)
      if @record.nil?
        self.x_node = "root"
        get_node_info("root")
      else
        show_record(id)
        model_string = ui_lookup(:model => @record.class.to_s)
        @right_cell_text = _("%{model} \"%{name}\"") % {:name => @record.name, :model => model_string}
      end
    end

    def sync_form_to_instance
      @provider.name       = params[:name]
      @provider.url        = params[:url]
      @provider.verify_ssl = params[:verify_ssl].eql?("on") || params[:verify_ssl].eql?("true")
      @provider.zone       = Zone.find_by(:name => params[:zone].to_s) if params[:zone]
    end

    def provider_list(id, model)
      return provider_node(id, model) if id

      options = {:model => model.to_s}
      @right_cell_text = _("All %{title} Providers") % {:title => self.class.model_to_name(model)}
      process_show_list(options)
    end

    def configured_system_list(id, model)
      return configured_system_node(id, model) if id

      if x_active_tree == :automation_manager_cs_filter_tree
        options = {:model => model.to_s}
        @right_cell_text = _("All %{title} Configured Systems") % {:title => self.class.model_to_name(model)}
        process_show_list(options)
      end
    end

    def configured_system_node(id, model)
      @record = @configured_system_record = find_record(ConfiguredSystem, id)
      display_node(id, model)
    end

    def display_adv_searchbox
      !(@configured_system_record || @configuration_script_record || @in_a_form || group_summary_tab_selected?)
    end

    def miq_search_node
      options = {:model => model_from_active_tree(x_active_tree)}
      if x_active_tree == :configuration_scripts_tree
        options = {:model      => "ConfigurationScript",
                   :gtl_dbname => "automation_manager_configuration_scripts"}
      end
      process_show_list(options)
      @right_cell_text = x_active_tree == :configuration_scripts_tree ? _("All Ansible Tower Job Templates") : _("All Configured Systems")
    end

    def render_form
      presenter = rendering_objects
      @in_a_form = true
      @sb[:action] = params[:action]
      presenter.update(:main_div, r[:partial => 'form', :locals => {:controller => controller_name}])
      update_title(presenter)
      rebuild_toolbars(false, presenter)
      handle_bottom_cell(presenter)
      presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

      render :json => presenter.for_render
    end

    def render_tagging_form
      return if %w[cancel save].include?(params[:button])

      @in_a_form = true
      @right_cell_text = _("Edit Tags")
      clear_flash_msg
      presenter = rendering_objects
      update_tagging_partials(presenter)
      update_title(presenter)
      rebuild_toolbars(false, presenter)
      handle_bottom_cell(presenter)
      presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

      render :json => presenter.for_render
    end

    def render_service_dialog_form
      @in_a_form = true
      clear_flash_msg
      presenter = rendering_objects
      update_service_dialog_partials(presenter)
      rebuild_toolbars(false, presenter)
      handle_bottom_cell(presenter, true)
      presenter[:right_cell_text] = @right_cell_text

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

    def replace_search_box(presenter, locals = {})
      super(presenter, locals)

      presenter[:clear_gtl_list_grid] = @gtl_type && @gtl_type != 'list'
    end

    def handle_bottom_cell(presenter, hide_form_buttons = false)
      # Handle bottom cell
      if @pages || @in_a_form
        if (@pages && !@in_a_form) || hide_form_buttons
          presenter.hide(:form_buttons_div)
        elsif @in_a_form
          presenter.remove_paging.show(:form_buttons_div)
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

      presenter.reload_toolbars(:center => c_tb, :view => v_tb)

      presenter.set_visibility(c_tb.present? || v_tb.present?, :toolbar)

      presenter[:record_id] = @record.try(:id)

      # Hide/show searchbox depending on if a list is showing
      presenter.set_visibility(display_adv_searchbox, :adv_searchbox_div)
      presenter[:clear_search_toggle] = clear_search_status

      presenter.hide(:blocker_div) unless @edit && @edit[:adv_search_open]
      presenter.hide(:quicksearchbox)
      presenter[:hide_modal] = true

      presenter[:lock_sidebar] = @in_a_form
    end

    def construct_edit_for_audit
      @edit ||= {}
      @edit[:current] = {:name       => @provider.name,
                         :url        => @provider.url,
                         :verify_ssl => @provider.verify_ssl}
      @edit[:new] = {:name       => params[:name],
                     :url        => params[:url],
                     :verify_ssl => params[:verify_ssl]}
    end

    def breadcrumb_name(_model)
      "#{ui_lookup(:ui_title => 'foreman')} #{_('Provider')}"
    end

    def tagging_explorer_controller?
      @explorer
    end

    def valid_configured_system_record?(configured_system_record)
      configured_system_record.try(:id)
    end

    def title
      _("Providers")
    end
  end
end
