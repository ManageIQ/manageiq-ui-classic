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

  def quadicon
    {
      :top_left     => {:text => hosts.size},
      :top_right    => {:text => total_vms},
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => type
      },
      :bottom_right => {
        :fileicon => QuadiconHelper::Decorator.status_img(authentication_status),
        :tooltip  => authentication_status
      }
    }
  end

  def single_quad
    {
      :fileicon => fileicon
    }
  end
end
