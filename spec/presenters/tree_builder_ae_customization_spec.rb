describe TreeBuilderAeCustomization do
  let(:sandbox) { {} }

  describe "#init_tree" do
    let(:expected_sandbox_values) do
      {
        :tree        => :dialog_import_export_tree,
        :klass_name  => "TreeBuilderAeCustomization",
        :open_nodes  => [],
        :open_all    => true,
        :active_node => "root"
      }
    end

    before do
      TreeBuilderAeCustomization.new("dialog_import_export_tree", sandbox)
    end

    it "stores values into the sandbox" do
      expect(sandbox[:trees][:dialog_import_export_tree]).to eq(expected_sandbox_values)
    end
  end
end
