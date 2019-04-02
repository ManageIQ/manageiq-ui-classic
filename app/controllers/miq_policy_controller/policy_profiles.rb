module MiqPolicyController::PolicyProfiles
  extend ActiveSupport::Concern

  def profile_edit
    case params[:button]
    when "cancel"
      @edit = nil
      @profile = MiqPolicySet.find(session[:edit][:profile_id]) if session[:edit] && session[:edit][:profile_id]
      if @profile.blank?
        add_flash(_("Add of new Policy Profile was cancelled by the user"))
      else
        add_flash(_("Edit of Policy Profile \"%{name}\" was cancelled by the user") % {:name => @profile.description})
      end
      get_node_info(x_node)
      replace_right_cell(:nodetype => @nodetype, :remove_form_buttons => true)
      return
    when "reset", nil # Reset or first time in
      profile_build_edit_screen
      @sb[:action] = "profile_edit"
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      replace_right_cell(:nodetype => "pp")
      return
    end

    # Load @edit/vars for other buttons
    id = params[:id] ? params[:id] : "new"
    return unless load_edit("profile_edit__#{id}", "replace_cell__explorer")
    @profile = @edit[:profile_id] ? MiqPolicySet.find(@edit[:profile_id]) : MiqPolicySet.new

    case params[:button]
    when "save", "add"
      assert_privileges("profile_#{@profile.id ? "edit" : "new"}")
      add_flash(_("Policy Profile must contain at least one Policy"), :error) if @edit[:new][:policies].length.zero? # At least one member is required
      profile = @profile.id.blank? ? MiqPolicySet.new : MiqPolicySet.find(@profile.id) # Get new or existing record
      profile.description = @edit[:new][:description]
      profile.notes = @edit[:new][:notes]
      if profile.valid? && !@flash_array && profile.save
        policies = profile.members               # Get the sets members
        current = []
        policies.each { |p| current.push(p.id) } # Build an array of the current policy ids
        mems = @edit[:new][:policies].invert     # Get the ids from the member list box
        begin
          policies.each { |c| profile.remove_member(MiqPolicy.find(c)) unless mems.include?(c.id) } # Remove any policies no longer in the members list box
          mems.each_key { |m| profile.add_member(MiqPolicy.find(m)) unless current.include?(m) }    # Add any policies not in the set
        rescue => bang
          add_flash(_("Error during 'Policy Profile %{params}': %{messages}") %
            {:params => params[:button], :messages => bang.message}, :error)
        end
        AuditEvent.success(build_saved_audit(profile, params[:button] == "add"))
        if params[:button] == "save"
          add_flash(_("Policy Profile \"%{name}\" was saved") % {:name => @edit[:new][:description]})
        else
          add_flash(_("Policy Profile \"%{name}\" was added") % {:name => @edit[:new][:description]})
        end
        profile_get_info(MiqPolicySet.find(profile.id))
        @edit = nil
        @nodetype = "pp"
        @new_profile_node = "pp-#{profile.id}"
        replace_right_cell(:nodetype => "pp", :replace_trees => %i(policy_profile), :remove_form_buttons => true)
      else
        profile.errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        replace_right_cell(:nodetype => "pp")
      end
    when "move_right", "move_left", "move_allleft"
      handle_selection_buttons(:policies)
      session[:changed] = (@edit[:new] != @edit[:current])
      replace_right_cell(:nodetype => "pp")
    end
  end

  def profile_delete
    assert_privileges("profile_delete")
    profiles = []
    # showing 1 policy set, delete it
    if params[:id].nil? || MiqPolicySet.find(params[:id]).nil?
      add_flash(_("Policy Profile no longer exists"), :error)
    else
      profiles.push(params[:id])
    end
    process_profiles(profiles, "destroy") unless profiles.empty?
    add_flash(_("The selected Policy Profile was deleted")) if @flash_array.nil?
    self.x_node = @new_profile_node = 'root'
    get_node_info('root')
    replace_right_cell(:nodetype => 'root', :replace_trees => %i(policy_profile))
  end

  def profile_field_changed
    return unless load_edit("profile_edit__#{params[:id]}", "replace_cell__explorer")
    @profile = @edit[:profile_id] ? MiqPolicySet.find(@edit[:profile_id]) : MiqPolicySet.new

    @edit[:new][:description] = params[:description].presence if params[:description]
    @edit[:new][:notes] = params[:notes].presence if params[:notes]

    send_button_changes
  end

  private

  def process_profiles(profiles, task)
    process_elements(profiles, MiqPolicySet, task)
  end

  def profile_build_edit_screen
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}

    @profile = params[:id] ? MiqPolicySet.find(params[:id]) : MiqPolicySet.new # Get existing or new record
    @edit[:key] = "profile_edit__#{@profile.id || "new"}"
    @edit[:rec_id] = @profile.id || nil

    @edit[:profile_id] = @profile.id
    @edit[:new][:description] = @profile.description
    @edit[:new][:notes] = @profile.notes

    @edit[:new][:policies] = {}
    policies = @profile.members # Get the member sets
    policies.each { |p| @edit[:new][:policies][ui_lookup(:model => p.towhat) + " #{p.mode.capitalize}: " + p.description] = p.id } # Build a hash for the members list box

    @edit[:choices] = {}
    MiqPolicy.all.each do |p|
      @edit[:choices][ui_lookup(:model => p.towhat) + " #{p.mode.capitalize}: " + p.description] = p.id # Build a hash for the policies to choose from
    end

    @edit[:new][:policies].each_key do |key|
      @edit[:choices].delete(key) # Remove any policies that are in the members list box
    end

    @edit[:current] = copy_hash(@edit[:new])

    @embedded = true
    @in_a_form = true
    @edit[:current][:add] = true if @edit[:profile_id].blank? # Force changed to be true if adding a record
    session[:changed] = (@edit[:new] != @edit[:current])
  end

  def profile_get_all
    @profiles = MiqPolicySet.all.sort_by { |ps| ps.description.downcase }
    set_search_text
    @profiles = apply_search_filter(@search_text, @profiles) if @search_text.present?
    @right_cell_text = _("All Policy Profiles")
    @right_cell_div = "profile_list"
  end

  # Get information for a profile
  def profile_get_info(profile)
    @record = @profile = profile
    @profile_policies = @profile.miq_policies.sort_by { |p| [p.towhat, p.mode, p.description.downcase] }
    @right_cell_text = _("Policy Profile \"%{name}\"") % {:name => @profile.description}
    @right_cell_div = "profile_details"
  end
end
