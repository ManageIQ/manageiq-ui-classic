module Mixins
  module EmsCommon
    module Refresh
      def queue_refresh(model_class)
        ids = find_checked_items.empty? ? [checked_item_id] : find_checked_items
        items = ids.collect { |id| find_record_with_rbac(model_class, id) }
        EmsRefresh.queue_refresh(items, nil, {:create_task => true})
        add_flash(_("Refresh successfully initiated for the selected records"))
        render_flash
      end
      # TODO: safely move Mixins::EmsCommon::Metrics#refresh_or_capture_emss here, as well as any other refresh-related method.
    end
  end
end
