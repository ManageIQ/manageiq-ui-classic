module RequestInfoHelper
  private

  REQUEST_INFO_TAB_TYPES = {
    :requester   => N_('Requester'),
    :purpose     => N_('Purpose'),
    :catalog     => N_('Catalog'),
    :environment => N_('Environment'),
    :properties  => N_('Properties'),
    :volumes     => N_('Volumes'),
    :customize   => N_('Customize'),
    :schedule    => N_('Schedule'),
    :hardware    => N_('Hardware'),
    :network     => N_('Network'),
  }.freeze

  PROV_FIELD_LABLES = {
    # Catalog
    :name                         => N_('Name'),
    :count                        => N_('Count'),
    :provision_type               => N_('Provision Type'),
    :linked_clone                 => N_('Linked Clone'),
    :vm_name                      => N_('Vm Name'),
    # Environment
    :instance_name                => N_('Instance Name'),
    # Hardware
    :number_of_sockets            => N_('Number of sockets'),
    :cores_per_socket             => N_('Cores per socket'),
    :memory_mb                    => N_('Memory mb'),
    :disk_format                  => N_('Disk format'),
    :disk_sparsity                => N_('Disk sparsity'),
    # Network
    :network                      => N_('Network'),
    # Properties
    :choose_automatically         => N_('Choose Automatically'),
    :cloud_tenant                 => N_('Cloud Tenant'),
    :availability_zones           => N_('Availability Zones'),
    :network_selection_method     => N_('Network Selection Method'),
    :cloud_network                => N_('Cloud Network'),
    :security_groups              => N_('Security Groups'),
    :public_ip_address            => N_('Public IP Address'),
    # Volumes
    :volume_name                  => N_('Volume Name'),
    :size_gigabytes               => N_('Size (gigabytes)'),
    :delete_on_instance_terminate => N_('Delete on Instance Terminate'),
    # Customize
    :instance_type                => N_('Instance Type'),
    :guest_access_key_pair        => N_('Guest Access Key Pair'),
    :cloudwatch                   => N_('CloudWatch'),
    :root_password                => N_('Root Password'),
    :address_mode                 => N_('Address Mode'),
    :host_name                    => N_('Host Name'),
    :subnet_mask                  => N_('Subnet Mask'),
    :gateway                      => N_('Gateway'),
    :dns_server_list              => N_('DNS Server list'),
    :dns_suffix_list              => N_('DNS Suffix List"'),
    :script_name                  => N_('Script Name'),
    :script_text                  => N_('Script Text'),
    # Schedule
    :time_until_retirement        => N_('Time until Retirement'),
    :retirement_warning           => N_('Retirement Warning'),
  }.freeze

  def tab_label_key(label)
    label.gsub(/[^a-zA-Z ]/, "").downcase.tr(' ', '_').to_sym
  end

  def request_info_tab_label(label)
    label ? (_(REQUEST_INFO_TAB_TYPES[tab_label_key(label)]) || label) : ""
  end

  def prov_field_label(label)
    label ? (_(PROV_FIELD_LABLES[tab_label_key(label)]) || label) : ""
  end

  def provision_tab_configuration(workflow)
    prov_tab_labels = workflow.provisioning_tab_list.map do |dialog|
      {:name => dialog[:name], :text => request_info_tab_label(dialog[:description])}
    end
    return prov_tab_labels, workflow.get_dialog_order
  end

  def prov_vm_grid_data(edit, vms, vm)
    none_index = '__VM__NONE__'
    rows = []
    clones = [:clone_to_template, :clone_to_vm]
    if vms
      unless clones.include?(edit[:wf].request_type)
        rows.push({:id => none_index, :clickable => true, :cells => none_cells(edit[:vm_headers].length - 1)})
        vms.each do |data|
          rows.push({:id => data.id.to_s, :clickable => true, :cells => prov_vm_grid_cells(data, edit)})
        end
      end
    else
      rows.push({:id => vm.id.to_s, :clickable => true, :cells => prov_vm_grid_cells(vm, edit)})
    end
    {
      :headers  => prov_grid_vm_header(edit, clones, vms),
      :rows     => rows,
      :selected => selected_vm(edit).presence || none_index,
      :recordId => edit[:req_id] || "new",
    }
  end

  def prov_host_grid_data(edit, options_data, hosts)
    none_index = '__HOST__NONE__'
    rows = [{:id => none_index, :clickable => true, :cells => none_cells(5)}]
    options = edit || options_data
    rows += hosts.map do |h|
      {:id => h.id.to_s, :clickable => true, :cells => prov_host_grid_cells(h, options)}
    end
    {
      :headers  => prov_grid_host_header(edit, options),
      :rows     => rows,
      :selected => selected_host(edit).presence || none_index,
      :recordId => (edit && edit[:req_id]) || "new",
    }
  end

  def prov_grid_vm_header(edit, clones, vms)
    headers = []
    edit[:vm_columns].each_with_index do |h, index|
      item = {:text => edit[:vm_headers][h], :header_text => edit[:vm_headers][h]}
      if vms && clones.exclude?(edit[:wf].request_type)
        item[:sort_choice] = h
        item[:sort_data] = sort_data(edit, index, 'vm')
      end
      headers.push(item)
    end
    headers
  end

  def prov_grid_host_header(edit, options)
    headers = []
    options && options[:host_columns].each_with_index do |h, index|
      item = {:text => options[:host_headers][h], :header_text => options[:host_headers][h]}
      if edit
        item[:sort_choice] = h
        item[:sort_data] = sort_data(edit, index, 'host')
      end
      headers.push(item)
    end
    headers
  end

  def cell_data(data)
    {:text => data}
  end

  def selected_vm(edit)
    edit[:new][:src_vm_id] && edit[:new][:src_vm_id][0].to_s
  end

  def selected_host(edit)
    edit[:new][:placement_host_name] && edit[:new][:placement_host_name][0].to_s
  end

  def sort_data(edit, index, type)
    sort = {:isFilteredBy => false}
    if edit["#{type}_columns".to_sym][index] == edit["#{type}_sortcol".to_sym]
      sort = {:isFilteredBy => true, :sortDirection => edit["#{type}_sortdir".to_sym] == 'ASC' ? 'ASC' : 'DESC'}
    end
    sort
  end

  def none_cells(count)
    Array.new(count) { cell_data(" ") }.unshift(cell_data("<#{_('None')}>"))
  end

  def prov_vm_grid_cells(data, edit)
    cells = [
      cell_data(data.name),
      cell_data(h(data.operating_system.try(:product_name))),
      cell_data(h(data.platform)),
      cell_data(h(data.cpu_total_cores)),
      cell_data(h(number_to_human_size(data.mem_cpu.to_i * 1024 * 1024))),
      cell_data(h(number_to_human_size(data.allocated_disk_storage))),
    ]
    cells.push(cell_data(h(data.deprecated ? _("true") : _("false")))) if edit[:vm_headers].key?('deprecated')
    ext_name = data.ext_management_system ? h(data.ext_management_system.name) : ""
    cells.push(cell_data(ext_name))
    cells.push(cell_data(h(data.v_total_snapshots)))
    if edit[:vm_headers].key?('cloud_tenant')
      cells.push(cell_data(h(data.cloud_tenant ? data.cloud_tenant.name : _('None'))))
    end
    cells
  end

  def prov_host_grid_cells(data, options)
    options[:host_columns].map do |col|
      cell_data(h(data.send(col)))
    end
  end
end
