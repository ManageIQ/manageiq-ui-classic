describe TreeBuilderAutomate do
  include Spec::Support::AutomationHelper

  describe "#initialize" do
    before { login_as FactoryBot.create(:user_with_group) }

    subject { described_class.new(:automate_tree, sb) }

    let(:ae_model) { create_state_ae_model(:name => 'LUIGI', :ae_class => 'CLASS1', :ae_namespace => 'A/B/C') }
    let(:sb) { {:trees => {:ot_tree => {:open_nodes => []}}, :active_tree => :ot_tree, :domain_id => ae_model.id} }
    let(:domains) { subject.tree_nodes.first[:nodes].collect { |h| h[:text] } }

    it "creates a tree with the domains" do
      expect(domains).to match_array ['LUIGI']
    end
  end
end
