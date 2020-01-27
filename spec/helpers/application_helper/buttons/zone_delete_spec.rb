describe ApplicationHelper::Button::ZoneDelete do
  let(:view_context)  { setup_view_context_with_sandbox({}) }
  let(:selected_zone) { FactoryBot.create(:zone) }
  let(:button)        { described_class.new(view_context, {}, {'selected_zone' => selected_zone}, {}) }

  describe '#calculate_properties' do
    context "when a message is returned" do
      before do
        expect(selected_zone).to receive(:message_for_invalid_delete).and_return("an error message")
        button.calculate_properties
      end

      it_behaves_like 'a disabled button', "an error message"
    end

    context "when a message is not returned" do
      before do
        expect(selected_zone).to receive(:message_for_invalid_delete).and_return(nil)
        button.calculate_properties
      end

      it_behaves_like 'an enabled button'
    end
  end
end
