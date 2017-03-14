class FloatingIpAddressVisibilityService
  def determine_visibility(floating_ip_address, number_of_vms)
    field_names_to_hide = []
    field_names_to_edit = []

    if number_of_vms > 1
      field_names_to_hide += [:floating_ip_address]
    else
      field_names_to_edit += [:floating_ip_address]
    end

    {:hide => field_names_to_hide, :edit => field_names_to_edit}
  end
end
