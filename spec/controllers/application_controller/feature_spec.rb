describe ApplicationController do
  context "Feature" do
    it "#new_with_hash creates a Struct" do
      expect(described_class::Feature.new_with_hash(:name => "whatever")).to be_a_kind_of(Struct)
    end

    it "#sets the values correctly" do
      feature = described_class::Feature.new_with_hash(:name => "foo")
      expect(feature.accord_name).to eq("foo")
      expect(feature.tree_name).to eq("foo_tree")
      expect(feature.accord_hash[:container]).to eq("foo_accord")
    end
  end
end
