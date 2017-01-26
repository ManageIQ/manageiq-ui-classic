module TreeNode
  class MiqWidget < Node
    set_attribute(:title, &:title)
    set_attribute(:tooltip, &:title)
    set_attribute(:icon) do
      case @object.content_type
      when 'chart'
        'fa fa-pie-chart'
      when 'menu'
        'fa fa-share-square-o'
      when 'report'
        'fa fa-file-text-o'
      when 'rss'
        'fa fa-rss'
      end
    end
  end
end
