shared_examples 'controller with custom buttons' do
  it "has custom toolbar when showing main view w/ @record" do
    controller.instance_variable_set(:@display, 'main')
    controller.instance_variable_set(:@lastaction, 'show')
    controller.instance_variable_set(:@record, true)

    text = controller.custom_toolbar_filename
    expect(text).to eq("custom_buttons_tb")
  end

  it "has no custom toolbar when showing main view w/o @record" do
    controller.instance_variable_set(:@display, 'main')
    controller.instance_variable_set(:@lastaction, 'show')
    controller.instance_variable_set(:@record, nil)

    text = controller.custom_toolbar_filename
    expect(text).to be_nil
  end

  it "has no custom toolbar when not showing main view w/ @record" do
    controller.instance_variable_set(:@display, 'not_main')
    controller.instance_variable_set(:@lastaction, 'show')
    controller.instance_variable_set(:@record, true)

    text = controller.custom_toolbar_filename
    expect(text).to be_nil
  end
end

shared_examples 'explorer controller with custom buttons' do
  it "has no custom toolbar when on root node" do
    controller.instance_variable_set(:@display, 'main')
    controller.instance_variable_set(:@explorer, true)
    controller.instance_variable_set(
      :@sb,
      {
        :active_tree => "my_tree",
        :trees       => {"my_tree" => {:active_node => 'root'}}
      }
    )

    text = controller.custom_toolbar_filename
    expect(text).to eq("blank_view_tb")
  end

  it "has no custom toolbar when not showing main view w/ @record" do
    controller.instance_variable_set(:@display, 'non-main')
    controller.instance_variable_set(:@explorer, true)
    controller.instance_variable_set(:@record, true)
    controller.instance_variable_set(
      :@sb,
      {
        :active_tree => "my_tree",
        :trees       => {"my_tree" => {:active_node => 'v-1r35'}}
      }
    )

    text = controller.custom_toolbar_filename
    expect(text).to eq("blank_view_tb")
  end

  it "has custom toolbar when showing main view w/ @record" do
    controller.instance_variable_set(:@display, 'main')
    controller.instance_variable_set(:@explorer, true)
    controller.instance_variable_set(:@record, true)
    controller.instance_variable_set(
      :@sb,
      {
        :active_tree => "my_tree",
        :trees       => {"my_tree" => {:active_node => 'v-1r35'}}
      }
    )

    text = controller.custom_toolbar_filename
    expect(text).to eq("custom_buttons_tb")
  end
end

