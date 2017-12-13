module ManageIQ::Providers
  class ContainerManagerDecorator < MiqDecorator
    def quadicon(_n = nil)
      {
        :top_left     => {:text => container_nodes.size},
        :top_right    => {:state_icon => enabled? ? "on" : "paused"},
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
