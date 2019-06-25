describe PictureController do
  let(:picture_content) { "BINARY IMAGE CONTENT" }
  let(:picture) { FactoryBot.create(:picture, :extension => "jpg") }

  before do
    stub_user(:features => :all)

    EvmSpecHelper.create_guid_miq_server_zone

    picture.content = picture_content.dup # dup because destructive operation
    picture.save
  end

  context 'skip_before_action :get_global_session_data / skip_after_action :set_global_session_data' do
    before do
      session[:edit] = "abc"
    end

    it 'retains the existing value of session[:edit] after the GET request' do
      get :show, :params => { :basename => "#{picture.id}.#{picture.extension}" }
      expect(session[:edit]).to eq("abc")
      expect(response.status).to eq(200)
    end
  end

  it 'can serve a picture directly from the database' do
    get :show, :params => { :basename => "#{picture.id}.#{picture.extension}" }
    expect(response.status).to eq(200)
    expect(response.body).to eq(picture_content)
  end

  it 'can serve a picture directly from the database using the uncompressed id' do
    get :show, :params => { :basename => "#{picture.id}.#{picture.extension}" }
    expect(response.status).to eq(200)
    expect(response.body).to eq(picture_content)
  end

  it "responds with a Not Found with pictures of incorrect extension" do
    get :show, :params => { :basename => "#{picture.id}.png" }
    expect(response.status).to eq(404)
    expect(response.body).to be_blank
  end

  it "responds with a Not Found with unknown pictures" do
    get :show, :params => { :basename => "bogusimage.gif" }
    expect(response.status).to eq(404)
    expect(response.body).to be_blank
  end
end
