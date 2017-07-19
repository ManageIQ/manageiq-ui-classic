shared_examples 'TreeNode::Node#key prefix' do |prefix|
  describe '#key' do
    it "begins with #{prefix}" do
      expect(subject.key).to start_with(prefix)
    end
  end
end

shared_examples 'TreeNode::Node#image' do |image|
  describe '#image' do
    it "returns with #{image}" do
      expect(subject.image).to eq(image)
    end
  end
end

shared_examples 'TreeNode::Node#icon' do |icon|
  describe '#icon' do
    it "returns with #{icon}" do
      expect(subject.icon).to eq(icon)
    end
  end
end

shared_examples 'TreeNode::Node#tooltip same as #text' do
  describe '#tooltip' do
    it 'returns the same as node text' do
      expect(subject.tooltip).to eq(subject.text)
    end
  end
end

shared_examples 'TreeNode::Node#tooltip prefix' do |prefix|
  describe '#tooltip' do
    it 'returns the prefixed text' do
      expect(subject.tooltip).to eq("#{prefix}: #{subject.text}")
    end
  end
end

shared_examples 'TreeNode::Node#text description' do
  describe '#text' do
    it 'returns with the object description' do
      expect(subject.text).to eq(object.description)
    end
  end
end
