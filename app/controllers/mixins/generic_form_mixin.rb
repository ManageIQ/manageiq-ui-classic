module Mixins
  module GenericFormMixin
    def cancel_action(message)
      session[:edit] = nil
      flash_to_session(message, :warning)
      javascript_redirect previous_breadcrumb_url
    end

    def delete_action
      if @display == "main"
        flash_to_session
        javascript_redirect(previous_breadcrumb_url)
      else
        render_flash unless @flash_array.nil? || performed?
      end
    end

    def render_flash_json(msg, level = :success, options = {})
      render :json => {:message => msg, :level => level, :options => options}
    end
  end
end
