describe MiddlewareDeploymentController do
  render_views
  before(:each) do
    stub_user(:features => :all)
  end

  it 'renders index' do
    get :index
    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'show_list')
  end

  describe '#show' do
    let(:server) { FactoryGirl.create(:hawkular_middleware_server, :middleware_server_group => nil) }
    let(:ems) { FactoryGirl.create(:ems_middleware) }
    let(:deployment) { 
      FactoryGirl.create(:middleware_deployment, :ext_management_system => ems, :middleware_server => server) 
    } 

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
    end

    subject { get :show, :id => deployment.id }

    context 'render' do
      render_views

      it do
        allow_any_instance_of(ManageIQ::Providers::MiddlewareManager).to receive(:image_name).and_return('test')
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => 'layouts/listnav/_middleware_deployment')
        is_expected.to render_template(:partial => 'layouts/_textual_groups_generic')
      end
    end
  end
end
