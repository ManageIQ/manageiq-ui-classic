module Mixins
  module ExplorerPresenterMixin
    def update_tree_and_render_list(replace_trees)
      @explorer = true
      get_node_info(x_node)
      presenter = rendering_objects
      replace_explorer_trees(replace_trees, presenter)

      presenter.update(:main_div, r[:partial => 'layouts/x_gtl'])
      rebuild_toolbars(false, presenter)
      handle_bottom_cell(presenter)

      render :json => presenter.for_render
    end
  end
end
