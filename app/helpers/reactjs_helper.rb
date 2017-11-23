module ReactjsHelper
  def mount_react_component(name, selector, data = [])
    javascript_tag(:defer => 'defer') do
      "$(MiqReact.mount('#{name}', '#{selector}', #{data.to_json}));".html_safe
    end
  end
end
