module ManageIQ::Providers::Hawkular
  class MiddlewareManagerDecorator < MiqDecorator
    def self.fonticon
      nil
    end

    def self.fileicon
      "svg/vendor-hawkular.svg"
    end

    def quadicon(_n = nil)
      {
        :top_left     => {
          :text => middleware_domains.size
        },
        :top_right    => {
          :text => middleware_servers.size
        },
        :bottom_left  => {
          :fileicon => fileicon,
          :tooltip  => type
        },
        :bottom_right => {
          :img     => status_img(self),
          :tooltip => authentication_status
        }
      }
    end
  end
end
