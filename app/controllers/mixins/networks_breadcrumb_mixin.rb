module Mixins
  module NetworksBreadcrumbMixin
    def self.included(c)
      c.helper_method(:data_for_breadcrumbs)
    end

    def data_for_breadcrumbs
      breadcrumbs_options if defined?(breadcrumbs_options)
      url = "/" + controller_name
      url_copy = url_for.gsub(/\D*:\d*/, '')
      breadcrumbs = @breadcrumbs_start.nil? ? [] : @breadcrumbs_start
      @notshow = @notshow.nil? ? "show/" : ""
      breadcrumbs.push(:url => url, :title => @show_list_title) unless action_name == "show_list" || @show_list_title.nil?
      breadcrumbs.push(:url => "#{url}/#{@notshow}#{@record["id"]}", :title => @record["name"]) unless @record.nil? # || url_copy[/\d+/].nil?
      if @record.nil? && !@custom_record.nil? # && !url_copy[/\d+/].nil?
        breadcrumbs.push(:url => "#{url}/#{@notshow}#{@custom_record["id"]}", :title => @custom_record["title"])
      end
      breadcrumbs.push(:url => "#{url}/#{@notshow}#{@tagitems[0]["id"]}", :title => @tagitems[0]["name"]) unless @tagitems.nil? || @tagitems.length != 1
      breadcrumbs
    end
  end
end

#include Mixins::NetworksBreadcrumbMixin