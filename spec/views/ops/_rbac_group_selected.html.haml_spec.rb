describe 'ops/_rbac_group_selected.html.haml' do
  let!(:group1) { FactoryBot.create(:miq_group) }
  let!(:group2) { FactoryBot.create(:miq_group) }

  before do
    assign(:edit, :new => {:group => [group2.id, group1.id]})
    allow(Rbac).to receive(:filtered).and_return([group2, group1])
  end

  it 'renders sorted selected groups' do
    render :partial => 'ops/rbac_group_selected'
    expect(rendered).to eq("<div id=\'group_selected\'>\n<i class=\'ff ff-group\'></i>\n#{group1.description}\n<br>\n<i class=\'ff ff-group\'></i>\n#{group2.description}\n<br>\n</div>\n")
  end
end
