module Mixins
  module GenericListMixin
    def index
      redirect_to(:action => 'show_list')
    end

    def show_list
      @showtype = nil
      @center_toolbar = self.class.toolbar_plural if self.class.toolbar_plural
      process_show_list
      @tree = build_view_tree if @gtl_type == 'tree'
    end
  end
end
