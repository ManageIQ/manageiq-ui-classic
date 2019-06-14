shared_examples_for 'method_exists' do |methods|
  methods.each do |method|
    describe "##{method}" do
      it "method exists" do
        expect(respond_to?(method)).to be_truthy
      end
    end
  end
end

shared_examples_for 'textual_group_smart_management' do |items = []|
  describe "textual_group_smart_management" do
    it "Smart management" do
      items.push(:tags)
      expect(textual_group_smart_management).to be_kind_of(TextualTags)
      expect(textual_group_smart_management.title).to eq("Smart Management")
      expect(textual_group_smart_management.items).to eq(items)
    end
  end
end

shared_examples_for 'textual_group' do |title, items, suffix = nil|
  describe "#textual_group" do
    it title.to_s do
      suffix = title.downcase if suffix.nil?
      textual_group_name = send("textual_group_#{suffix}")
      expect(textual_group_name).to be_kind_of(TextualGroup)
      expect(textual_group_name.title).to eq(title)
      expect(textual_group_name.items).to eq(items)
    end
  end
end

shared_examples_for 'textual_description' do |value|
  describe "#textual_description" do
    subject { send("textual_description") }

    it { is_expected.to eq(value) }
  end
end

shared_examples_for 'textual_tenant' do |value|
  describe "#textual_tenant" do
    subject { send("textual_tenant") }

    it { is_expected.to eq(value) }
  end
end
