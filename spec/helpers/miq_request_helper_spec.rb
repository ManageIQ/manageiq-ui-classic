describe MiqRequestHelper do
  let!(:database) { FactoryBot.create(:classification_tag, :name => "database") }
  let!(:dhcp)     { FactoryBot.create(:classification_tag, :name => "dhcp") }

  describe "#select_box_options" do
    it "maps Classification values to label and value" do
      result = helper.select_box_options(["Classification::#{database.id}", dhcp.id.to_s])

      expect(result).to eq([
                             {:label => database.description, :value => database.id.to_s},
                             {:label => dhcp.description, :value => dhcp.id.to_s}
                           ])
    end

    it "skips classifications that do not exist" do
      expect(helper.select_box_options(["Classification::0"])).to eq([])
    end
  end

  describe "#dialog_field_values" do
    it "returns an empty hash when the request has no dialog options" do
      expect(helper.dialog_field_values(nil)).to eq({})
    end

    it "removes the Array:: prefix from the keys" do
      expect(helper.dialog_field_values("Array::dialog_multi" => "x")).to eq("dialog_multi" => "x")
    end

    it "converts a single tag" do
      result = helper.dialog_field_values("dialog_tag" => "Classification::#{database.id}")

      expect(result["dialog_tag"]).to eq([{:label => database.description, :value => database.id.to_s}])
    end

    it "converts multiple tags separated by the unit separator" do
      value = ["Classification::#{database.id}", "Classification::#{dhcp.id}"].join("\u001F")

      expect(helper.dialog_field_values("dialog_tag" => value)["dialog_tag"].pluck(:value)).to eq([database.id.to_s, dhcp.id.to_s])
    end

    it "splits multi-select values separated by the unit separator" do
      expect(helper.dialog_field_values("Array::dialog_multi" => "a\u001Fb")["dialog_multi"]).to eq(%w[a b])
    end

    it "never constantizes values that merely contain ::" do
      expect(Object).not_to receive(:const_get)
      expect(helper.dialog_field_values("dialog_text" => "Kernel::exit")["dialog_text"]).to eq("Kernel::exit")
    end

    it "passes non-string values through" do
      expect(helper.dialog_field_values("dialog_number" => 5, "dialog_flag" => true, "dialog_nil" => nil))
        .to eq("dialog_number" => 5, "dialog_flag" => true, "dialog_nil" => nil)
    end
  end

  describe "#service_request_data" do
    it "returns the dialog id and the converted dialog options" do
      options = {:workflow_settings => {:dialog_id => 12}, :dialog => {"dialog_text" => "abc"}}

      expect(helper.service_request_data(options)).to eq(:dialogId => 12, :requestDialogOptions => {"dialog_text" => "abc"})
    end

    it "does not fail when the request has no workflow settings or dialog" do
      expect(helper.service_request_data({})).to eq(:dialogId => nil, :requestDialogOptions => {})
    end
  end
end
