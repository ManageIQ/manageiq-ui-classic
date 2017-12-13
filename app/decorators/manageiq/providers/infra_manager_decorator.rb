module ManageIQ::Providers
  class InfraManagerDecorator < MiqDecorator
    def quadicon(_n = nil)
      {
        :top_left     => { :text => hosts.size },
        :top_right    => { :text => total_vms },
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
