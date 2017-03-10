module Mixins
  module GenericSessionMixin

    private

    def get_session_data
      prefix          = self.class.session_key_prefix
      @title          = respond_to?(:title) ? title : ui_lookup(:tables => self.class.table_name)
      @layout         = prefix
      @table_name     = request.parameters[:controller]
      @lastaction     = session["#{prefix}_lastaction".to_sym]
      @display        = session["#{prefix}_display".to_sym]
      @filters        = session["#{prefix}_filters".to_sym]
      @catinfo        = session["#{prefix}_catinfo".to_sym]
      @cats           = session["#{prefix}_cats".to_sym]
      @showtype       = session["#{prefix}_showtype".to_sym]
      @base           = session["#{prefix}_compare_base".to_sym]
      @polArr         = session[:polArr] || ""           # current tags in effect
      @policy_options = session[:policy_options] || ""
    end

    def set_session_data
      prefix = self.class.session_key_prefix
      session["#{prefix}_lastaction".to_sym]      = @lastaction
      session["#{prefix}_display".to_sym]         = @display unless @display.nil?
      session["#{prefix}_compare_base".to_sym]    = @base
      session["#{prefix}_filters".to_sym]         = @filters
      session["#{prefix}_catinfo".to_sym]         = @catinfo
      session["#{prefix}_cats".to_sym]            = @cats
      session["#{prefix}_showtype".to_sym]        = @showtype
      session[:miq_compressed]                    = @compressed unless @compressed.nil?
      session[:miq_exists_mode]                   = @exists_mode unless @exists_mode.nil?
      session[:polArr]                            = @polArr unless @polArr.nil?
      session[:policy_options]                    = @policy_options unless @policy_options.nil?
    end
  end
end
