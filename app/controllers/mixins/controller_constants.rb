module Mixins
  module ControllerConstants
    # Session data size logging constants
    case Rails.env
    when "test", "development"
      SESSION_LOG_THRESHOLD = 50.kilobytes
      SESSION_ELEMENT_THRESHOLD = 5.kilobytes
    else
      SESSION_LOG_THRESHOLD = 100.kilobytes
      SESSION_ELEMENT_THRESHOLD = 10.kilobytes
    end
  end
end
