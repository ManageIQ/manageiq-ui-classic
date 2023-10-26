module RequestInfoHelper
  private

  PROV_FIELD_TYPES = [:vm, :host, :ds, :template, :vc, :pxe_img, :iso_img, :window_image].freeze

  PROV_FIELDS = [:src_vm_id, :placement_host_name, :placement_ds_name, :attached_ds, :sysprep_custom_spec, :customization_template_id, :pxe_image_id, :iso_image_id, :windows_image_id].freeze

  def provision_tab_configuration(workflow)
    prov_tab_labels = workflow.provisioning_tab_list.map do |dialog|
      {:name => dialog[:name], :text => dialog[:description]}
    end
    return prov_tab_labels, workflow.get_dialog_order
  end

  def display_prov_grid(field)
    PROV_FIELDS.include?(field)
  end

  def prov_grid_component(field, field_id, spec, info)
    data = prov_grid_data(field, field_id, spec)
    grid_list = prov_grid_list(data)
    initial_data = {
      :headers  => grid_list[:headers],
      :rows     => grid_list[:rows],
      :selected => selected_item(data[:edit][:new], grid_list),
      :recordId => data[:edit][:req_id] || "new",
      :fieldId  => data[:field_id],
      :field    => field.to_s,
      :spec     => spec,
      :type     => data[:type]
    }
    if info == 'component'
      content_tag(:div, :id => "prov_#{data[:type]}_div") do
        react('ProvGrid', {:initialData => initial_data})
      end
    else
      initial_data
    end
  end

  def prov_grid_data(field, field_id, spec_required)
    data = case field
           when :src_vm_id
             {:type => :vm, :vms => @vms, :vm => @vm}
           when :placement_host_name
             {:type => :host, :options_data => @options, :hosts => @hosts}
           when :placement_ds_name, :attached_ds
             {:type => :ds, :datastores => @datastores}
           when :customization_template_id
             {:type => :template, :templates => @templates}
           when :sysprep_custom_spec
             {:type => :vc, :vcs => @vcs, :spec_required => spec_required}
           when :pxe_image_id
             {:type => :pxe_img, :pxe_img => @pxe_imgs}
           when :iso_image_id
             {:type => :iso_img, :iso_img => @iso_imgs}
           when :windows_image_id
             {:type => :window_image, :window_images => @windows_images}
           else
             {}
           end
    data.merge({:field_id => field_id, :edit => @edit})
  end

  def prov_grid_list(data)
    data[:none_index] = "__#{data[:type].to_s.upcase}__NONE__"
    send("prov_#{data[:type]}_data", data)
  end

  def selected_item(edit, list)
    (edit[list[:selected]] && edit[list[:selected]][0]&.to_s) || list[:none_index]
  end

  def prov_row_item(row_id, cells)
    {:id => row_id, :clickable => true, :cells => cells}
  end

  def prov_vm_data(data)
    edit = data[:edit]
    clones = [:clone_to_template, :clone_to_vm]
    headers = prov_grid_vm_header(edit, clones, data[:vms], data[:type])
    rows = []
    if data[:vms]
      unless clones.include?(edit[:wf].request_type)
        rows += [prov_row_item(data[:none_index], none_cells(edit[:vm_headers].length - 1))]
        if data[:vms]
          rows += data[:vms].map do |vm|
            prov_row_item(vm.id.to_s, prov_vm_grid_cells(vm, edit))
          end
        end
      end
    else
      rows.push({:id => data[:vm].id.to_s, :clickable => true, :cells => prov_vm_grid_cells(data[:vm], edit)})
    end
    {:headers => headers, :rows => rows, :selected => :src_vm_id, :none_index => data[:none_index]}
  end

  def prov_host_data(data)
    edit = data[:edit]
    options = edit || data[:options_data]
    headers = prov_grid_host_header(edit, options, data[:type])
    rows = [prov_row_item(data[:none_index], none_cells(edit[:host_columns].length - 1))]
    if data[:hosts]
      rows += data[:hosts].map do |host|
        prov_row_item(host.id.to_s, prov_host_grid_cells(host, options))
      end
    end
    {:headers => headers, :rows => rows, :selected => :placement_host_name, :none_index => data[:none_index]}
  end

  def prov_pxe_img_data(data)
    edit = data[:edit]
    headers, count = prov_grid_header(edit, data[:type])
    rows = [prov_row_item(data[:none_index], none_cells(count))]
    if data[:pxe_img]
      rows += data[:pxe_img].map do |pxe_img|
        prov_row_item(pxe_img.id.to_s, prov_pxe_img_cells(pxe_img))
      end
    end
    {:headers => headers, :rows => rows, :selected => :pxe_image_id, :none_index => data[:none_index]}
  end

  def prov_iso_img_data(data)
    edit = data[:edit]
    headers, count = prov_grid_header(edit, data[:type])
    rows = [prov_row_item(data[:none_index], none_cells(count))]
    if data[:iso_img]
      rows += data[:iso_img].map do |iso|
        prov_row_item(iso.id.to_s, prov_iso_img_cells(iso))
      end
    end
    {:headers => headers, :rows => rows, :selected => :iso_image_id, :none_index => data[:none_index]}
  end

  def prov_ds_data(data)
    edit = data[:edit]
    headers, count = prov_grid_header(edit, data[:type])
    rows = [prov_row_item(data[:none_index], none_cells(count))]
    if data[:datastores]
      rows += data[:datastores].map do |ds|
        prov_row_item(ds.id.to_s, prov_ds_grid_cells(ds, edit))
      end
    end
    selected_key = %w[miq_template service_template vm].include?(edit[:org_controller]) ? :placement_ds_name : :attached_ds
    {:headers => headers, :rows => rows, :selected => selected_key, :none_index => data[:none_index]}
  end

  def prov_template_data(data)
    edit = data[:edit]
    headers, count = prov_grid_header(edit, data[:type])
    rows = [prov_row_item(data[:none_index], none_cells(count))]
    if data[:templates]
      rows += data[:templates].map do |template|
        prov_row_item(template.id.to_s, prov_template_cells(template))
      end
    end
    {:headers => headers, :rows => rows, :selected => :customization_template_id, :none_index => data[:none_index]}
  end

  def prov_vc_data(data)
    edit = data[:edit]
    headers, count = prov_grid_header(edit, data[:type])
    rows = []
    unless data[:spec_required]
      rows += [prov_row_item(data[:none_index], none_cells(count))]
      if data[:vcs]
        rows += data[:vcs].map do |vc|
          prov_row_item(vc.id.to_s, prov_vc_cells(vc))
        end
      end
    end
    {:headers => headers, :rows => rows, :selected => :sysprep_custom_spec, :none_index => data[:none_index]}
  end

  def prov_window_image_data(data)
    edit = data[:edit]
    headers, count = prov_grid_header(edit, data[:type])
    rows = [prov_row_item(data[:none_index], none_cells(count))]
    if data[:window_image]
      rows += data[:window_image].map do |window|
        prov_row_item(window.id.to_s, prov_window_image_cells(window))
      end
    end
    {:headers => headers, :rows => rows, :selected => :customization_template_id, :none_index => data[:none_index]}
  end

  def prov_grid_header_item(text)
    {:text => text, :header_text => text}
  end

  def prov_grid_vm_header(edit, clones, vms, type)
    header_keys = prov_header_keys(type.to_s)
    headers = []
    edit[header_keys[:columns]].each_with_index do |h, index|
      item = prov_grid_header_item(edit[header_keys[:headers]][h])
      if vms && clones.exclude?(edit[:wf].request_type)
        item[:sort_choice] = h
        item[:sort_data] = prov_sort_data(edit, index, header_keys)
      end
      headers.push(item)
    end
    headers
  end

  def prov_grid_host_header(edit, options, type)
    header_keys = prov_header_keys(type.to_s)
    headers = []
    options && options[header_keys[:columns]].each_with_index do |h, index|
      item = prov_grid_header_item(options[header_keys[:headers]][h])
      if edit
        item[:sort_choice] = h
        item[:sort_data] = prov_sort_data(edit, index, header_keys)
      end
      headers.push(item)
    end
    headers
  end

  def prov_grid_header(edit, type)
    header_keys = prov_header_keys(type.to_s)
    headers = []
    edit[header_keys[:columns]].each_with_index do |h, index|
      item = prov_grid_header_item(edit[header_keys[:headers]][h])
      if edit[header_keys[:columns]][index] == edit[header_keys[:sort_col]]
        item[:sort_choice] = h
        item[:sort_data] = prov_sort_data(edit, index, header_keys)
      end
      headers.push(item)
    end
    return headers, edit[header_keys[:columns]].length - 1
  end

  def prov_header_keys(type)
    {
      :columns  => "#{type}_columns".to_sym,
      :headers  => "#{type}_headers".to_sym,
      :sort_col => "#{type}_sortcol".to_sym,
      :sort_dir => "#{type}_sortdir".to_sym
    }
  end

  def prov_cell_data(data)
    {:text => data}
  end

  def prov_sort_data(edit, index, header_keys)
    sort = {:isFilteredBy => false}
    if edit[header_keys[:columns]][index] == edit[header_keys[:sort_col]]
      sort = {:isFilteredBy => true, :sortDirection => edit[header_keys[:sort_dir]] == 'ASC' ? 'ASC' : 'DESC'}
    end
    sort
  end

  def none_cells(count)
    Array.new(count) { prov_cell_data(" ") }.unshift(prov_cell_data("<#{_('None')}>"))
  end

  def prov_vm_grid_cells(data, edit)
    cells = [
      prov_cell_data(data.name),
      prov_cell_data(data.operating_system.try(:product_name)),
      prov_cell_data(data.platform),
      prov_cell_data(data.cpu_total_cores),
      prov_cell_data(number_to_human_size(data.mem_cpu.to_i * 1024 * 1024)),
      prov_cell_data(number_to_human_size(data.allocated_disk_storage)),
    ]
    cells.push(prov_cell_data(data.deprecated ? _("true") : _("false"))) if edit[:vm_headers].key?('deprecated')
    ext_name = data.ext_management_system ? data.ext_management_system.name : ""
    cells.push(prov_cell_data(ext_name))
    cells.push(prov_cell_data(data.v_total_snapshots))
    if edit[:vm_headers].key?('cloud_tenant')
      cells.push(prov_cell_data(data.cloud_tenant ? data.cloud_tenant.name : _('None')))
    end
    cells
  end

  def prov_host_grid_cells(data, options)
    options[:host_columns].map do |col|
      prov_cell_data(data.send(col))
    end
  end

  def prov_pxe_img_cells(data)
    [
      prov_cell_data(data.name),
      prov_cell_data(data.description)
    ]
  end

  def prov_iso_img_cells(data)
    [
      prov_cell_data(data.name)
    ]
  end

  def prov_ds_grid_cells(data, edit)
    cells = []
    edit[:ds_columns].each do |col|
      cells << if %w[free_space total_space].include?(col)
                 prov_cell_data(number_to_human_size(data.send(col), :precision => 1))
               else
                 prov_cell_data(data.send(col))
               end
    end
    cells
  end

  def prov_template_cells(data)
    [
      prov_cell_data(data.name),
      prov_cell_data(data.description),
      prov_cell_data(data.updated_at),
    ]
  end

  def prov_vc_cells(data)
    [
      prov_cell_data(data.name),
      prov_cell_data(data.description),
      prov_cell_data(data.last_update_time),
    ]
  end

  def prov_window_image_cells(data)
    [
      prov_cell_data(data.name),
      prov_cell_data(data.description),
    ]
  end
end
