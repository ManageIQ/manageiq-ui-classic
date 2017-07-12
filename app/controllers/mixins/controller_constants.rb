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

    # Per page choices and default
    PPCHOICES = [
      [N_("5"), 5],
      [N_("10"), 10],
      [N_("20"), 20],
      [N_("50"), 50],
      [N_("100"), 100],
      [N_("200"), 200],
      [N_("500"), 500],
      [N_("1000"), 1000]
    ].freeze
  end
end
