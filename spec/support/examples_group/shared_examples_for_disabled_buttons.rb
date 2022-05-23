shared_examples_for 'a disabled button' do |err_msg|
  subject { button }
  it do
    subject.calculate_properties
    expect(subject[:enabled]).to be_falsey
    expect(subject[:title]).to eq(err_msg)
  end
end
