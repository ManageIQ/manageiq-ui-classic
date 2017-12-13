class HostDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-screen'
  end

  def fileicon
    "svg/vendor-#{vmm_vendor_display.downcase}.svg"
  end

  def quadicon(_n = nil)
    {
      :top_left     => {:text => vms.size},
      :top_right    => {:state_icon => normalized_state.downcase},
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => type
      },
      :bottom_right => {
        :fileicon => status_img(self),
        :tooltip  => authentication_status
      }
    }
  end
end
