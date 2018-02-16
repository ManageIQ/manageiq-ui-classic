module ManageIQ::Providers
  class CloudManagerDecorator < ExtManagementSystemDecorator
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
end
