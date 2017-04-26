module Spec
  module Support
    module ViewHelper
      def set_controller_for_view(controller_name)
        controller.request.path_parameters[:controller] = controller_name
      end

      def set_controller_for_view_to_be_restful
        allow(controller).to receive(:restful?).and_return(true)
      end

      def set_controller_for_view_to_be_nonrestful
        allow(controller).to receive(:restful?).and_return(false)
      end
    end
  end
end
