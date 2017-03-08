module Mixins::CustomButtons
  extend ActiveSupport::Concern

  def custom_toolbar_filename
    return nil unless self.class.instance_eval { @custom_buttons }

    @explorer ? custom_toolbar_filename_explorer : custom_toolbar_filename_simple
  end

  def custom_toolbar_filename_explorer
    if x_tree                # Make sure we have the trees defined
      if x_node == "root" || # If on a root, create placeholder toolbar
         !@record            #   or no record showing
        "blank_view_tb"
      elsif @display == "main"
        "custom_buttons_tb"
      else
        "blank_view_tb"
      end
    end
  end

  def custom_toolbar_filename_simple
    "custom_buttons_tb" if @record && @lastaction == "show" && @display == "main"
  end

  class_methods do
    def custom_buttons
      @custom_buttons = true
    end
  end
end
