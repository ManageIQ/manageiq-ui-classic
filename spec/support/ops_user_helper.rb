module Spec
  module Support
    module OpsUserHelper
      def new_user_edit(data = {})
        controller.rbac_user_add # set up @edit for new user

        edit = controller.instance_variable_get(:@edit)
        edit[:new] = data
        controller.instance_variable_set(:@edit, edit)
      end

      def existing_user_edit(user, data = {})
        controller.params = {:typ    => nil,
                                                    :button => nil,
                                                    :id     => user.id)
        controller.rbac_user_edit # set up @edit for the user

        edit = controller.instance_variable_get(:@edit)
        edit[:new] ||= {}
        edit[:new].merge!(data)
        controller.instance_variable_set(:@edit, edit)
      end
    end
  end
end
