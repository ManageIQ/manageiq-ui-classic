module ApplicationHelper
  module Webpack
    def javascript_common_packs
      packs = sorted_common_packs

      capture do
        concat(javascript_pack_tag('vendor'))

        # FIXME: temporary fix for a webpacker issue - #1875
        return if Rails.env.test?

        packs.each do |pack|
          concat(javascript_pack_tag(pack))
        end
      end
    end

    private

    # application-common contains all the global bits and needs to go first (after vendor)
    def priority_packs
      %w(manageiq-ui-classic/application-common.js)
    end

    # ui-classic should go before plugins
    def priority_repos
      %w(manageiq-ui-classic)
    end

    def sorted_common_packs
      common = Webpacker::Manifest.instance.data.keys.select do |pack|
        pack.ends_with?('-common.js')
      end

      priority = common.group_by do |pack|
        repo = pack.split('/').first

        if priority_packs.include?(pack)
          :pack
        elsif priority_repos.include?(repo)
          :repo
        else
          :rest
        end
      end

      %i(pack repo rest).each do |p|
        priority[p] = [] if priority[p].nil?
        priority[p].sort!
      end

      [].concat(priority[:pack])
        .concat(priority[:repo])
        .concat(priority[:rest])
    end
  end
end
