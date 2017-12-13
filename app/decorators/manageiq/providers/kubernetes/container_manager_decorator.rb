module ManageIQ::Providers::Kubernetes
  class ContainerManagerDecorator < MiqDecorator
    def self.fileicon
      "svg/vendor-kubernetes.svg"
    end

    def quadicon(_n = nil)
      {
        :top_left     => { :text => total_vms },
        :top_right    => { :text => enabled? ? "on" : "paused" },
        :bottom_left  => {
          :fileicon => fileicon,
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
