describe OpsHelper do
  it "#database_details" do
    db_config = ActiveRecord::Base.configurations.configs_for(:env_name => Rails.env).first.configuration_hash

    expect(helper.database_details).to match_array(
      [
        {:cells => a_hash_including(:label => "Name", :value => a_string_matching(/ Database$/))},
        {:cells => {:label => "Hostname",      :value => db_config[:host]}},
        {:cells => {:label => "Database name", :value => db_config[:database]}},
        {:cells => {:label => "Username",      :value => db_config[:username]}},
      ]
    )
  end

  describe '#auth_mode_name' do
    modes = %w[amazon httpd database]
    modes_pretty = %w[Amazon External\ Authentication Database]

    modes.zip modes_pretty.each do |mode, mode_pretty|
      it "Returns #{mode_pretty} when mode is #{mode}" do
        stub_settings(:authentication => {:mode => mode}, :server => {})
        expect(helper.auth_mode_name).to eq(mode_pretty)
      end
    end
  end
end
