module MiqPolicyController::Rsop
  extend ActiveSupport::Concern

  def rsop
    assert_privileges('policy_simulation')
    @explorer = true
    if params[:button] == "submit"
      if params[:task_id]                         # First time thru, kick off the report generate task
        miq_task = MiqTask.find(params[:task_id]) # Not first time, read the task record
        if miq_task.results_ready?
          @sb[:rsop][:results] = miq_task.task_results
          @rsop_tree = TreeBuilderPolicySimulationResults.new(:rsop_tree, @sb, true, :root => @sb[:rsop])
        else
          add_flash(_("Policy Simulation generation returned: %{error_message}") % {:error_message => miq_task.message}, :error)
        end
      else
        case @sb[:rsop][:filter]
        when "vm"
          vms = [Vm.find(@sb[:rsop][:filter_value])]
        when "ems"
          vms = ExtManagementSystem.find(@sb[:rsop][:filter_value]).vms
        when "cluster"
          vms = EmsCluster.find(@sb[:rsop][:filter_value]).all_vms
        when "host"
          vms = Host.find(@sb[:rsop][:filter_value]).vms
        end
        if vms.length.positive?
          @sb[:rsop][:out_of_scope] = true
          @sb[:rsop][:passed] = true
          @sb[:rsop][:failed] = true
          @sb[:rsop][:open] = false
          initiate_wait_for_task(:task_id => Vm.rsop_async(MiqEventDefinition.find(@sb[:rsop][:event_value]), vms))
          return
        else
          add_flash(_("No VMs match the selection criteria"), :error)
        end
      end
      render :update do |page|
        page << javascript_prologue
        page.replace_html("main_div", :partial => "rsop_results")
        page << javascript_reload_toolbars
        page << "ManageIQ.tree.expandAll = false;"
        page << "miqSparkle(false);"
      end
    elsif params[:button] == "reset"
      @sb[:rsop] = {} # Reset all RSOP stored values
      session[:changed] = nil
      javascript_redirect(:action => 'rsop')
    else # No params, first time in
      @breadcrumbs = []
      session[:changed] = false
      @sb[:rsop] ||= {} # Leave exising values
      rsop_put_objects_in_sb(find_filtered(ExtManagementSystem), :emss)
      rsop_put_objects_in_sb(find_filtered(EmsCluster), :clusters)
      rsop_put_objects_in_sb(find_filtered(Host), :hosts)
      rsop_put_objects_in_sb(find_filtered(Vm), :vms)
      rsop_put_objects_in_sb(find_filtered(Storage), :datastores)
      @rsop_events = MiqEventDefinitionSet.all.collect { |e| [e.description, e.id.to_s] }.sort
      @rsop_event_sets = MiqEventDefinitionSet.find(@sb[:rsop][:event]).miq_event_definitions.collect { |e| [e.description, e.id.to_s] }.sort unless @sb[:rsop][:event].nil?
      render :layout => "application"
    end
  end

  def rsop_option_changed
    assert_privileges('policy_simulation')
    if params[:event_typ]
      @sb[:rsop][:event] = params[:event_typ] == "<Choose>" ? nil : params[:event_typ]
      @sb[:rsop][:event_value] = nil
    end
    if params[:event_value]
      @sb[:rsop][:event_value] = params[:event_value] == "<Choose>" ? nil : params[:event_value]
    end
    if params[:filter_typ]
      @sb[:rsop][:filter] = params[:filter_typ] == "<Choose>" ? nil : params[:filter_typ]
      @sb[:rsop][:filter_value] = nil
    end
    if params[:filter_value]
      @sb[:rsop][:filter_value] = params[:filter_value] == "<Choose>" ? nil : params[:filter_value]
    end
    @rsop_events = MiqEventDefinitionSet.all.collect { |e| [e.description, e.id.to_s] }.sort
    @rsop_event_sets = MiqEventDefinitionSet.find(@sb[:rsop][:event]).miq_event_definitions.collect { |e| [e.description, e.id.to_s] }.sort unless @sb[:rsop][:event].nil?
    render :update do |page|
      page << javascript_prologue
      session[:changed] = !!(@sb[:rsop][:filter_value] && @sb[:rsop][:event_value])
      page.replace("rsop_form_div", :partial => "rsop_form")
      if session[:changed]
        page << javascript_hide("form_buttons_off")
        page << javascript_show("form_buttons_on")
      else
        page << javascript_hide("form_buttons_on")
        page << javascript_show("form_buttons_off")
      end
    end
  end

  def rsop_toggle
    assert_privileges('policy_simulation')
    @explorer = true
    @sb[:rsop][:open] = @sb[:rsop][:open] != true # set this before creating toolbar
    rsop_button_pressed
  end

  def rsop_show_options
    assert_privileges('policy_simulation')
    @explorer = true
    if params.key?(:passed)
      if params[:passed] == "null" || params[:passed] == ""
        @sb[:rsop][:passed] = false
        @sb[:rsop][:failed] = true
      else
        @sb[:rsop][:passed] = true
      end
    end
    if params.key?(:failed)
      if params[:failed] == "null" || params[:failed] == ""
        @sb[:rsop][:passed] = true
        @sb[:rsop][:failed] = false
      else
        @sb[:rsop][:failed] = true
      end
    end
    if params[:out_of_scope]
      @sb[:rsop][:out_of_scope] = (params[:out_of_scope] == "1")
    end
    @sb[:rsop][:open] = false # reset the open state to select correct button in toolbar, need to replace partial to update checkboxes in form
    @rsop_tree = TreeBuilderPolicySimulationResults.new(:rsop_tree, @sb, true, :root => @sb[:rsop])
    rsop_button_pressed
  end

  private

  def rsop_put_objects_in_sb(objects, key)
    @sb[:rsop][key] = {}
    objects
      .sort_by { |o| o.name.downcase }
      .each { |o| @sb[:rsop][key][o.id.to_s] = o.name }
  end

  def rsop_button_pressed
    render :update do |page|
      page << javascript_prologue
      if params[:action] == "rsop_toggle"
        if @sb[:rsop][:open] == true
          page << "miqTreeToggleExpand('rsop_tree', true);"
        else
          page << "miqTreeToggleExpand('rsop_tree', false)"
          page << "miqTreeActivateNodeSilently('rsop_tree', 'rsoproot');"
          @sb[:rsop][:results].each do |r|
            page << "miqTreeExpandNode('rsop_tree', 'rsoproot-v_#{r[:id]}');"
          end
        end
      else
        # if rsop_show_options came in
        page.replace_html("main_div", :partial => "rsop_results")
      end
      page << javascript_reload_toolbars
    end
  end
end
