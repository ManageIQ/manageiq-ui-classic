shared_examples 'controller with custom buttons' do
  it "has custom toolbar when showing main view w/ @record" do
    controller.instance_variable_set(:@display, 'main')
    controller.instance_variable_set(:@lastaction, 'show')
    controller.instance_variable_set(:@record, true)

    expect(controller.custom_toolbar?).to be true
  end

  it "has no custom toolbar when showing main view w/o @record" do
    controller.instance_variable_set(:@display, 'main')
    controller.instance_variable_set(:@lastaction, 'show')
    controller.instance_variable_set(:@record, nil)

    expect(controller.custom_toolbar?).to be_falsey
  end

  it "has no custom toolbar when not showing main view w/ @record" do
    controller.instance_variable_set(:@display, 'not_main')
    controller.instance_variable_set(:@lastaction, 'show')
    controller.instance_variable_set(:@record, true)

    expect(controller.custom_toolbar?).to be_falsey
  end
end

shared_examples 'explorer controller with custom buttons' do
  it "has no custom toolbar when on root node" do
    controller.instance_variable_set(:@display, 'main')
    controller.instance_variable_set(:@explorer, true)
    controller.instance_variable_set(
      :@sb,
      :active_tree => "my_tree",
      :trees       => {"my_tree" => {:active_node => 'root'}}
    )

    expect(controller.custom_toolbar?).to eq(:blank)
  end

  it "has no custom toolbar when not showing main view w/ @record" do
    controller.instance_variable_set(:@display, 'non-main')
    controller.instance_variable_set(:@explorer, true)
    controller.instance_variable_set(:@record, true)
    controller.instance_variable_set(
      :@sb,
      :active_tree => "my_tree",
      :trees       => {"my_tree" => {:active_node => 'v-1r35'}}
    )

    expect(controller.custom_toolbar?).to eq(:blank)
  end

  it "has custom toolbar when showing main view w/ @record" do
    controller.instance_variable_set(:@display, 'main')
    controller.instance_variable_set(:@explorer, true)
    controller.instance_variable_set(:@record, true)
    controller.instance_variable_set(
      :@sb,
      :active_tree => "my_tree",
      :trees       => {"my_tree" => {:active_node => 'v-1r35'}}
    )

    expect(controller.custom_toolbar?).to be(true)
  end
end
