module ApplicationController::PolicySupport
  extend ActiveSupport::Concern

  # Assign/unassign policies to/from a set of objects
  def protect
    @gtl_type  = "grid"
    @display   = nil
    @edit      = session[:edit]
    profile_id = params[:id].to_i

    if params[:check] # Item was checked/unchecked
      @in_a_form = true
      if params[:check] == "0"
        @edit[:new].delete(profile_id) # Unchecked, remove from new hash
      else
        @edit[:new][profile_id] = session[:pol_items].length # Added, set to all checked
      end
      changed = (@edit[:new] != @edit[:current])
      render :update do |page|
        page << javascript_prologue
        if changed != session[:changed]
          session[:changed] = changed
          page << javascript_for_miq_button_visibility(changed)
        end
      end

    elsif params[:button] # Button was pressed
      session[:changed] = false
      if params[:button] == "cancel"
        add_flash(_("Edit policy assignments was cancelled by the user"))
        @sb[:action] = nil
      elsif params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
        @explorer = true if @edit && @edit[:explorer]       # resetting @explorer from @edit incase reset button was pressed with explorer
        protect_build_screen                                #    build the protect screen
        if @edit[:explorer]
          @sb[:action] = "protect"
          @in_a_form = true
          replace_right_cell
        else
          render "shared/views/protect"
        end
        return
      elsif params[:button] == "save"
        ppids = @edit[:new].keys + @edit[:current].keys # Get union of policy profile ids
        ppids.uniq.each do |ppid|
          next if @edit[:new][ppid] == @edit[:current][ppid] # Only process changes
          pp = MiqPolicySet.find(ppid) # Get the pol prof record
          if @edit[:new][ppid].zero? # Remove if new count is zero
            pp.remove_from(session[:pol_items], session[:pol_db])
            AuditEvent.success(protect_audit(pp, "remove_from", session[:pol_db], session[:pol_items]))
          else # else add
            pp.add_to(session[:pol_items], session[:pol_db])
            AuditEvent.success(protect_audit(pp, "add_to", session[:pol_db], session[:pol_items]))
          end
        end
        add_flash(_("Policy assignments successfully changed"))
        @sb[:action] = nil
      end
      if @edit[:explorer]
        @edit = nil if %w[cancel save].include?(params[:button])
        replace_right_cell
      else
        @edit = nil                                       # Clear out the session :edit hash
        redirect_to(previous_breadcrumb_url)
      end
    else                                                  # First time in,
      protect_build_screen                                #    build the protect screen
      unless @edit[:explorer]
        render "shared/views/protect"
      end
    end
  end

  # Perform policy simulation for a set of objects
  def policy_sim(records = [])
    # prevent adv_search_build on policy_sim screens
    @in_a_form = true

    if request.xml_http_request? # Ajax request means in explorer
      @explorer = true
      @edit ||= {}
      @edit[:explorer] = true # since there is no @edit, create @edit and save explorer to use while building url for vms in policy sim grid
      session[:edit] = @edit
    end
    @lastaction = "policy_sim"
    drop_breadcrumb(:name => _("Policy Simulation"),
                    :url  => "/#{request.parameters["controller"]}/policy_sim?continue=true")
    session[:policies] = {} unless params[:continue] # Clear current policies, unless continuing previous simulation
    records = session[:tag_items] if records.empty? && session[:tag_items].present?
    session[:tag_items] = records
    policy_sim_build_screen(records)

    if @explorer
      @record = @tagitems.first
      @in_a_form = true
      if params[:action] == "policy_sim"
        @refresh_partial = "layouts/policy_sim"
        replace_right_cell(:refresh_breadcrumbs => false)
      end
    end
  end

  # Add selected policy to the simulation
  def policy_sim_add
    @edit = session[:edit]
    @explorer = @edit[:explorer]
    # Profile was selected
    if params[:profile_id] != "<select>"
      prof = MiqPolicySet.find(params[:profile_id]) # Go thru all the profiles
      session[:policies][prof.id] = prof.description # Add it to the list
    end
    policy_sim_build_screen
    replace_main_div(:partial => "layouts/policy_sim")
  end

  # Remove selected policy from the simulation
  def policy_sim_remove
    @edit = session[:edit]
    @explorer = @edit[:explorer]
    session[:policies].delete(params[:del_pol].to_i)
    policy_sim_build_screen
    replace_main_div(:partial => "layouts/policy_sim")
  end

  # Cancel policy simulation, add flash message and redirect
  def policy_sim_cancel
    flash_to_session(_("Edit policy simulation was cancelled by the user"))
    redirect_to(previous_breadcrumb_url)
  end

  private ############################

  # Assign policies to selected records of db
  def assign_policies(db)
    assert_privileges(params[:pressed])
    session[:pol_db] = db # Remember the DB
    session[:pol_items] = find_records_with_rbac(db, checked_or_params).ids # Set the array of tag items
    @in_a_form = true
    if @explorer
      protect
      @refresh_partial = "layouts/protect"
    else
      javascript_redirect(:action => 'protect', :db => db) # redirect to build policy screen
    end
  end
  %w[image instance vm miq_template container container_replicator container_group
     container_node container_image ems_container container_project].each do |old_name|
    alias_method "#{old_name}_protect".to_sym, :assign_policies
  end

  # Build the policy assignment screen
  def protect_build_screen
    drop_breadcrumb(
      :name => _("'%{model}' Policy Assignment") % {:model => Dictionary.gettext(session[:pol_db].to_s,
                                                                                 :type     => :model,
                                                                                 :notfound => :titleize)},
      :url  => "/#{request.parameters["controller"]}/protecting"
    )
    # session[:pol_db] = session[:pol_db] == Vm ? VmOrTemplate : session[:pol_db]
    @politems = session[:pol_db].find(session[:pol_items]).sort_by(&:name) # Get the db records
    @view = get_db_view(session[:pol_db], :clickable => false) # Instantiate the MIQ Report view object
    @view.table = ReportFormatter::Converter.records2table(@politems, @view.cols + ['id'])

    @edit = {}
    @edit[:explorer] = true if @explorer
    @edit[:new] = Hash.new(0)                         # Hash to hold new policy assignment counts
    @politems.each do |i|
      i.get_policies.each do |p|
        @edit[:new][p.id] += 1                        # Add up the counts for each policy
      end
    end
    @edit[:current] = @edit[:new].dup                 # Save the existing counts
    session[:changed] = false
    @in_a_form = true
    protect_build_tree
    build_targets_hash(@politems)
  end

  def protect_build_tree
    @edit[:controller_name] = controller_name
    @edit[:pol_items] = session[:pol_items]
    @protect_tree = TreeBuilderProtect.new(:protect_tree, @sb, true, :data => @edit)
  end

  # Create policy assignment audit record
  def protect_audit(pp, mode, db, recs)
    msg = "[#{pp.name}] Policy Profile #{mode} (db:[#{db}]"
    msg += ", ids:[#{recs.sort_by(&:to_i).join(',')}])"
    event = "policyset_" + mode
    {:event => event, :target_id => pp.id, :target_class => pp.class.base_class.name, :userid => session[:userid], :message => msg}
  end

  def assigned_filters
    assigned_filters = []
    # adding assigned filters for a user into hash to display categories bold and gray out subcategory if checked
    @get_filters = [current_user.get_managed_filters].flatten
    h = Hash[*@get_filters.collect { |v| [@get_filters.index(v), v] }.flatten]
    @get_filters = h.invert
    h.each_value do |val|
      categories = Classification.categories.collect { |c| c if c.show }.compact
      categories.each do |category|
        entries = {}
        category.entries.each do |entry|
          entries[entry.description] = entry.tag.name # Get the fully qual tag name
          next unless val == entry.tag.name
          @get_filters[entry.tag.name] = "cats_#{category.description}:#{entry.description}"
          assigned_filters.push(category.description.downcase)
          session[category.description.downcase] = [] if session[category.description.downcase].nil?
          session[category.description.downcase].push(entry.description) unless session[category.description.downcase].include?(entry.description)
        end
      end
    end
    assigned_filters
  end

  # Build the policy simulation screen
  def policy_sim_build_screen(records = [])
    @edit ||= {}
    @right_cell_text = _("%{vm_or_template} Policy Simulation") % {:vm_or_template => ui_lookup(:table => vm_or_instance(records.first || session[:tag_items].first))}
    @tagitems = records.presence || session[:tag_items] # Get the db records that are being tagged
    @tagitems = @tagitems.sort_by(&:name)
    @edit[:pol_items] = session[:tag_items]
    @catinfo = {}
    @lastaction = "policy_sim"
    @pol_view = get_db_view(session[:tag_db], :clickable => false) # Instantiate the MIQ Report view object
    @pol_view.table = ReportFormatter::Converter.records2table(@tagitems, @pol_view.cols + ['id'])

    # Build the profiles selection list
    @all_profs = {}
    MiqPolicySet.all.each do |ps|
      unless session[:policies].key?(ps.id)
        @all_profs[ps.id] = ps.description
      end
    end
    @all_profs["<select>"] = if @all_profs.length.positive?
                               ""
                             else
                               _('No Policy Profiles are available')
                             end
    @gtl_type = "grid"
    build_targets_hash(@tagitems)
  end
end
