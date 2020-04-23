module Mixins
  module ListnavMixin
    def listnav_filename
      "show_list" if params[:action] == "show_list"
    end
  end
end
