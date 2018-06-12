describe ApplicationHelper::ImportExportHelper do
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
