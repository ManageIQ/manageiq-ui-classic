describe ApplicationHelper::PageLayouts do
  describe '#layout_uses_listnav?' do
    before { allow(helper).to receive(:action_name).and_return('show_list') }

    %w[ansible_credential ansible_playbook ansible_repository].each do |ctrl_name|
      it 'returns false for Automation Ansible list screens not to render listnav' do
        allow(helper).to receive(:controller_name).and_return(ctrl_name)
        expect(helper.layout_uses_listnav?).to eq(false)
      end
    end
  end
end
