shared_examples 'controller with custom buttons' do
  it "has custom toolbar when showing main view w/ @record" do
    controller.instance_variable_set(:@display, 'main')
    controller.instance_variable_set(:@lastaction, 'show')
    controller.instance_variable_set(:@record, true)

    expect(controller.custom_toolbar).to be_a_kind_of Mixins::CustomButtons::Result
  end

  it "has no custom toolbar when showing main view w/o @record" do
    controller.instance_variable_set(:@display, 'main')
    controller.instance_variable_set(:@lastaction, 'show')
    controller.instance_variable_set(:@record, nil)

    expect(controller.custom_toolbar).to be_falsey
  end

  it "has no custom toolbar when not showing main view w/ @record" do
    controller.instance_variable_set(:@display, 'not_main')
    controller.instance_variable_set(:@lastaction, 'show')
    controller.instance_variable_set(:@record, true)

    expect(controller.custom_toolbar).to be_falsey
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

    expect(controller.custom_toolbar).to eq('blank_view_tb')
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

    expect(controller.custom_toolbar).to eq('blank_view_tb')
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

    expect(controller.custom_toolbar).to be_a_kind_of Mixins::CustomButtons::Result
  end

  it "has custom toolbar when showing nested list if nested list custom buttons are enabled" do
    controller.instance_variable_set(:@display, 'generic_objects')
    controller.instance_variable_set(:@layout, 'generic_objects')
    controller.instance_variable_set(:@record, true)
    controller.instance_variable_set(
      :@sb,
      :active_tree => "my_tree",
      :trees       => {"my_tree" => {:active_node => 's-1r35'}}
    )

    expect(controller.custom_toolbar).to be_a_kind_of Mixins::CustomButtons::Result
  end

  it "has custom toolbar when showing an item in a nested list if nested list custom buttons are enabled" do
    controller.instance_variable_set(:@display, 'generic_objects')
    controller.instance_variable_set(:@layout, 'generic_object')
    controller.instance_variable_set(:@record, true)
    controller.instance_variable_set(
      :@sb,
      :active_tree => "my_tree",
      :trees       => {"my_tree" => {:active_node => 's-1r35'}}
    )
    expect(controller.custom_toolbar).to be_a_kind_of Mixins::CustomButtons::Result
  end
end

shared_examples 'relationship table screen with custom buttons' do |display|
  context "displayed entity is #{display}" do
    it "has custom toolbar when navigating through relationship table" do
      controller.instance_variable_set(:@display, display)
      controller.instance_variable_set(:@lastaction, 'show')
      controller.instance_variable_set(:@record, true) # @record is the provider
      expect(controller.custom_toolbar).to be_a_kind_of Mixins::CustomButtons::Result
    end
  end
end
