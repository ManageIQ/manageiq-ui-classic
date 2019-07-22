module Mixins
  module ControllerConstants
    # Per page choices and default
    PPOPTIONS = [5, 10, 20, 50, 100, 200, 500, 1000].freeze
    PPCHOICES = PPOPTIONS.map { |item| [item.to_s, item] }.freeze
  end
end
