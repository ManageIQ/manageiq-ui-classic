describe TreeBuilderComplianceHistory do
  context 'TreeBuilderComplianceHistory' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Compliance History Group")
      login_as FactoryBot.create(:user, :userid => 'comliance_history__wilma', :miq_groups => [@group])
      compliance_detail_one = FactoryBot.create(:compliance_detail,
                                                 :miq_policy_id  => 1234,
                                                 :condition_desc => "I am first condition")
      compliance_detail_two = FactoryBot.create(:compliance_detail,
                                                 :miq_policy_id  => 1234,
                                                 :condition_desc => "I am second condition")
      compliance_detail_negative = FactoryBot.create(:compliance_detail,
                                                      :miq_policy_id     => 1111,
                                                      :miq_policy_result => false,
                                                      :condition_result  => false)
      compliance_details = [compliance_detail_one, compliance_detail_two, compliance_detail_negative]
      empty_compliance = FactoryBot.create(:compliance)
      compliance = FactoryBot.create(:compliance, :compliance_details => compliance_details)
      root = FactoryBot.create(:host, :compliances => [empty_compliance, compliance])
      @ch_tree = TreeBuilderComplianceHistory.new(:ch_tree, {}, true, :root => root)
    end
    it 'is not lazy' do
      tree_options = @ch_tree.send(:tree_init_options)
      expect(tree_options[:lazy]).not_to be_truthy
    end
    it 'returns Compliance as root kids' do
      kids = @ch_tree.send(:x_get_tree_roots)
      kids.each do |kid|
        expect(kid).to be_a_kind_of(Compliance)
      end
    end
    it 'returns correctly ComplianceDetail nodes' do
      parent = @ch_tree.send(:x_get_tree_roots).find { |x| x.compliance_details.present? }
      kids = @ch_tree.send(:x_get_compliance_kids, parent, false)
      expect(@ch_tree.send(:x_get_compliance_kids, parent, true)).to eq(2)
      kids.each do |kid|
        expect(kid).to be_a_kind_of(ComplianceDetail)
      end
    end
    it 'returns empty node' do
      parents = @ch_tree.send(:x_get_tree_roots)
      parent = parents.find { |x| x.compliance_details == [] }
      kid = @ch_tree.send(:x_get_compliance_kids, parent, false).first
      expect(kid).to eq(:id         => "#{parent.id}-nopol",
                        :text       => "No Compliance Policies Found",
                        :selectable => false,
                        :icon       => "fa fa-ban",
                        :tip        => nil)
      expect(kid).to be_a_kind_of(Hash)
      expect(@ch_tree.send(:x_get_tree_custom_kids, kid, true)).to eq(0)
    end
    it 'returns Policy with multiple Conditions' do
      grandparents = @ch_tree.send(:x_get_tree_roots)
      grandparent = grandparents.find { |x| x.compliance_details.present? }
      grandparent_id = "cm-#{grandparent.id}"
      parents = @ch_tree.send(:x_get_compliance_kids, grandparent, false)
      parent = parents.find { |x| x.miq_policy_id == 1234 }
      kids = @ch_tree.send(:x_get_compliance_detail_kids, parent, false, [grandparent_id])
      expect(@ch_tree.send(:x_get_compliance_detail_kids, parent, true, [grandparent_id])).to eq(2)
      kids.each do |kid|
        expect(kid).to be_a_kind_of(Hash)
      end
    end
  end
end
