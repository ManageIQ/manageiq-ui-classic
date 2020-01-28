module Mixins
  module ListnavMixin
    def listnav_filename
      if params[:action] == "show_list"
        "show_list"
      elsif params[:action] == "show"
        controller_name
      end
    end
  end
end
