module TreeNode
  class Host < Node
    set_attribute(:icon, 'pficon pficon-screen')
    set_attribute(:tooltip) { "#{ui_lookup(:table => "host")}: #{@object.name}" }
  end
end
