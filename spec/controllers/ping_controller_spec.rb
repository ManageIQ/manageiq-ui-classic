describe ::PingController do
  before { EvmSpecHelper.create_guid_miq_server_zone }

  it 'pongs' do
    get :index

    expect(response.status).to eq(200)
    expect(response.body).to eq("pong")
  end
end
