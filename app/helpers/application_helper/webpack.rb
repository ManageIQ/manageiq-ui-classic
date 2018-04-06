module ApplicationHelper
  module Webpack
    def javascript_common_packs
      capture do
        concat(javascript_pack_tag('vendor'))

        # FIXME: temporary fix for a webpacker issue - #1875
        return if Rails.env.test?

        Webpacker::Manifest.instance.data.keys.each do |pack|
          concat(javascript_pack_tag(pack)) if pack.ends_with? '-common.js'
        end
      end
    end
  end
end
