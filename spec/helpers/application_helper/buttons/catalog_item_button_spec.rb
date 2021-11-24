require 'spec_helper'

describe ApplicationHelper::Button::CatalogItemButton do
  let(:session) { {} }
  let(:user) { FactoryBot.create(:user) }
  let(:view_context) { setup_view_context_with_sandbox({}).tap { |ctx| allow(ctx).to receive(:current_user).and_return(user) } }
  let(:button) { described_class.new(view_context, {}, {}, {:child_id => "ab_button_new"}) }
  let(:features) { %w[catalogitem_new catalogitem_edit atomic_catalogitem_new atomic_catalogitem_edit] }

  before do
    # all the button features need to be seeded
    # otherwise our tests detect a potential issue
    EvmSpecHelper.seed_specific_product_features(features)
    login_as user
    # current_user is actually passed in via button -> view_context -> current_user
    # and not via User.current_user
  end

  describe "#role_allows_feature?" do
    it "will deny access" do
      expect(button.role_allows_feature?).to be false
    end

    context "with privileged user" do
      let(:user) { FactoryBot.create(:user, :features => "catalogitem_new") }

      it "will grant access" do
        expect(button.role_allows_feature?).to be true
      end
    end
  end
end
