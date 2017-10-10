module Mixins
  module ControllerConstants
    # Per page choices and default
    PPCHOICES = [5, 10, 20, 50, 100, 200, 500, 1000].map { |item| [item.to_s, item] }.freeze
  end
end
