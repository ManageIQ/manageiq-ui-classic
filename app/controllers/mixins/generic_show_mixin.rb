module Mixins
  module GenericShowMixin
    def show
      return unless init_show

      case @display
      # these methods are defined right in GenericShowMixin
      when "summary_only"
        show_download
      when "main"
        show_main

      # these methods are defined in MoreShowActions
      when "timeline"
        show_timeline if respond_to?(:timeline)
      when "performance"
        show_performance if respond_to?(:performance)
      when "compliance_history"
        show_compliance_history if respond_to?(:compliance_history)

      # nested list methods as enabled by 'display_methods'
      when *self.class.display_methods
        display_nested_list(@display)
      end

      replace_gtl_main_div if pagination_request?
    end

    def show_download
      show_main
      set_summary_pdf_data
    end

    def show_main
      # remember dashboard mode if dashboard is supported for this controller
      @sb[:summary_mode] = 'textual' if respond_to?(:dashboard_view)

      get_tagdata(@record) if @record.try(:taggings)
      drop_breadcrumb({:name => breadcrumb_name(nil),
                       :url  => "/#{controller_name}/show_list?page=#{@current_page}&refresh=y"},
                      true)

      drop_breadcrumb(:name =>  _("%{name} (Summary)") % {:name => @record.name},
                      :url  => show_link(@record))
      @showtype = "main"
    end

    def show_link(record, options = {})
      opts = options.merge(
        :controller => self.class.table_name,
        :id         => record.id,
        :action     => restful? ? :index : :show,
        :only_path  => true,
      )
      url_for(opts)
    end

    def gtl_url
      restful? ? '/' : '/show'
    end

    # value for @display when not given explicit through params[:display]
    #
    def default_display
      if respond_to?(:dashboard_view) && dashboard_view
        'dashboard'
      else
        'main'
      end
    end

    def init_show(model_class = self.class.model)
      @record = identify_record(params[:id], model_class)
      return false if record_no_longer_exists?(@record)
      @lastaction = 'show'
      @gtl_url = gtl_url

      unless pagination_or_gtl_request?
        @display = params[:display] || default_display
      end
      true
    end

    def nested_list_method(display)
      methods = self.class.display_methods
      # Converting to hash so brakeman doesn't complain about using params directly
      methods.zip(methods).to_h[display]
    end

    def nested_list_method_name(display)
      "display_#{nested_list_method(display)}"
    end

    def nested_list_call(display)
      public_send(nested_list_method_name(display))
    end

    def display_nested_list(display)
      respond_to?(nested_list_method_name(display).to_sym) ? nested_list_call(display) : display_nested_generic(display)
    end

    def display_nested_generic(display)
      nested_list(display, display.camelize.singularize.constantize)
    end

    def display_instances
      nested_list("vm_cloud", ManageIQ::Providers::CloudManager::Vm)
    end

    def display_images
      nested_list("template_cloud", ManageIQ::Providers::CloudManager::Template)
    end

    # options:
    #   breadcrumb_title -- title for the breadcrumb, defaults to
    #                       ui_lookup(:tables => table_name)
    #   parent_method    -- parent_method to be passed to get_view call
    #
    def nested_list(table_name, model, options = {})
      title = options[:breadcrumb_title] || ui_lookup(:tables => table_name)

      drop_breadcrumb(:name => _("%{name} (Summary)") % {:name => @record.name},
                      :url  => "/#{self.class.table_name}/show/#{@record.id}")
      drop_breadcrumb(:name => _("%{name} (All %{title})") % {:name => @record.name, :title => title},
                      :url  => "/#{self.class.table_name}/show/#{@record.id}?display=#{@display}")

      view_options = {:parent => @record}
      view_options[:parent_method] = options[:parent_method] if options.key?(:parent_method)

      @view, @pages = get_view(model, view_options)
      @showtype = @display
    end
  end
end
