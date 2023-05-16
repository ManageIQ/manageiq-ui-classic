module OpsController::Settings::Zones
  extend ActiveSupport::Concern

  def zone_edit
    assert_privileges(params[:id] ? "zone_edit" : "zone_new")

    case params[:button]
    when "reset", nil # Reset or first time in
      zone_build_edit_screen
      replace_right_cell(:nodetype => "ze")
    end
  end

  # AJAX driven routine to delete a zone
  def zone_delete
    assert_privileges("zone_delete")
    zone = Zone.find(params[:id])
    zonename = zone.name
    begin
      zone.destroy
    rescue => bang
      add_flash(bang.to_s, :error)
      zone.errors.each { |error| add_flash("#{error.attribute.to_s.capitalize} #{error.message}", :error) }
      self.x_node = "z-#{zone.id}"
      get_node_info(x_node)
    else
      add_flash(_("Zone \"%{name}\": Delete successful") % {:name => zonename})
      @sb[:active_tab] = "settings_list"
      self.x_node = "xx-z"
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node, :replace_trees => %i[settings diagnostics])
    end
  end

  private

  def zone_build_edit_screen
    @zone = params[:id] ? Zone.find(params[:id]) : Zone.new # Get existing or new record
    zone_set_form_vars
    @in_a_form = true
    session[:changed] = false
  end

  # Set form variables for user add/edit
  def zone_set_form_vars
    @edit = {}
    @edit[:zone_id] = @zone.id
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "zone_edit__#{@zone.id || "new"}"

    @edit[:new][:name] = @zone.name
    @edit[:new][:description] = @zone.description
    @edit[:new][:proxy_server_ip] = @zone.settings ? @zone.settings[:proxy_server_ip] : nil
    @edit[:new][:concurrent_vm_scans] = @zone.settings ? @zone.settings[:concurrent_vm_scans].to_i : 0

    session[:verify_ems_status] = nil
    set_verify_status

    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end
end
