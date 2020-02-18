module Mixins
  module GenericFormMixin
    # Set flash message, add it to session, redirect to proper screen and render the flash message
    def flash_and_redirect(*args)
      session[:edit] = nil
      flash_to_session(*args)
      javascript_redirect(previous_breadcrumb_url)
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
