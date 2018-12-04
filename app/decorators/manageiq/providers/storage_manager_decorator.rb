class ManageIQ::Providers::StorageManagerDecorator < MiqDecorator
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
      :top_left     => {},
      :top_right    => {},
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => ui_lookup(:model => type)
      },
      :bottom_right => QuadiconHelper.provider_status(authentication_status, enabled?)
    }

    # Due to the lack of the separate STI classes this has to be done :(
    if supports_block_storage?
      icon[:top_left] = {
        :text    => t = cloud_volumes.size,
        :tooltip => n_("%{number} Cloud Volume", "%{number} Cloud Volumes", t) % {:number => t}
      }
      icon[:top_right] = {
        :text    => t = cloud_volume_snapshots.size,
        :tooltip => n_("%{number} Cloud Volume Snapshot", "%{number} Cloud Volume Snapshots", t) % {:number => t}
      }
    elsif supports_object_storage?
      icon[:top_left] = {
        :text    => t = cloud_object_store_containers.size,
        :tooltip => n_("%{number} Cloud Object Store Container", "%{number} Cloud Object Store Containers", t) % {:number => t}
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
