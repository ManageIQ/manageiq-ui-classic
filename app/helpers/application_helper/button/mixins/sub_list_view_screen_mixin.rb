module ApplicationHelper::Button::Mixins::SubListViewScreenMixin
  def sub_list_view_screen?
    @lastaction == 'show' && !@display.in?(%w(main vms instances all_vms))
  end
end
