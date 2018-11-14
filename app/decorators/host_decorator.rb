class HostDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-container-node'
  end

  def fileicon
    "svg/vendor-#{vmm_vendor_display.downcase}.svg"
  end

  def quadicon
    icon = {
      :top_left     => {
        :text    => t = v_total_vms,
        :tooltip => n_("%{number} Virtual Machine", "%{number} Virtual Machines", t) % {:number => t}
      },
      :top_right    => {
        :tooltip => normalized_state,
      }.merge(QuadiconHelper.machine_state(normalized_state)),
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => ui_lookup(:model => type)
      },
      :bottom_right => QuadiconHelper.provider_status(authentication_status)
    }
    icon[:middle] = QuadiconHelper::POLICY_SHIELD if get_policies.present?
    icon
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
