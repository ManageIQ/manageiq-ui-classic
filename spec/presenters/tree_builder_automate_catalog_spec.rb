describe TreeBuilderAutomateCatalog do
  include Spec::Support::AutomationHelper

  describe "#initialize" do
    subject { described_class.new(:automate_tree, sb) }

    let(:sb) { {:trees => {:ot_tree => {:open_nodes => []}}, :active_tree => :ot_tree} }
    let(:domains) { subject.tree_nodes.first[:nodes].collect { |h| h[:text] } }

    before do
      login_as FactoryBot.create(:user_with_group)
      create_ae_model(:name => 'MARIO', :ae_class => 'CLASS3', :ae_namespace => 'C/D/E')
      create_state_ae_model(:name => 'LUIGI', :ae_class => 'CLASS1', :ae_namespace => 'A/B/C')
    end

    context 'filtered with cached_waypoint_ids' do
      before { sb[:cached_waypoint_ids] = MiqAeClass.waypoint_ids_for_state_machines }

      it 'returns a tree with the filtered domain' do
        expect(domains).to match_array ['LUIGI']
      end
    end

    it 'returns a tree with both domains' do
      expect(domains).to match_array %w[LUIGI MARIO]
    end
  end
end
