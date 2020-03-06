shared_examples '#download_summary_pdf' do |object|
  context 'download pdf file' do
    let(:record) { FactoryBot.create(object) }
    let(:pdf_options) { controller.instance_variable_get(:@options) }

    before do
      allow(PdfGenerator).to receive(:pdf_from_string).and_return("")
      allow(controller).to receive(:server_timezone).and_return('UTC')
      login_as FactoryBot.create(:user_admin)
      stub_user(:features => :all)
      get :download_summary_pdf, :params => {:id => record.id}
    end

    it 'request returns 200' do
      expect(response.status).to eq(200)
    end

    it 'title is set correctly' do
      expect(pdf_options[:title]).to eq("#{ui_lookup(:model => record.class.name)} \"#{record.name}\"")
    end

    it "should not raise error" do
      expect(assigns(:bang)).to be_nil
    end
  end
end
