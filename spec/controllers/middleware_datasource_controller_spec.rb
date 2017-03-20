describe MiddlewareDatasourceController do
  render_views
  before(:each) do
    stub_user(:features => :all)
  end

  describe '#button' do
    include_examples :ems_common_button_examples
  end

  it 'renders index' do
    get :index
    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'show_list')
  end

  describe '#show' do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      @datasource = FactoryGirl.create(:hawkular_middleware_datasource_initialized,
                                       :properties => {
                                         'Driver Name'    => 'foo',
                                         'Connection URL' => 'bar',
                                         'JNDI Name'      => 'foo-bar',
                                         'Enabled'        => 'yes'
                                       })
    end

    subject { get :show, :id => @datasource.id }

    context 'render' do
      render_views

      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => 'layouts/listnav/_middleware_datasource')
        is_expected.to render_template(:partial => 'layouts/_textual_groups_generic')
      end
    end
  end
end
