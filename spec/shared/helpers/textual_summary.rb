shared_examples_for 'method_exists' do |methods|
  methods.each do |method|
    describe "##{method}" do
      it "method exists" do
        expect(respond_to?(method)).to be_truthy
      end
    end
  end
end

shared_examples_for '#textual_group_properties' do |items|
  it "returns correct value" do
    expect(textual_group_properties).to be_kind_of(TextualGroup)
    expect(textual_group_properties.title).to eq("Properties")
    expect(textual_group_properties.items).to eq(items)
  end
end

shared_examples_for '#textual_group_relationships' do |items|
  it "returns correct value" do
    expect(textual_group_relationships).to be_kind_of(TextualGroup)
    expect(textual_group_relationships.title).to eq("Relationships")
    expect(textual_group_relationships.items).to eq(items)
  end
end

shared_examples_for '#textual_group_options' do |title, items|
  it "returns correct value" do
    expect(textual_group_options).to be_kind_of(TextualGroup)
    expect(textual_group_options.title).to eq("#{title} Options")
    expect(textual_group_options.items).to eq(items)
  end
end

shared_examples_for '#textual_group_smart_management' do |items|
  it "returns correct value" do
    expect(textual_group_smart_management).to be_kind_of(TextualTags)
    expect(textual_group_smart_management.title).to eq("Smart Management")
    expect(textual_group_smart_management.items).to eq(items)
  end
end
