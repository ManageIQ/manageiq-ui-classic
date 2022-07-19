shared_examples_for 'an enabled button' do
  subject { button }
  it do
    subject.calculate_properties
    expect(subject[:enabled]).to be_truthy
    expect(subject[:title]).to be_nil
  end
end
