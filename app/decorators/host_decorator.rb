class HostDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-container-node'
  end

  def fileicon
    "svg/vendor-#{vmm_vendor_display.downcase}.svg"
  end

  def quadicon
    icon = {
      :top_left     => {:text => vms.size},
      :top_right    => QuadiconHelper.machine_state(normalized_state),
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => type
      },
      :bottom_right => {
        :fileicon => QuadiconHelper.status_img(authentication_status),
        :tooltip  => authentication_status
      }
    }
    icon[:middle] = { :fileicon => '100/shield.png' } if get_policies.present?
    icon
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end
