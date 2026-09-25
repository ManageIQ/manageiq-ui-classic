module VmConfigHelper
  # Serializes all VM config display-mode data into a sections array for the
  # VmConfig React component. Each section has a :title and :rows array.
  # Rows are { label:, value:, icon: } hashes matching MiqStructuredList's
  # generic_group mode expectations.
  def vm_config_data(display)
    case display
    when "devices"
      vm_config_devices_sections
    when "os_info"
      vm_config_os_info_sections
    when "hv_info"
      vm_config_hv_info_sections
    when "networks"
      vm_config_networks_sections
    when "resources_info"
      vm_config_resources_info_sections
    else
      []
    end
  end

  private

  def vm_config_devices_sections
    rows = devices_details.map do |d|
      {:label => d.name.to_s, :value => d.description.to_s, :icon => d.icon}
    end
    [{:title => _('Devices'), :rows => rows}]
  end

  def vm_config_os_info_sections
    sections = []

    os_rows = os_info_details.map do |item|
      image_src = image_path("svg/os-#{@record.os_image_name.downcase}.svg")
      {:label => item.osinfo.to_s, :value => item.description.to_s, :image => image_src}
    end
    sections << {:title => _('Basic Information'), :rows => os_rows} if os_rows.present?

    unless /linux/.match?(@record.os_image_name)
      policy_rows = account_policy_details.map do |item|
        {:label => item.field.to_s, :value => item.description.to_s}
      end
      sections << {:title => _('Account Policies'), :rows => policy_rows}
    end

    sections
  end

  def vm_config_hv_info_sections
    sections = []

    vmm_rows = vmm_info_details.map do |item|
      {:label => item.vmminfo.to_s, :value => item.description.to_s}
    end
    sections << {:title => _('Basic Information'), :rows => vmm_rows} if vmm_rows.present?

    device_rows = devices_details.map do |d|
      {:label => d.name.to_s, :value => d.description.to_s, :icon => d.icon}
    end
    sections << {:title => _('Devices'), :rows => device_rows} if device_rows.present?

    sections
  end

  def vm_config_networks_sections
    return [] unless vmm_info_details.present?

    @record.hardware.networks.map do |adapter|
      rows = {
        :ipaddress       => _('IP Address'),
        :ipv6address     => _('IPv6 Address'),
        :description     => _('Description'),
        :dhcp_server     => _('DHCP Server'),
        :dhcp_enabled    => _('DHCP Enabled'),
        :default_gateway => _('Default Gateway'),
        :subnet_mask     => _('Subnet Mask'),
        :dns_server      => _('DNS Server'),
      }.map do |sym, label|
        {:label => label, :value => adapter.send(sym).to_s}
      end
      {:title => _('Network Adapter'), :rows => rows}
    end
  end

  def vm_config_resources_info_sections
    rows = {
      :cpu_limit             => _("CPU Limit"),
      :cpu_reserve           => _("CPU Reserve"),
      :cpu_reserve_expand    => _("CPU Reserve Expand"),
      :cpu_shares            => _("CPU Shares"),
      :cpu_shares_level      => _("CPU Shares Level"),
      :memory_limit          => _("Memory Limit"),
      :memory_reserve        => _("Memory Reserve"),
      :memory_reserve_expand => _("Memory Reserve Expand"),
      :memory_shares         => _("Memory Shares"),
      :memory_shares_level   => _("Memory Shares Level"),
    }.map do |sym, label|
      {:label => label, :value => @record.send(sym).to_s}
    end
    [{:title => _('Resources'), :rows => rows}]
  end
end
