module Mixins::CustomButtons
  extend ActiveSupport::Concern

  def custom_toolbar?
    return nil unless self.class.instance_eval { @custom_buttons }

    @explorer ? custom_toolbar_explorer? : custom_toolbar_simple?
  end

  def custom_toolbar_explorer?
    if x_tree
      if (@display == "main" && @record) || (@lastaction == "show_list")
        true
      else
        :blank
      end
    end
  end

  def custom_toolbar_simple?
    (@record && @lastaction == "show" && @display == "main") ||
      (@lastaction == "show_list")
  end

  class_methods do
    def has_custom_buttons
      @custom_buttons = true
    end
  end
end
