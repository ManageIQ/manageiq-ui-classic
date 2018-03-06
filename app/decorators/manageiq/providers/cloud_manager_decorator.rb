class ManageIQ::Providers::CloudManagerDecorator < ExtManagementSystemDecorator
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
      :top_left     => {:text => total_vms},
      :top_right    => {:text => total_miq_templates},
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
