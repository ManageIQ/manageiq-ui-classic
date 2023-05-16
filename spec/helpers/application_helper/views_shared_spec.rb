describe ApplicationHelper do
  describe '#ownership_user_options' do
    let(:child_tenant)                  { FactoryBot.create(:tenant) }
    let(:grand_child_tenant)            { FactoryBot.create(:tenant, :parent => child_tenant) }
    let(:great_grand_child_tenant)      { FactoryBot.create(:tenant, :parent => grand_child_tenant) }
    let(:child_role)                    { FactoryBot.create(:miq_user_role) }
    let(:grand_child_tenant_role)       { FactoryBot.create(:miq_user_role) }
    let(:great_grand_child_tenant_role) { FactoryBot.create(:miq_user_role) }
    let(:child_group)                   { FactoryBot.create(:miq_group, :role => child_role, :tenant => child_tenant) }
    let(:grand_child_group) do
      FactoryBot.create(:miq_group, :role   => grand_child_tenant_role,
                                    :tenant => grand_child_tenant)
    end
    let(:great_grand_child_group) do
      FactoryBot.create(:miq_group, :role   => great_grand_child_tenant_role,
                                    :tenant => great_grand_child_tenant)
    end
    let!(:admin_user)             { FactoryBot.create(:user_admin) }
    let!(:child_user)             { FactoryBot.create(:user, :miq_groups => [child_group]) }
    let!(:grand_child_user)       { FactoryBot.create(:user, :miq_groups => [grand_child_group, great_grand_child_group]) }
    let!(:great_grand_child_user) { FactoryBot.create(:user, :miq_groups => [great_grand_child_group]) }

    subject { helper.ownership_user_options }
    context 'admin user' do
      it 'lists all users' do
        allow(User).to receive(:server_timezone).and_return('UTC')
        login_as admin_user
        expect(subject.count).to eq(User.count)
      end
    end

    context 'a tenant user' do
      it 'lists users in his group' do
        allow(User).to receive(:server_timezone).and_return('UTC')
        login_as grand_child_user
        ids = grand_child_user.miq_groups.collect(&:user_ids).flatten.uniq
        expect(subject.values(&:id).map(&:to_i)).to match_array(ids)
      end
    end
  end
end
