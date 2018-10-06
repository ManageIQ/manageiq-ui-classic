class ManageIQ::Providers::StorageManagerDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-server'
  end

  def fonticon
    nil
  end

  def fileicon
    if type.to_s.include?"Telefonica"
      "svg/vendor-telefonica.svg"
    else
      "svg/vendor-#{image_name}.svg"
    end
  end

  def quadicon
    if type.to_s.include?"Telefonica"
      icon = {
        :top_left     => {:text    => t = cloud_volumes.size,
                          :tooltip => n_("%{number} Cloud Volumes", "%{number} Cloud Volumes", t) % {:number => t}},
        :top_right    => {:text    => t = cloud_volume_snapshots.size,
                          :tooltip => n_("%{number} Cloud Volume Snapshots", "%{number} Cloud Volume Snapshots", t) % {:number => t}},
        :bottom_left  => {
          :fileicon => fileicon,
          :tooltip  => ui_lookup(:model => type)
        },
        :bottom_right => QuadiconHelper.provider_status(authentication_status, enabled?)
      }
    else
      icon = {
        :top_left     => {},
        :top_right    => {},
        :bottom_left  => {
          :fileicon => fileicon,
          :tooltip  => ui_lookup(:model => type)
        },
        :bottom_right => QuadiconHelper.provider_status(authentication_status, enabled?)
      }
    end
    icon[:middle] = QuadiconHelper::POLICY_SHIELD if get_policies.present?
    icon
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
