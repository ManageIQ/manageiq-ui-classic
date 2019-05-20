shared_context 'server roles' do
  let(:miq_server) { EvmSpecHelper.local_miq_server }
  let(:server_role) { ServerRole.find_by(:name => "smartproxy") }

  let(:assigned_server_role) do
    FactoryBot.create(:assigned_server_role,
                       :miq_server_id  => miq_server.id,
                       :server_role_id => server_role.id,
                       :active         => true,
                       :priority       => 1)
  end
end
