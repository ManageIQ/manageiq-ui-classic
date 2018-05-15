module ReactjsHelper
  def mount_react_component(name, selector, data = [])
    javascript_tag(:defer => 'defer') do
      "$(ManageIQ.react.mount('#{name}', '#{selector}', #{data.to_json}));".html_safe
    end
  end

  def react(name, data = {})
    uid = unique_html_id('react')
    capture do
      concat(tag('div', :id => uid))
      concat(javascript_tag("ManageIQ.component.componentFactory('#{j(name)}', '##{j(uid)}', #{data.to_json})"))
    end
  end
end
