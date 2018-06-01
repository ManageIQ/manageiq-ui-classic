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
        :text    => t = security_groups.size,
        :tooltip => n_("%{number} Security Group", "%{number} Security Groups", t) % {:number => t}
      },
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => ui_lookup(:model => type)
      },
      :bottom_right => {
        :tooltip  => authentication_status
      }.merge(QuadiconHelper.provider_status(authentication_status, enabled?))
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
