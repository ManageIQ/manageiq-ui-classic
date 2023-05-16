module ApplicationHelper
  module Flash
    def flash_to_session(*args)
      add_flash(*args) unless args.empty?
      session[:flash_msgs] = @flash_array.dup if @flash_array
    end

    def render_flash_msg?
      # Don't render flash message in gtl, partial is already being rendered on screen
      return false if request.parameters[:controller] == "miq_request" && @lastaction == "show_list"
      return false if request.parameters[:controller] == "service" && @lastaction == "show" && @view

      true
    end

    def javascript_flash(**args)
      add_flash(args[:text], args[:severity]) if args[:text].present?

      flash_div_id = args.key?(:flash_div_id) ? args[:flash_div_id] : 'flash_msg_div'
      ex = ExplorerPresenter.flash.replace(flash_div_id,
                                           render_to_string(:partial => "layouts/flash_msg",
                                                            :locals  => {:flash_div_id => flash_div_id}))
      ex.scroll_top if @flash_array.present?
      ex.spinner_off if args[:spinner_off]
      ex.focus(args[:focus]) if args[:focus]
      ex.activate_tree_node(args[:activate_node]) if args[:activate_node]

      render :json => ex.for_render
    end
  end
end
