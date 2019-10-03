class ApplicationHelper::Toolbar::DashboardCenter < ApplicationHelper::Toolbar::Basic
  custom_content(
    'dashboard',
    proc do
      {
        :allowAdd   => @widgets_menu[:allow_add],
        :allowReset => @widgets_menu[:allow_reset],
        :locked     => !!@widgets_menu[:locked],
        :items      => @widgets_menu[:items],
      }
    end
  )
end
