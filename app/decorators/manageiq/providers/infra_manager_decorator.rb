class ManageIQ::Providers::InfraManagerDecorator < ExtManagementSystemDecorator
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
      :top_left     => {:text => hosts.size},
      :top_right    => {:text => total_vms},
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
