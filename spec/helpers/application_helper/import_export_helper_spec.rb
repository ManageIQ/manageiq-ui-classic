describe ApplicationHelper::ImportExportHelper do
  describe "#status_icon_image_path" do
    context "when the item exists" do
      let(:exists) { true }

      it "returns a checkmark image path" do
        expect(helper.status_icon_image_path(exists)).to match(%r{\/assets\/100\/checkmark.*(png)$})
      end
    end

    context "when the item does not exist" do
      let(:exists) { false }

      it "returns an equal-green image path" do
        expect(helper.status_icon_image_path(exists)).to match(%r{\/assets\/16\/equal-green.*(png)$})
      end
    end
  end

  describe "#status_description" do
    context "when the item exists" do
      let(:exists) { true }

      it "returns a helpful message" do
        expect(helper.status_description(exists)).to eq("This object already exists in the database with the same name")
      end
    end

    context "when the item does not exist" do
      let(:exists) { false }

      it "returns a new object message" do
        expect(helper.status_description(exists)).to eq("New object")
      end
    end
  end
end
