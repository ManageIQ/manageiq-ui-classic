module ManageIQ::Providers
  class PhysicalInfraManagerDecorator < MiqDecorator
    def quadicon(_n = nil)
      {
        :top_left     => { :text => physical_servers.size },
        :top_right    => { :text => "" },
        :bottom_left  => {
          :fileicon => "svg/vendor-#{h(item.image_name)}.svg",
          :tooltip  => type
        },
        :bottom_right => {
          :img     => status_img,
          :tooltip => authentication_status
        }
      }
    end
  end
end
