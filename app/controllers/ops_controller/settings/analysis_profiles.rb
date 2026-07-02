module OpsController::Settings::AnalysisProfiles
  extend ActiveSupport::Concern

  CATEGORY_CHOICES = {
    "system"   => N_("System"),
    "services" => N_("Services"),
    "software" => N_("Software"),
    "accounts" => N_("User Accounts"),
    "vmconfig" => N_("VM Configuration")
  }.freeze

  # Show scanitemset list view
  def aps_list
    assert_privileges("ap")

    ap_build_list

    if @show_list
      update_gtl_div('aps_list') if pagination_or_gtl_request?
    end
  end

  # Show a scanitemset
  def ap_show
    # identify_scanitemset
    if @selected_scan.nil?
      flash_to_session(_("Error: Record no longer exists in the database"), :error)
      redirect_to(:action => 'show_list_set')
      return
    end
    @lastaction = "ap_show"

    @selected_scan.members.each do |a|
      case a.item_type
      when "category"
        @category = [] if @category.nil?
        (0...a[:definition]["content"].length).each do |i|
          @category.push(_(CATEGORY_CHOICES[a[:definition]["content"][i]["target"]])) if a[:definition]["content"][i]["target"] != "vmevents"
        end
      when "file"
        @file = [] if @file.nil?
        @file_stats = {}
        (0...a[:definition]["stats"].length).each do |i|
          @file_stats[a[:definition]["stats"][i]["target"].to_s] = a[:definition]["stats"][i]["content"] || false
          @file.push(a[:definition]["stats"][i]["target"])
        end
      when "registry"
        @registry = [] if @registry.nil?
        (0...a[:definition]["content"].length).each do |i|
          @registry.push(a[:definition]["content"][i])
        end
      when "nteventlog"
        @nteventlog = [] if @nteventlog.nil?
        (0...a[:definition]["content"].length).each do |i|
          @nteventlog.push(a[:definition]["content"][i])
        end
      end
    end
  end

  def ap_copy
    assert_privileges("ap_copy")
    @_params[:typ] = "copy"
    ap_edit
  end

  def ap_host_edit
    assert_privileges("ap_host_edit")
    @_params[:typ] = "Host"
    ap_edit
  end

  def ap_vm_edit
    assert_privileges("ap_vm_edit")
    @_params[:typ] = "Vm"
    ap_edit
  end

  def ap_edit
    assert_privileges("ap_edit")

    case params[:button]
    when "cancel"
      @scan = ScanItemSet.find_by(:id => params[:id]) if params[:id] && params[:id] != "new"
      if @scan
        add_flash(_("Edit of Analysis Profile \"%{name}\" was cancelled by the user") % {:name => @scan.name})
      else
        add_flash(_("Add of new Analysis Profile was cancelled by the user"))
      end
      get_node_info(x_node)
      @scan = nil
      replace_right_cell(:nodetype => @nodetype)

    when "save", "add"
      ap_save_profile

    when "reset", nil
      ap_setup_edit_screen
    end
  end

  # Delete all selected or single displayed scanitemset(s)
  def ap_delete
    assert_privileges("ap_delete")
    @single_delete = params[:id].present?
    scanitemsets = find_records_with_rbac(ScanItemSet, checked_or_params)
    scanitemsets.each do |scan_item_set|
      if scan_item_set.read_only
        scanitemsets -= [scan_item_set]
        add_flash(_("Default Analysis Profile \"%{name}\" can not be deleted") % {:name => scan_item_set.name}, :error)
      else
        tmp_flash_array = @flash_array
        ap_deletescanitems(scan_item_set.members)
        @flash_array = tmp_flash_array
        scan_item_set.remove_all_members
      end
    end
    @flash_error = scanitemsets.empty?
    ap_process_scanitemsets(scanitemsets, "destroy") unless scanitemsets.empty?
    self.x_node = "xx-sis"
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node, :replace_trees => [:settings])
  end

  private

  # Save analysis profile from React form data
  def ap_save_profile
    # Parse JSON data from React form
    form_data = JSON.parse(params[:form_data] || '{}')

    # Validate required fields
    if form_data['name'].blank?
      render :json => {:error => _("Name is required")}, :status => 422
      return
    end

    # Check if at least one item type has content
    has_content = ['category', 'file', 'registry', 'nteventlog'].any? do |type|
      form_data[type].present? && !form_data[type].empty?
    end

    unless has_content
      render :json => {:error => _("At least one item must be entered to create Analysis Profile")}, :status => 422
      return
    end

    # Create or update the scan item set
    scanitemset = params[:id] && params[:id] != "new" ? ScanItemSet.find(params[:id]) : ScanItemSet.new
    scanitemset.name = form_data['name'].strip
    scanitemset.description = (form_data['description'] || '').strip
    scanitemset.mode = form_data['scan_mode'] || 'Vm'

    if scanitemset.valid?
      scanitemset.save

      # Remove existing members
      mems = scanitemset.members
      unless mems.empty?
        ap_deletescanitems(mems)
        scanitemset.remove_all_members
      end

      # Add new members based on form data
      ap_create_scan_items(scanitemset, form_data)

      # Audit event
      if params[:id] && params[:id] != "new"
        AuditEvent.success(
          :event        => "scanitemset_record_update",
          :target_class => "ScanItemSet",
          :target_id    => scanitemset.id.to_s,
          :userid       => session[:userid],
          :message      => "Analysis Profile [#{scanitemset.name}] updated"
        )
      else
        AuditEvent.success(
          :event        => "scanitemset_record_create",
          :target_class => "ScanItemSet",
          :target_id    => scanitemset.id.to_s,
          :userid       => session[:userid],
          :message      => "Analysis Profile [#{scanitemset.name}] created"
        )
      end

      render :json => {
        :success => true,
        :message => _("Analysis Profile \"%{name}\" was saved") % {:name => scanitemset.name},
        :id      => scanitemset.id
      }
    else
      errors = scanitemset.errors.full_messages.join(", ")
      render :json => {:error => errors}, :status => 422
    end
  rescue => e
    render :json => {:error => e.message}, :status => 500
  end

  # Create scan items from React form data
  def ap_create_scan_items(scanitemset, form_data)
    # Category items
    if form_data['category'].present? && form_data['category'].any?
      scanitem = ScanItem.new
      scanitem.name = "#{scanitemset.name}_category"
      scanitem.description = "#{scanitemset.description} category Scan"
      scanitem.item_type = "category"
      scanitem.definition = {
        "content" => form_data['category'].map { |cat| {"target" => cat} }
      }
      scanitem.save
      scanitemset.add_member(scanitem)
    end

    # File items
    if form_data['file'].present? && form_data['file'].any?
      scanitem = ScanItem.new
      scanitem.name = "#{scanitemset.name}_file"
      scanitem.description = "#{scanitemset.description} file Scan"
      scanitem.item_type = "file"
      scanitem.definition = {
        "stats" => form_data['file'].map do |f|
          {"target" => f['target'], "content" => f['content'] || false}
        end
      }
      scanitem.save
      scanitemset.add_member(scanitem)
    end

    # Registry items
    if form_data['registry'].present? && form_data['registry'].any?
      scanitem = ScanItem.new
      scanitem.name = "#{scanitemset.name}_registry"
      scanitem.description = "#{scanitemset.description} registry Scan"
      scanitem.item_type = "registry"
      scanitem.definition = {
        "content" => form_data['registry'].map do |r|
          {"key" => r['key'], "value" => r['value'], "hive" => "HKLM", "depth" => 0}
        end
      }
      scanitem.save
      scanitemset.add_member(scanitem)
    end

    # Event log items
    if form_data['nteventlog'].present? && form_data['nteventlog'].any?
      scanitem = ScanItem.new
      scanitem.name = "#{scanitemset.name}_nteventlog"
      scanitem.description = "#{scanitemset.description} nteventlog Scan"
      scanitem.item_type = "nteventlog"
      scanitem.definition = {
        "content" => form_data['nteventlog'].map do |e|
          filter_data = e['filter'] || {}
          {
            :name   => e['name'],
            :filter => {
              :message  => filter_data['message'],
              :level    => filter_data['level'],
              :num_days => (filter_data['num_days'] || 0).to_i,
              :source   => filter_data['source']
            }
          }
        end
      }
      scanitem.save
      scanitemset.add_member(scanitem)
    end
  end

  # Create the view and associated vars for the ap list
  def ap_build_list
    @lastaction = "aps_list"
    @force_no_grid_xml = true
    @view, @pages = get_view(ScanItemSet) # Get the records (into a view) and the paginator
    @current_page = @pages[:current] unless @pages.nil? # save the current page number
  end

  # Set form variables for edit
  def ap_set_form_vars
    @edit = {}
    session[:file_names] = []
    session[:reg_entries] = []
    session[:nteventlog_entries] = []
    @edit[:scan_id] = @scan.id
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "ap_edit__#{@scan.id || "new"}"

    @edit[:new][:name] = @scan.name
    @edit[:new][:scan_mode] = @scan.mode
    @edit[:new][:description] = @scan.description

    scanitems = @scan.members # Get the member sets

    # @edit[:new][:items] = Array.new
    scanitems.each_with_index do |scanitem, _i|
      @edit[:new][scanitem.item_type] = {}
      # @edit[:new][scanitem.item_type][:id] = scanitem.id
      @edit[:new][scanitem.item_type][:name] = scanitem.name
      @edit[:new][scanitem.item_type][:description] = scanitem.description
      @edit[:new][scanitem.item_type][:definition] = scanitem.definition.dup
      @edit[:new][scanitem.item_type][:type] = scanitem.item_type
      session[:file_names] = @edit[:new][scanitem.item_type][:definition]["stats"].dup unless @edit[:new][scanitem.item_type][:definition]["stats"].nil?
      session[:reg_entries] = @edit[:new]["registry"][:definition]["content"].dup unless @edit[:new]["registry"].nil?
      session[:nteventlog_entries] = @edit[:new]["nteventlog"][:definition]["content"].dup unless @edit[:new]["nteventlog"].nil?
    end

    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end

  # Setup edit screen for React form
  def ap_setup_edit_screen
    # Determine if we're editing an existing profile or creating a new one
    # Check for copy operation first, before checking params[:id]
    if params[:typ] == "copy"
      # Copying existing profile
      obj = find_record_with_rbac(ScanItemSet, checked_or_params)
      session[:set_copy] = "copy"
      @scan = ScanItemSet.new
      @scan.name = "Copy of #{obj.name}"
      @scan.description = obj.description
      @scan.mode = obj.mode
      @sb[:miq_tab] = @scan.mode == "Host" ? "edit_2" : "edit_1"
    elsif params[:id] && params[:id] != "new"
      # Editing existing profile
      @scan = find_record_with_rbac(ScanItemSet, params[:id])
      @sb[:miq_tab] = @scan.mode == "Host" ? "edit_2" : "edit_1"
      if @scan.read_only
        add_flash(_("Sample Analysis Profile \"%{name}\" can not be edited") % {:name => @scan.name}, :error)
        get_node_info(x_node)
        replace_right_cell(:nodetype => @nodetype)
        return
      end
    else
      # Creating new profile (Host or Vm)
      @scan = ScanItemSet.new
      @scan.mode = params[:typ] || "Vm"
      @sb[:miq_tab] = @scan.mode == "Host" ? "new_2" : "new_1"
    end

    # Initialize form variables
    ap_set_form_vars

    # For copy operation, copy the scan items from the original
    if params[:typ] == "copy"
      obj = find_record_with_rbac(ScanItemSet, checked_or_params)
      scanitems = obj.members
      scanitems.each do |scanitem|
        @edit[:new][scanitem.item_type] = {}
        @edit[:new][scanitem.item_type][:name] = scanitem.name
        @edit[:new][scanitem.item_type][:description] = scanitem.description
        @edit[:new][scanitem.item_type][:definition] = scanitem.definition
        @edit[:new][scanitem.item_type][:type] = scanitem.item_type

        # Copy session data for React form
        case scanitem.item_type
        when "file"
          session[:file_names] = scanitem.definition["stats"].dup if scanitem.definition["stats"]
        when "registry"
          session[:reg_entries] = scanitem.definition["content"].dup if scanitem.definition["content"]
        when "nteventlog"
          session[:nteventlog_entries] = scanitem.definition["content"].dup if scanitem.definition["content"]
        end
      end
    end

    if params[:button] == "reset"
      add_flash(_("All changes have been reset"), :warning)
    end

    @in_a_form = true
    replace_right_cell(:nodetype => "sie")
  end

  # Delete all selected or single displayed scanitemset(s)
  def ap_deletescanitems(scanitems)
    ap_process_scanitems(scanitems, "destroy")
  end

  # Common scanitemset Set button handler routines follow
  def ap_process_scanitems(scanitems, task)
    process_elements(scanitems, ScanItem, task)
  end

  # Common scanitemset button handler routines follow
  def ap_process_scanitemsets(scanitemsets, task)
    process_elements(scanitemsets, ScanItemSet, task)
  end
end
