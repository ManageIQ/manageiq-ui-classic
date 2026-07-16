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

  # Setup action — renders the explorer cell containing the React form.
  # The React component uses ap_form_data (GET/POST) for all data operations.
  def ap_edit
    assert_privileges("ap_edit")
    ap_setup_edit_screen
  end

  # GET  /ops/ap_form_data/:id  — load form data
  # POST /ops/ap_form_data/:id  — save form data
  def ap_form_data
    assert_privileges("ap_edit")

    if request.post?
      ap_save_profile
    elsif params[:id] && params[:id] != "new"
      scan = find_record_with_rbac(ScanItemSet, params[:id])
      items_by_type = scan.members.index_by(&:item_type)

      render :json => {
        :name               => scan.name,
        :description        => scan.description,
        :scan_mode          => scan.mode,
        :category           => (items_by_type['category']&.definition&.dig('content') || []).to_h { |i| [i['target'], true] },
        :file_names         => items_by_type['file']&.definition&.dig('stats') || [],
        :reg_entries        => items_by_type['registry']&.definition&.dig('content') || [],
        :nteventlog_entries => items_by_type['nteventlog']&.definition&.dig('content') || []
      }
    else
      render :json => {
        :name               => '',
        :description        => '',
        :scan_mode          => params[:scan_mode] || 'Vm',
        :category           => {},
        :file_names         => [],
        :reg_entries        => [],
        :nteventlog_entries => []
      }
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

  # Save analysis profile — pure JSON endpoint, called via POST from the React form.
  def ap_save_profile
    form_data = JSON.parse(params[:form_data] || '{}')

    if form_data['name'].blank?
      render :json => {:error => _("Name is required")}, :status => 422
      return
    end

    has_content = ['category', 'file', 'registry', 'nteventlog'].any? do |type|
      form_data[type].present? && !form_data[type].empty?
    end

    unless has_content
      render :json => {:error => _("At least one item must be entered to create Analysis Profile")}, :status => 422
      return
    end

    scanitemset = params[:id] && params[:id] != "new" ? ScanItemSet.find(params[:id]) : ScanItemSet.new
    scanitemset.name = form_data['name'].strip
    scanitemset.description = (form_data['description'] || '').strip
    scanitemset.mode = form_data['scan_mode'] || 'Vm'

    unless scanitemset.valid?
      render :json => {:error => scanitemset.errors.full_messages.join(", ")}, :status => 422
      return
    end

    scanitemset.save

    mems = scanitemset.members
    unless mems.empty?
      ap_deletescanitems(mems)
      scanitemset.remove_all_members
    end

    ap_create_scan_items(scanitemset, form_data)

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
  rescue => e
    render :json => {:error => e.message}, :status => 500
  end

  # Create scan items from React form data
  def ap_create_scan_items(scanitemset, form_data)
    if form_data['category'].present? && form_data['category'].any?
      scanitem = ScanItem.new
      scanitem.name = "#{scanitemset.name}_category"
      scanitem.description = "#{scanitemset.description} category Scan"
      scanitem.item_type = "category"
      scanitem.definition = {"content" => form_data['category'].map { |cat| {"target" => cat} }}
      scanitem.save
      scanitemset.add_member(scanitem)
    end

    if form_data['file'].present? && form_data['file'].any?
      scanitem = ScanItem.new
      scanitem.name = "#{scanitemset.name}_file"
      scanitem.description = "#{scanitemset.description} file Scan"
      scanitem.item_type = "file"
      scanitem.definition = {
        "stats" => form_data['file'].map { |f| {"target" => f['target'], "content" => f['content'] || false} }
      }
      scanitem.save
      scanitemset.add_member(scanitem)
    end

    if form_data['registry'].present? && form_data['registry'].any?
      scanitem = ScanItem.new
      scanitem.name = "#{scanitemset.name}_registry"
      scanitem.description = "#{scanitemset.description} registry Scan"
      scanitem.item_type = "registry"
      scanitem.definition = {
        "content" => form_data['registry'].map { |r| {"key" => r['key'], "value" => r['value'], "hive" => "HKLM", "depth" => 0} }
      }
      scanitem.save
      scanitemset.add_member(scanitem)
    end

    if form_data['nteventlog'].present? && form_data['nteventlog'].any?
      scanitem = ScanItem.new
      scanitem.name = "#{scanitemset.name}_nteventlog"
      scanitem.description = "#{scanitemset.description} nteventlog Scan"
      scanitem.item_type = "nteventlog"
      scanitem.definition = {
        "content" => form_data['nteventlog'].map do |e|
          f = e['filter'] || {}
          {:name => e['name'], :filter => {:message => f['message'], :level => f['level'], :num_days => (f['num_days'] || 0).to_i, :source => f['source']}}
        end
      }
      scanitem.save
      scanitemset.add_member(scanitem)
    end
  end

  # Set up the explorer right cell to render the React form.
  # No session edit state — the React component fetches its own data via ap_form_data.
  def ap_setup_edit_screen
    if params[:typ] == "copy"
      source = find_record_with_rbac(ScanItemSet, checked_or_params)
      @scan = ScanItemSet.new
      @scan.name = "Copy of #{source.name}"
      @scan.mode = source.mode
      @copy_source_id = source.id
    elsif params[:id] && params[:id] != "new"
      @scan = find_record_with_rbac(ScanItemSet, params[:id])
      if @scan.read_only
        add_flash(_("Sample Analysis Profile \"%{name}\" can not be edited") % {:name => @scan.name}, :error)
        get_node_info(x_node)
        replace_right_cell(:nodetype => @nodetype)
        return
      end
    else
      @scan = ScanItemSet.new
      @scan.mode = params[:typ] || "Vm"
    end

    @in_a_form = true
    replace_right_cell(:nodetype => "sie")
  end

  # Create the view and associated vars for the ap list
  def ap_build_list
    @lastaction = "aps_list"
    @force_no_grid_xml = true
    @view, @pages = get_view(ScanItemSet)
    @current_page = @pages[:current] unless @pages.nil?
  end

  def ap_deletescanitems(scanitems)
    ap_process_scanitems(scanitems, "destroy")
  end

  def ap_process_scanitems(scanitems, task)
    process_elements(scanitems, ScanItem, task)
  end

  def ap_process_scanitemsets(scanitemsets, task)
    process_elements(scanitemsets, ScanItemSet, task)
  end
end
