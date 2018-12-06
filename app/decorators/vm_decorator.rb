class VmDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-virtual-machine'
  end

  def fonticon
    nil
  end

  def fileicon
    "svg/vendor-#{vendor.downcase}.svg"
  end

  def quadicon
    icon = {
      :top_left     => {
        :tooltip => os_image_name.humanize.downcase
      }.merge(QuadiconHelper.os_icon(os_image_name.downcase)),
      :top_right    => {
        :tooltip => normalized_state
      }.merge(QuadiconHelper.machine_state(normalized_state)),
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => ui_lookup(:model => type)
      },
      :bottom_right => {
        :text    => t = v_total_snapshots.to_i,
        :tooltip => n_("%{number} Snapshot", "%{number} Snapshots", t) % {:number => t}
      }
    }
    icon[:middle] = QuadiconHelper::POLICY_SHIELD if get_policies.present?
    icon
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
