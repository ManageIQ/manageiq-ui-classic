module ReactjsHelper
  def react(name, data = {}, attributes = {})
    uid = unique_html_id('react')
    capture do
      concat(content_tag('div', nil, attributes.merge(:id => uid)))
      concat(javascript_tag("ManageIQ.component.componentFactory('#{j(name)}', '##{j(uid)}', #{data.to_json})"))
    end
  end
end
