describe AnsibleCredentialHelper::TextualSummary do
  include_examples "textual_group_smart_management"
  include_examples "textual_group", "Properties", %i(name type created updated)
  include_examples "textual_group", "Relationships", %i(repositories)

  describe "#attribute_value (private)" do
    it "returns a masked password for present passwords" do
      rec = double(:secret => "password", :options => nil)
      expect(send(:attribute_value, :password, :secret, rec)).to eq("●●●●●●●●")
    end

    it "returns a masked password for password typed options" do
      rec = double(:options => {:secret => "password"})
      expect(send(:attribute_value, :password, :secret, rec)).to eq("●●●●●●●●")
    end

    it "returns nil if a password field isn't present" do
      rec = double(:thing => "stuff", :options => nil)
      expect(send(:attribute_value, :password, :secret, rec)).to be_nil
    end

    it "returns a non-password attribute" do
      rec = double(:thing => "stuff", :options => nil)
      expect(send(:attribute_value, :string, :thing, rec)).to eq("stuff")
    end

    it "returns a non-password option" do
      rec = double(:options => {:thing => "stuff"})
      expect(send(:attribute_value, :string, :thing, rec)).to eq("stuff")
    end

    it "returns nil if a key isn't present" do
      rec = double(:secret => "password", :options => nil)
      expect(send(:attribute_value, :string, :thing, rec)).to be_nil
    end
  end
end
