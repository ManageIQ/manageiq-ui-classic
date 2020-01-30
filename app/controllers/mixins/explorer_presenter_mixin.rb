module Mixins
  module ExplorerPresenterMixin
    def rendering_objects
      ExplorerPresenter.new(
        :active_tree => x_active_tree,
        :delete_node => @delete_node
      )
    end
  end
end
