describe TreeBuilderOpsRbacFeatures do
  let(:features) do
    %w(
      all_vm_rules
      api_exclusive
      common_features
      instance
      instance_view
      instance_show_list
      instance_control
      instance_scan
      sui
    )
  end

  let(:role) do
    FactoryBot.create(:miq_user_role, :id => 100_000_002, :features => features)
  end

  let(:tree) do
    TreeBuilderOpsRbacFeatures.new(
      "features_tree",
      {:trees => {}},
      true,
      :role     => role,
      :editable => false
    )
  end

  let(:main_keys) do
    bs_tree.first["nodes"].map { |n| n['key'] }
  end

  let(:bs_tree) { JSON.parse(tree.locals_for_render[:bs_tree]) }

  describe 'bs_tree' do
    it 'builds the bs_tree' do
      expect(bs_tree).not_to be_nil
    end

    %w(aut compute con conf net set sto svc vi).each do |i|
      it "includes #{i}" do
        expect(main_keys).to include("100000002___tab_#{i}")
      end
    end

    it 'does not include blank nodes' do
      expect(main_keys).not_to include("100000002__")
      expect(main_keys).not_to include("100000002___tab_")
    end
  end
end
