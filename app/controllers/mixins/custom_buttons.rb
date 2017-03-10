module Mixins::CustomButtons
  extend ActiveSupport::Concern

  def custom_toolbar?
    return nil unless self.class.instance_eval { @custom_buttons }

    @explorer ? custom_toolbar_explorer? : custom_toolbar_simple?
  end

  def custom_toolbar_explorer?
    if x_tree                # Make sure we have the trees defined
      if x_node == "root" || # If on a root, create placeholder toolbar
         !@record            #   or no record showing
        :blank
      elsif @display == "main"
        true
      else
        :blank
      end
    end
  end

  def custom_toolbar_simple?
    @record && @lastaction == "show" && @display == "main"
  end

  class_methods do
    def has_custom_buttons
      @custom_buttons = true
    end
  end
end
