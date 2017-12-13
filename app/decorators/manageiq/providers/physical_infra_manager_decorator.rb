module ManageIQ::Providers
  class PhysicalInfraManagerDecorator < ExtManagementSystemDecorator
    def quadicon(_n = nil)
      {
        :top_left     => {:text => physical_servers.size},
        :top_right    => {:text => ""},
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
end
