module ManageIQ::Providers
  class InfraManagerDecorator < ExtManagementSystemDecorator
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
end
