class ApplicationHelper::Toolbar::DashboardCenter < ApplicationHelper::Toolbar::Basic
  # custom_content('custom', :partial => 'dashboard/dropdownbar')

  custom_content(
    'custom',
    :partial => 'dashboard/dropdownbar',
    :locals => proc do
      {
        :allowAdd => @widgets_menu[:allow_add],
        :allowReset => @widgets_menu[:allow_reset],
        :locked => !!@widgets_menu[:locked],
        :items => @widgets_menu[:items],
      }
    end
  )
end
