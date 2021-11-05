module ApplicationHelper
  module UserHelper
    def theme_class
      case current_user.settings.fetch(:display, {})[:theme]
      when "dark"
        "dark"
      else
        ""
      end
    end
  end
end
