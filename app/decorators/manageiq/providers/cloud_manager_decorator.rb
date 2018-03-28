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
      :top_left     => {:text => total_vms},
      :top_right    => {:text => total_miq_templates},
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
