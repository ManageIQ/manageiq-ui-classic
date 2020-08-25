require_relative 'shared_storage_manager_context'

shared_examples :shared_examples_for_ems_object_storage_controller do |providers|
  render_views

  providers.each do |t|
    context "for #{t}" do
      include_context :shared_storage_manager_context, t
      before do
        stub_user(:features => :all)
        setup_zone
      end

      describe "#show_list" do
        it "renders index" do
          get :index
          expect(response.status).to eq(302)
          expect(response).to redirect_to(:action => 'show_list')
        end

        it "renders show_list" do
          # TODO(lsmola) figure out why I have to mock pdf available here, but not in other Manager's lists
          allow(PdfGenerator).to receive_messages(:available? => false)
          session[:settings] = {:default_search => 'foo',
                                :views          => {},
                                :perpage        => {:list => 10}}
          get :show_list
          expect(response.status).to eq(200)
          expect(response.body).to_not be_empty
        end
      end
    end

    context "for #{t}" do
      include_context :shared_storage_manager_context, t
      before do
        stub_user(:features => :all)
        setup_zone
      end

      describe '#show_list' do
        render_views

        it 'renders only object storage' do
          expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(:model_name                     => "ManageIQ::Providers::StorageManager",
                                                                                           :no_flash_div                   => false,
                                                                                           :report_data_additional_options => {:lastaction                => "show_list",
                                                                                                                               :supported_features_filter => "supports_object_storage?"})
          post :show_list
          expect(response.status).to eq(200)
        end
      end
    end
  end
end
