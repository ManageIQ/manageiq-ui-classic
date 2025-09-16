describe PingController do
  before { EvmSpecHelper.create_guid_miq_server_zone }

  it 'pongs' do
    get :index

    expect(response.status).to eq(200)
    expect(response.body).to eq("pong")
  end

  it 'fails gracefully with database errors' do
    expect(ActiveRecord::Base).to receive(:connectable!).and_raise(PG::ConnectionBad)

    get :index

    expect(response.status).to eq(500)
    expect(response.body).to eq("ERROR: Unable to connect to the database (PG::ConnectionBad)")
  end

  it 'fails gracefully with non-database errors' do
    expect(ActiveRecord::Base).to receive(:connectable!).and_raise(RuntimeError)

    get :index

    expect(response.status).to eq(500)
    expect(response.body).to eq("ERROR: Unknown (RuntimeError)")
  end
end
