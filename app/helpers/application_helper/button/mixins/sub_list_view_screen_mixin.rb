module ApplicationHelper::Button::Mixins::SubListViewScreenMixin
  def sub_list_view_screen?
    @lastaction == 'show' && !@display.in?(%w[main vms instances all_vms cloud_volumes generic_objects])
  end
end
