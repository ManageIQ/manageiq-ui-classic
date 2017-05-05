describe TreeBuilderOpsRbacFeatures do
  let(:features) do
    %w(
      all_vm_rules
      instance
      instance_view
      instance_show_list
      instance_control
      instance_scan
    )
  end

  let(:role) do
    FactoryGirl.create(:miq_user_role, :id => 100_000_002, :features => features)
  end

  let(:tree) do
    TreeBuilderOpsRbacFeatures.new(
      "features_tree",
      "features",
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
      t = bs_tree.first

      expect(t['key']).to match(/all_vm_rules/)
      expect(t['title']).to be_nil
      expect(t['tooltip']).to be_nil
      expect(t['checkable']).to be false
    end

    describe 'main sections' do
      %w(aut compute con conf mdl net opt set sto svc vi).each do |i|
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
end
