describe OpsController do
  context '#forest_accept' do
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      vmdb = VMDB::Config.new('vmdb')
      @e = {:current => vmdb, :new => {:authentication => {:user_proxies => []}}}
    end

    after(:each) do
      controller.instance_variable_set(:@_params, :user_proxies_mode => '', :user_proxies => @user_proxies)
      session[:edit] = @e
      expect(controller).to receive(:render)
      controller.send(:forest_accept)
      expect(response.status).to eq(200)
    end

    it 'is an existing record' do
      user_proxies = {:ldaphost => 'ldap.manageiq1.org',
                      :ldapport => '389',
                      :mode     => 'ldap',
                      :basedn   => 'cn=groups,cn=accounts,dc=miq',
                      :bind_dn  => 'uid=admin,cn=users,cn=accounts,dc=miq,dc=e',
                      :bind_pwd => '******'}
      @e[:new][:authentication][:user_proxies] = [user_proxies]
      session[:entry] = user_proxies
    end

    it 'is a new record' do
      session[:entry] = 'new'
    end
  end
end
