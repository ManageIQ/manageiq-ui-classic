module ReactjsHelper
  def react(name, data = {}, attributes = {}, element = 'div')
    uid = attributes[:id] || unique_html_id('react')
    capture do
      concat(content_tag(element, nil, attributes.merge(:id => uid)))
      concat(javascript_tag("ManageIQ.component.componentFactory('#{j(name)}', '##{j(uid)}', #{data.to_json})"))
    end
  end
end
