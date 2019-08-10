describe TreeBuilderEmsFolders do
  before do
    login_as FactoryBot.create(:user_with_group, :role => "operator", :settings => {})
    FactoryBot.create(:ems_google_network)
  end

  subject do
    described_class.new(:ems_folders_tree, {:trees => {}}, false, :selected => {})
  end

  describe '#tree_init_options' do
    it 'sets tree options correctly' do
      expect(subject.send(:tree_init_options)).to eq(:full_ids   => true,
                                                     :checkboxes => true,
                                                     :oncheck    => "miqOnCheckGeneric",
                                                     :check_url  => "/miq_policy/alert_profile_assign_changed/")
    end
  end

  describe '#x_get_tree_roots' do
    context 'no ems folders with a single provider' do
      it 'returns with a no roots' do
        expect(subject.send(:x_get_tree_roots, false).length).to eq(0)
      end
    end

    context 'redhat provider with folders' do
      let(:ems) { FactoryBot.create(:ems_redhat) }
      let(:datacenter) { FactoryBot.create(:datacenter) }
      let(:subfolder) { FactoryBot.create(:ems_folder, :name => 'vm') }

      before do
        datacenter.parent = ems
        datacenter.with_relationship_type("ems_metadata") { datacenter.add_folder(subfolder) }
        subfolder.with_relationship_type("ems_metadata") { subfolder.add_child(FactoryBot.create(:ems_folder)) }
      end

      it 'returns with a single root' do
        expect(subject.send(:x_get_tree_roots, false).length).to eq(1)
      end
    end
  end
end
