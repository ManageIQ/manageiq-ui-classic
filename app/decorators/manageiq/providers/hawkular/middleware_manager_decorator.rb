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
          :fonticon => fileicon,
          :tooltip  => type
        },
        :bottom_right => {
          :img     => QuadiconHelper::AssetsMapper.img_status(self),
          :tooltip => authentication_status
        },
        :has_policies? => !get_policies.empty?
      }
    end
  end
end
