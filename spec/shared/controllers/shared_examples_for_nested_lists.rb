shared_examples 'relationship table screen with GTL' do |displays, parent_factory|
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryBot.create(:user, :features => "ems_cloud_show")
    @parent = FactoryBot.create(parent_factory)
  end

  render_views
  context "for a parent #{parent_factory}" do
    displays.each do |display|
      it "displays the GTL for #{display}" do
        get :show, :params => { :display => display, :id => @parent.id, :format => :js }
        expect(response).to render_template('layouts/angular/_gtl')
        expect(response.status).to eq(200)
      end
    end
  end
end
