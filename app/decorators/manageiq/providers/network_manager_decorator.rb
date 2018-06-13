class ManageIQ::Providers::NetworkManagerDecorator < MiqDecorator
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
      :top_left     => {
        :text    => t = cloud_networks.size,
        :tooltip => n_("%{number} Cloud Network", "%{number} Cloud Networks", t) % {:number => t}
      },
      :top_right    => {
        :text    => t = cloud_subnets.size,
        :tooltip => n_("%{number} Cloud Subnet", "%{number} Cloud Subnets", t) % {:number => t}
      },
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => ui_lookup(:model => type)
      },
      :bottom_right => QuadiconHelper.provider_status(authentication_status, enabled?)
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
