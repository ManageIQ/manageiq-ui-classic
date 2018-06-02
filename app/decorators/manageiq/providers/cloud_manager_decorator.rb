class ManageIQ::Providers::CloudManagerDecorator < MiqDecorator
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
        :text    => t = total_vms,
        :tooltip => n_("%{number} Instance", "%{number} Instances", t) % {:number => t}
      },
      :top_right    => {
        :text    => t = total_miq_templates,
        :tooltip => n_("%{number} Template", "%{number} Templates", t) % {:number => t}
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
