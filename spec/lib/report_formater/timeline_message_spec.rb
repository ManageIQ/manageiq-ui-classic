describe ReportFormatter::TimelineMessage do
  context "#message_html" do
    context "for unknown column names" do
      subject { described_class.new({'column' => @value}, nil, nil, nil).message_html('column') }
      it "replaces double quotes with single quotes" do
        @value = '123""45'
        expect(subject).to eq "123''45"
      end

      it "escapes forwardslashes" do
        @value = '123/45'
        expect(subject).to eq '123\\\\/45'
      end

      it "escapes backslashes" do
        @value = '123\\45'
        expect(subject).to eq '123\\\\45'
      end
    end
  end
end
