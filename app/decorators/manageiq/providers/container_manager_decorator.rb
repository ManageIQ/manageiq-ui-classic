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

  def quadicon
    icon = {
      :top_left     => {:text => container_nodes.size},
      :top_right    => QuadiconHelper.machine_state(enabled? ? 'on' : 'paused'),
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => type
      },
      :bottom_right => {
        :fileicon => QuadiconHelper.status_img(authentication_status),
        :tooltip  => authentication_status
      },
      :middle       => {
        :fileicon => '100/shield.png'
      }
    }
    icon[:middle] = { :fileicon => '100/shield.png' } if get_policies.present?
    icon
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
