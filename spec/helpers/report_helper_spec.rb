def create_user_with_group(user_id, group_name, role)
  group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => group_name)
  FactoryBot.create(:user, :userid => user_id, :miq_groups => [group])
end

def create_and_generate_report_for_user(report_name, user)
  MiqReport.seed_report(report_name)
  @rpt = MiqReport.where(:name => report_name).last
  @rpt.generate_table(:userid => user.userid)
  report_result = @rpt.build_create_results(:userid => user.userid, :miq_group_id => user.current_group.id)
  report_result.reload
  @rpt
end

describe ReportHelper do
  describe '#visibility_options' do
    let(:role1) { FactoryBot.create(:miq_user_role, :name => 'EvmRole-auditor') }
    let(:role2) { FactoryBot.create(:miq_user_role, :name => 'EvmRole-desktop') }

    it 'returns "To All Users" when visibility is set to all' do
      widget = FactoryBot.create(:miq_widget, :visibility => {:roles => ['_ALL_']})
      expect(helper.visibility_options(widget)).to eq('To All Users')
    end

    it 'converts role IDs to role names and sorts alphabetically by name' do
      widget = FactoryBot.create(:miq_widget, :visibility => {:roles => [role1.id, role2.id]})
      result = helper.visibility_options(widget)
      expect(result).to eq('By Roles: EvmRole-auditor, EvmRole-desktop')
    end

    it 'sorts role names alphabetically regardless of ID order' do
      role3 = FactoryBot.create(:miq_user_role, :name => 'EvmRole-zebra')
      role4 = FactoryBot.create(:miq_user_role, :name => 'EvmRole-alpha')
      widget = FactoryBot.create(:miq_widget, :visibility => {:roles => [role3.id, role4.id]})
      result = helper.visibility_options(widget)
      # IDs are in order [zebra, alpha] but output should be alphabetically sorted
      expect(result).to eq('By Roles: EvmRole-alpha, EvmRole-zebra')
    end

    it 'converts group IDs to group descriptions and sorts alphabetically by description' do
      group1 = FactoryBot.create(:miq_group, :description => 'Group1')
      group2 = FactoryBot.create(:miq_group, :description => 'Group2')
      widget = FactoryBot.create(:miq_widget, :visibility => {:groups => [group1.id, group2.id]})
      result = helper.visibility_options(widget)
      expect(result).to eq('By Groups: Group1, Group2')
    end

    it 'sorts group descriptions alphabetically regardless of ID order' do
      group3 = FactoryBot.create(:miq_group, :description => 'Zebra Group')
      group4 = FactoryBot.create(:miq_group, :description => 'Alpha Group')
      widget = FactoryBot.create(:miq_widget, :visibility => {:groups => [group3.id, group4.id]})
      result = helper.visibility_options(widget)
      # IDs are in order [Zebra, Alpha] but output should be alphabetically sorted
      expect(result).to eq('By Groups: Alpha Group, Zebra Group')
    end
  end
end
