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

  describe '#show_search?' do
    it 'returns true if displaying Advanced Search' do
      allow(helper).to receive(:display_adv_search?).and_return(true)
      expect(helper.show_search?).to eq(true)
    end

    it 'returns true if displaying Search for appropriate controller' do
      allow(controller).to receive(:show_searchbar?).and_return(true)
      expect(helper.show_search?).to eq(true)
    end
  end
end
