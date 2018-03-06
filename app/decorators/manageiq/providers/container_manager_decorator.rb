class ManageIQ::Providers::ContainerManagerDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-server'
  end

  def fonticon
    nil
  end

  def fileicon
    "svg/vendor-#{image_name}.svg"
  end

  def quadicon(_n = nil)
    {
      :top_left     => {:text => container_nodes.size},
      :top_right    => {:state_icon => enabled? ? "on" : "paused"},
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
