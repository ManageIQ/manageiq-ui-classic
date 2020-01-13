module ApplicationController::AdvancedSearch
  extend ActiveSupport::Concern

  def adv_search_clear_default_search_if_cant_be_seen
    # default search doesnt exist or if it is marked as hidden
    if @edit && @edit[:expression] && @edit[:expression][:selected].present?
      s = MiqSearch.find_by(:id => @edit[:expression][:selected][:id])
      clear_default_search if s.nil? || s.search_key == "_hidden_"
    end
  end

  # Build advanced search expression
  def adv_search_build(model)
    # Restore @edit hash if it's saved in @settings
    @expkey = :expression # Reset to use default expression key
    if session.fetch_path(:adv_search, model.to_s) && %w[tag service_tag].exclude?(@sb[:action])
      adv_search_model = session[:adv_search][model.to_s]
      @edit ||= copy_hash(adv_search_model[@expkey] ? adv_search_model : session[:edit])
      adv_search_clear_default_search_if_cant_be_seen
      @edit.delete(:exp_token)                                          # Remove any existing atom being edited
    else                                                                # Create new exp fields
      @edit ||= {}
      @edit[@expkey] ||= ApplicationController::Filter::Expression.new
      @edit[@expkey][:expression] = {"???" => "???"}                    # Set as new exp element
      @edit[@expkey][:use_mytags] = true                                # Include mytags in tag search atoms
      @edit[:custom_search] = false                                     # setting default to false
      @edit[:new] ||= {}
      if !@edit[:new][@expkey].nil? && @edit[:new][@expkey] != 0
        @edit[@expkey][:expression] = @edit[:new][@expkey]                # Copy to new exp
      else
        @edit[:new][@expkey] = @edit[@expkey][:expression]                # Copy to new exp
      end
      @edit[@expkey].history.reset(@edit[@expkey][:expression])
      @edit[:adv_search_open] = false
      @edit[@expkey][:exp_model] = model.to_s
    end
    @edit[@expkey][:exp_table] = exp_build_table(@edit[@expkey][:expression]) # Build the table to display the exp
    @edit[:in_explorer] = @explorer # Remember if we're in an explorer

    if @hist && @hist[:qs_exp] # Override qs exp if qs history button was pressed
      @edit[:adv_search_applied] = {:text => @hist[:text], :qs_exp => @hist[:qs_exp]}
      session[:adv_search][model.to_s] = copy_hash(@edit) # Save updated adv_search options
    end
  end

  def adv_search_button_saveid
    if @edit[:new_search_name].nil? || @edit[:new_search_name] == ""
      add_flash(_("Search Name is required"), :error) if params[:button] == 'saveit'
      false
    else
      s = @edit[@expkey].build_search(@edit[:new_search_name], @edit[:search_type], session[:userid])
      s.filter = MiqExpression.new(@edit[:new][@expkey]) # Set the new expression
      if s.save
        add_flash(_("%{model} search \"%{name}\" was saved") %
          {:model => ui_lookup(:model => @edit[@expkey][:exp_model]),
           :name  => @edit[:new_search_name]})
        @edit[@expkey].last_loaded_filter(s) # Save the last search loaded
        @edit[:new_search_name] = @edit[:adv_search_name] = @edit[@expkey][:exp_last_loaded][:description] unless @edit[@expkey][:exp_last_loaded].nil?
        @edit[@expkey][:expression] = copy_hash(@edit[:new][@expkey])
        # Build the expression table
        @edit[@expkey][:exp_table] = exp_build_table(@edit[@expkey][:expression])
        @edit[@expkey].history.reset(@edit[@expkey][:expression])
        # Clear the current selected token
        @edit[@expkey][:exp_token] = nil
        true
      else
        s.errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        false
      end
    end
  end

  def adv_search_button_loadit
    if @edit[@expkey][:exp_chosen_search]
      @edit[:selected] = true
      s = MiqSearch.find(@edit[@expkey][:exp_chosen_search].to_s)
      @edit[:new][@expkey] = s.filter.exp
      @edit[@expkey].select_filter(s, true)
      @edit[:search_type] = s[:search_type] == 'global' ? 'global' : nil
    elsif @edit[@expkey][:exp_chosen_report]
      r = MiqReport.for_user(current_user).find(@edit[@expkey][:exp_chosen_report].to_s)
      @edit[:new][@expkey] = r.conditions.exp
      @edit[@expkey][:exp_last_loaded] = nil # Clear the last search loaded
      @edit[:adv_search_report] = r.name     # Save the report name
    end
    @edit[:new_search_name] = @edit[:adv_search_name] = @edit[@expkey][:exp_last_loaded].nil? ? nil : @edit[@expkey][:exp_last_loaded][:description]
    @edit[@expkey][:expression] = copy_hash(@edit[:new][@expkey])
    @edit[@expkey][:exp_table] = exp_build_table(@edit[@expkey][:expression]) # Build the expression table
    @edit[@expkey].history.reset(@edit[@expkey][:expression])
    @edit[@expkey][:exp_token] = nil # Clear the current selected token
    add_flash(_("%{model} search \"%{name}\" was successfully loaded") %
      {:model => ui_lookup(:model => @edit[@expkey][:exp_model]), :name => @edit[:new_search_name]})
  end

  def adv_search_button_delete
    s = MiqSearch.find(@edit[@expkey][:selected][:id])
    id = s.id
    sname = s.description
    begin
      s.destroy
    rescue StandardError => bang
      add_flash(_("Search \"%{name}\": Error during 'delete': %{error_message}") %
        {:name => sname, :error_message => bang.message}, :error)
    else
      if (def_search = settings(:default_search, @edit[@expkey][:exp_model].to_s.to_sym)) # See if a default search exists
        if id.to_i == def_search.to_i
          user_settings = current_user.settings || {}
          user_settings[:default_search].delete(@edit[@expkey][:exp_model].to_s.to_sym)
          current_user.update(:settings => user_settings)
          @edit[:adv_search_applied] = nil # clearing up applied search results
        end
      end
      add_flash(_("%{model} search \"%{name}\": Delete successful") %
        {:model => ui_lookup(:model => @edit[@expkey][:exp_model]), :name => sname})
      audit = {:event        => "miq_search_record_delete",
               :message      => "[#{sname}] Record deleted",
               :target_id    => id,
               :target_class => "MiqSearch",
               :userid       => session[:userid]}
      AuditEvent.success(audit)
    end
  end

  def adv_search_button_apply
    @edit[@expkey][:selected] = @edit[@expkey][:exp_last_loaded] # Save the last search loaded (saved)
    @edit[:adv_search_applied] ||= {}
    @edit[:adv_search_applied][:exp] = {}
    adv_search_set_text # Set search text filter suffix
    @edit[:selected] = true
    @edit[:adv_search_applied][:exp] = copy_hash(@edit[:new][@expkey]) # Save the expression to be applied
    @edit[@expkey].exp_token = nil                            # Remove any existing atom being edited
    @edit[:adv_search_open] = false                           # Close the adv search box
    if MiqExpression.quick_search?(@edit[:adv_search_applied][:exp])
      quick_search_show
      return
    else
      @edit[:adv_search_applied].delete(:qs_exp) # Remove any active quick search
      session[:adv_search] ||= {}                # Create/reuse the adv search hash
      session[:adv_search][@edit[@expkey][:exp_model]] = copy_hash(@edit) # Save by model name in settings
    end
    if @edit[:in_explorer]
      self.x_node = "root" # Position on root node
      replace_right_cell
    else
      javascript_redirect(:action => 'show_list') # redirect to build the list screen
    end
  end

  def adv_search_button_reset_fields
    @edit[@expkey][:exp_last_loaded] = nil                    # Clear the last search loaded
    @edit[@expkey][:selected] = nil                           # Clear selected search
    search_expression_reset_fields
  end

  def search_expression_reset_fields
    @edit[@expkey][:expression] = {"???" => "???"}                            # Set as new exp element
    @edit[:new][@expkey] = @edit[@expkey][:expression]                        # Copy to new exp
    @edit[@expkey].history.reset(@edit[@expkey][:expression])
    @edit[@expkey][:exp_table] = exp_build_table(@edit[@expkey][:expression]) # Rebuild the expression table
    @edit[:adv_search_name] = @edit[:new_search_name] = nil                   # Clear search name
    @edit[:adv_search_report] = nil                                           # Clear the report name
  end

  def adv_search_redraw_tree_and_main(tree)
    display_mode = params[:button] == 'save' ? params[:button] : nil
    tree_name = x_active_tree.to_s
    render :update do |page|
      page << javascript_prologue
      page.replace("#{tree_name}_div",  :partial => "shared/tree",               :locals => {:tree => tree, :name => tree_name})
      page.replace("adv_search_body",   :partial => "layouts/adv_search_body",   :locals => {:mode => display_mode, :force => true})
      page.replace("adv_search_footer", :partial => "layouts/adv_search_footer", :locals => {:mode => display_mode, :force => true})
    end
  end

  def adv_search_redraw_listnav_and_main
    display_mode = params[:button] == 'save' ? params[:button] : nil
    render :update do |page|
      page << javascript_prologue
      page.replace(:listnav_div, :partial => "layouts/listnav")
      page.replace("adv_search_body",   :partial => "layouts/adv_search_body",   :locals => {:mode => display_mode, :force => true})
      page.replace("adv_search_footer", :partial => "layouts/adv_search_footer", :locals => {:mode => display_mode, :force => true})
    end
  end

  def adv_search_redraw_left_div
    if x_active_tree.to_s == "configuration_manager_cs_filter_tree"
      build_accordions_and_trees
      load_or_clear_adv_search
    elsif @edit[:in_explorer] || %w[storage_tree configuration_scripts_tree svcs_tree].include?(x_active_tree.to_s)
      tree_type = x_active_tree.to_s.sub(/_tree/, '').to_sym
      builder = TreeBuilder.class_for_type(tree_type)
      tree = builder.new(x_active_tree, @sb)
      if tree_for_building_accordions?
        @explorer = true
        build_accordions_and_trees
      else
        adv_search_redraw_tree_and_main(tree)
        return
      end
    elsif %w[ems_cloud ems_infra].include?(@layout)
      build_listnav_search_list(@view.db)
    else
      build_listnav_search_list(@edit[@expkey][:exp_model])
    end

    adv_search_redraw_listnav_and_main
  end

  def tree_for_building_accordions?
    %w[automation_manager_cs_filter_tree
       configuration_scripts_tree
       images_filter_tree
       instances_filter_tree
       svcs_tree
       storage_tree
       templates_filter_tree
       templates_images_filter_tree
       vms_filter_tree
       vms_instances_filter_tree].include?(x_active_tree.to_s)
  end

  def adv_search_redraw_search_partials(display_mode = nil)
    render :update do |page|
      page << javascript_prologue
      unless %w[load save].include?(display_mode)
        @edit[@expkey][:exp_chosen_report] = nil
        @edit[@expkey][:exp_chosen_search] = nil
      end
      page.replace("adv_search_body",   :partial => "layouts/adv_search_body",   :locals => {:mode => display_mode, :force => true})
      page.replace("adv_search_footer", :partial => "layouts/adv_search_footer", :locals => {:mode => display_mode, :force => true})
    end
  end

  # One of the form buttons was pressed on the advanced search panel
  def adv_search_button
    @edit = session[:edit]
    @view = session[:view]

    # setting default to false
    @edit[:custom_search] = false

    case params[:button]
    when "save", "saveit"
      if adv_search_button_saveid
        adv_search_redraw_left_div
      else
        @edit[:search_type] = nil unless @edit.key?(:search_type)
        adv_search_redraw_search_partials('save')
      end

    when "loadit"
      adv_search_button_loadit
      adv_search_redraw_search_partials

    when 'load'
      adv_search_redraw_search_partials('load')

    when "delete"
      adv_search_button_delete
      adv_search_button_reset_fields
      adv_search_redraw_left_div

    when "reset"
      add_flash(_("The current search details have been reset"), :warning)
      adv_search_button_reset_fields
      adv_search_redraw_search_partials

    when "apply"
      adv_search_button_apply

    when "cancel"
      @edit[@expkey][:exp_table] = exp_build_table(@edit[@expkey][:expression]) # Rebuild the existing expression table
      @edit[@expkey].prefill_val_types
      adv_search_redraw_search_partials

    end
  end

  # One of the load choices was selected on the advanced search load panel
  def adv_search_load_choice
    @edit = session[:edit]
    if params[:chosen_search]
      @edit[@expkey][:exp_chosen_report] = nil
      if params[:chosen_search] == "0"
        @edit[@expkey][:exp_chosen_search] = nil
      else
        @edit[@expkey][:exp_chosen_search] = params[:chosen_search].to_i
        @exp_to_load = exp_build_table(MiqSearch.find(params[:chosen_search]).filter.exp)
      end
    else
      @edit[@expkey][:exp_chosen_search] = nil
      if params[:chosen_report] == "0"
        @edit[@expkey][:exp_chosen_report] = nil
      else
        @edit[@expkey][:exp_chosen_report] = params[:chosen_report].to_i
        @exp_to_load = exp_build_table(MiqReport.for_user(current_user).find(params[:chosen_report]).conditions.exp)
      end
    end
    adv_search_redraw_search_partials('load')
  end

  # Character typed into search name field
  def adv_search_name_typed
    @edit = session[:edit]
    @edit[:new_search_name] = params[:search_name] if params[:search_name]
    @edit[:search_type] = params[:search_type].to_s == "1" ? "global" : nil if params[:search_type]
    render :update do |page|
      page << javascript_prologue
    end
  end

  # Clear the applied search
  def adv_search_clear
    respond_to do |format|
      format.js do
        @explorer = true
        if (x_active_tree.to_s =~ /_filter_tree$/ || x_active_tree.to_s == "svcs_tree") &&
           !%w[Vm MiqTemplate].include?(TreeBuilder.get_model_for_prefix(@nodetype))
          search_id = 0
          adv_search_build(model_from_active_tree(x_active_tree))
          session[:edit] = @edit # Set because next method will restore @edit from session
        end
        listnav_search_selected(search_id) # Clear or set the adv search filter
        # no root node for My Services
        self.x_node = x_active_tree.to_s == "svcs_tree" ? "xx-asrv" : "root"
        replace_right_cell
      end
      format.html do
        @edit = session[:edit]
        @view = session[:view]
        @edit[:adv_search_applied] = nil
        @edit[:expression][:exp_last_loaded] = nil
        session[:adv_search] ||= {}                                         # Create/reuse the adv search hash
        session[:adv_search][@edit[@expkey][:exp_model]] = copy_hash(@edit) # Save by model name in settings
        default_search = settings(:default_search, @view.db.to_s.to_sym)
        if default_search.present? && default_search.to_i != 0
          s = MiqSearch.find(default_search)
          @edit[@expkey].select_filter(s)
          @edit[:selected] = false
        else
          @edit[@expkey][:selected] = {:id => 0}
          @edit[:selected] = true     # Set a flag, this is checked whether to load initial default or clear was clicked
        end
        redirect_to(:action => "show_list")
      end
      format.any { head :not_found }  # Anything else, just send 404
    end
  end
end
