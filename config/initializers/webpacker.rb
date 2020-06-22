# override defaults which use Rails.root
class Webpacker::Configuration
  class << self
    # output_path and public_path go to manageiq/public/

    def source_path
      ManageIQ::UI::Classic::Engine.root.join(source)
    end

    def file_path(root: ManageIQ::UI::Classic::Engine.root)
      root.join("config/webpacker.yml")
    end
  end
end

class Webpacker::Env < Webpacker::FileLoader
  class << self
    def file_path
      ManageIQ::UI::Classic::Engine.root.join("config", "webpacker.yml")
    end
  end
end

# if Rails.env.test?
#   module Webpacker::Helper
#     def javascript_pack_tag(_)
#       # does nothing in specs
#     end
#   end
# end
