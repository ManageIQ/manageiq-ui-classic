module HostHelper
  include_concern 'TextualSummary'
  include_concern 'ComplianceSummaryHelper'

  def host_info
    devices = devices_details
    os_info = os_info_details
    vmm_info = vmm_info_details
    [devices, os_info, vmm_info]
  end

  def host_config_summary(display, record, network_tree, sa_tree)
    if ["network", "storage_adapters"].include?(display)
      tree_view(network_tree, sa_tree)
    else
      list_view(display, record)
    end
  end

  def tree_view(network_tree, sa_tree)
    tree = x_active_tree == :sa_tree ? sa_tree : network_tree
    react('TreeViewRedux', tree.locals_for_render)
  end

  def generate_row(label, value, icon = '')
    row_item = {:cells => {:label => label, :value => value}}
    row_item[:cells][:icon] = icon if icon.present?
    row_item
  end

  def list_view(display, record)
    data = {:mode => "miq_host_#{display}"}
    rows = []
    case display
    when "devices"
      devices = devices_details
      if devices.present?
        devices.each do |item|
          rows.push(generate_row(h(item[:name]), h(item[:description]), item[:icon]))
        end
      end
    when "os_info"
      os_info = os_info_details
      if os_info.present?
        os_info.each do |item|
          rows.push(generate_row(h(item[:osinfo]), h(item[:description])))
        end
        rows.push(generate_row(_('Hostname'), h(record.hostname)))
        rows.push(generate_row(_('IP Address'), h(record.ipaddress)))
      end

    when "hv_info"
      vmm_info = vmm_info_details
      if vmm_info.present?
        vmm_info.each do |item|
          rows.push(generate_row(h(item[:vmminfo]), h(item[:description])))
        end
      end
    end
    data[:rows] = rows
    miq_structured_list(data)
  end
end
