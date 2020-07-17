# This mixin should be used to enforce implicit RBAC checks on routes without RBAC features with
# the same name. These routes include common features that are implemented on multiple controllers,
# like advanced search. The mixin should not be used for routes that have 1:1 mapping, but with a
# wrong action name or prefix. It's also not suitable for controller specific routes, even if a
# route with the same name is defined across multiple controllers with its own implementation.
#
# The `.feature_for_actions` method creates a mapping for a set of actions to be checked against
# the specified feature(s). It uses the standard `check_privileges` before_action by extending
# the `handle_generic_rbac` method with a lookup into the `.rbac_feature_mapping` if there's no
# existing `#{controller_name}_#{action_name}` feature for the given route. This should allow us
# to enforce RBAC on non-trivial common routes easily.

module Mixins
  module RbacFeaturePairingMixin
    extend ActiveSupport::Concern

    EXP_EDITOR_ACTIONS = %i[
      exp_button
      exp_token_pressed
      exp_changed
    ].freeze

    ADV_SEARCH_ACTIONS = %i[
      adv_search_button
      adv_search_load_choice
      adv_search_name_typed
      adv_search_clear
      adv_search_text_clear
      adv_search_toggle
      save_default_search
    ] + EXP_EDITOR_ACTIONS

    class_methods do
      def rbac_feature_pairing
        @rbac_feature_pairing ||= {}
      end

      def feature_for_actions(feature, *actions)
        actions.each { |action| rbac_feature_pairing[action] = feature }
      end
    end
  end
end
