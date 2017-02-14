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
      get_tagdata(@record) if @record.try(:taggings)
      drop_breadcrumb({:name => ui_lookup(:models => self.class.model.to_s),
                       :url  => "/#{controller_name}/show_list?page=#{@current_page}&refresh=y"},
                      true)

      show_url = restful? ? "/#{controller_name}/" : "/#{controller_name}/show/"

      drop_breadcrumb(:name =>  _("%{name} (Summary)") % {:name => @record.name},
                      :url  => "#{show_url}#{@record.id}")
      @showtype = "main"
    end

    def gtl_url
      restful? ? '/' : '/show'
    end

    def init_show(model_class = self.class.model)
      @record = identify_record(params[:id], model_class)
      return false if record_no_longer_exists?(@record)
      @lastaction = 'show'
      @gtl_url = gtl_url
      @display = params[:display] || 'main' unless pagination_or_gtl_request?
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

    def nested_list(table_name, model)
      title = ui_lookup(:tables => table_name)
      drop_breadcrumb(:name => _("%{name} (Summary)") % {:name => @record.name},
                      :url  => "/#{self.class.table_name}/show/#{@record.id}")
      drop_breadcrumb(:name => _("%{name} (All %{title})") % {:name => @record.name, :title => title},
                      :url  => "/#{self.class.table_name}/show/#{@record.id}?display=#{@display}")
      @view, @pages = get_view(model, :parent => @record) # Get the records (into a view) and the paginator
      @showtype     = @display
    end
  end
end
