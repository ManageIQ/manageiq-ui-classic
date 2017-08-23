module Mixins
  module GenericFormMixin
    def cancel_action(message)
      session[:edit] = nil
      add_flash(message, :warning)
      session[:flash_msgs] = @flash_array.dup if @flash_array
      javascript_redirect previous_breadcrumb_url
    end

    def delete_action
      if @display == "main"
        session[:flash_msgs] = @flash_array.dup if @flash_array
        javascript_redirect(previous_breadcrumb_url)
      else
        render_flash unless @flash_array.nil? || performed?
      end
    end

    def render_flash_json(msg, level = :success)
      render :json => {:message => msg, :level => level}
    end
  end
end
