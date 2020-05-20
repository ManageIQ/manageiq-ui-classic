describe TreeBuilder do
  context "initialize" do
    it "initializes a tree" do
      tree = TreeBuilderInstances.new("instances_tree", {})
      expect(tree).to be_a_kind_of(TreeBuilder)
      expect(tree.name).to eq(:instances_tree)
    end

    it "sets sandbox hash that can be accessed by other methods in the class" do
      sb = {}
      tree = TreeBuilderInstances.new("instances_tree", sb)
      expect(tree).to be_a_kind_of(TreeBuilder)
      expect(tree.name).to eq(:instances_tree)
      sb.key?(:trees)
      sb[:trees].key?(:instances_tree)
    end
  end

  context "title_and_tip" do
    it "sets title and tooltip for the passed in root node" do
      tree = TreeBuilderInstances.new("instances_tree", {})
      root = tree.send(:root_options)
      expect(root).to eq(
        :text    => 'Instances by Provider',
        :tooltip => 'All Instances by Provider that I can see'
      )
    end
  end

  context "build_tree" do
    it "builds tree object and sets all settings and add nodes to tree object" do
      tree = TreeBuilderInstances.new("instances_tree", {})
      nodes = [{'key'     => "root",
                'nodes'   => [],
                'state'      => { 'expanded' => true },
                'text'       => "Instances by Provider",
                'tooltip'    => "All Instances by Provider that I can see",
                'selectable' => true,
                'icon'       => 'pficon pficon-folder-close'}]
      tree.locals_for_render.key?(:bs_tree)
      expect(JSON.parse(tree.locals_for_render[:bs_tree])).to eq(nodes)
    end
  end

  context "#locals_for_render" do
    it "returns the active node x_node from the TreeState as select_node" do
      tree = TreeBuilderInstances.new("instances_tree", {})

      active_node = 'foobar'
      allow_any_instance_of(TreeState).to receive(:x_node).and_return(active_node)

      expect(tree.locals_for_render[:select_node]).to eq(active_node)
    end
  end

  context "#reload!" do
    it "replaces @tree_nodes" do
      tree = TreeBuilderInstances.new("instances_tree", {})
      tree.instance_eval { @tree_nodes = "{}" }
      tree.reload!
      expect(tree.tree_nodes).not_to eq({})
    end
  end

  context "#root_options" do
    let(:tree) do
      Class.new(TreeBuilderInstances) do
        def root_options
          {
            :text    => "Foo",
            :tooltip => "Bar"
          }
        end
      end.new("instances_tree", {})
    end

    it "descendants can set their own root_options" do
      expect(tree.tree_nodes.to_json).to match(/"text":\s*"Foo"/)
    end
  end

  context '#x_get_child_nodes' do
    it 'returns for Hash models' do
      builder = TreeBuilderInstances.new("instances_tree", {})
      nodes = builder.x_get_child_nodes('tf_xx-10')
      expect(nodes).to be_empty
    end
  end

  context '#node_by_tree_id' do
    it 'returns a correct Hash for Hash models' do
      builder = TreeBuilderInstances.new("instances_tree", {})
      node = builder.node_by_tree_id('tf_xx-10')
      expect(node).to be_a_kind_of(Hash)
      expect(node[:id]).to eq("10")
      expect(node[:type]).to eq("xx")
      expect(node[:full_id]).to eq("tf_xx-10")
    end
  end

  # This is testing a private method, but it's relied upon by a lot of
  # subclass methods, so it doesn't seem unreasonable to specify its
  # behavior directly.
  context '#count_only_or_objects' do
    let(:builder) do
      Class.new(TreeBuilder) do
        public :count_only_or_objects
      end.new(:test_tree, {}, false)
    end

    it 'counts things in a Relation' do
      a = FactoryBot.create(:user_with_email)
      FactoryBot.create(:user_with_email)

      expect(builder.count_only_or_objects(true, User.none)).to eq(0)
      expect(builder.count_only_or_objects(true, User.where(:id => a.id))).to eq(1)
      expect(builder.count_only_or_objects(true, User.all)).to eq(2)
      expect(builder.count_only_or_objects(true, User.select('id, name'))).to eq(2)
    end

    it 'counts things in an Array' do
      expect(builder.count_only_or_objects(true, [])).to eq(0)
      expect(builder.count_only_or_objects(true, [:x])).to eq(1)
      expect(builder.count_only_or_objects(true, %i(x y z z y))).to eq(5)
    end

    it 'returns a collection when not counting' do
      a = FactoryBot.create(:user_with_email)
      b = FactoryBot.create(:user_with_email)

      expect(builder.count_only_or_objects(false, User.none)).to eq([])
      expect(builder.count_only_or_objects(false, User.where(:id => a.id))).to eq([a])
      expect(builder.count_only_or_objects(false, User.all).sort).to eq([a, b].sort)
      expect(builder.count_only_or_objects(false, User.select('id', 'name')).sort).to eq([a, b].sort)

      expect(builder.count_only_or_objects(false, [])).to eq([])
      expect(builder.count_only_or_objects(false, [:x])).to eq([:x])
      expect(builder.count_only_or_objects(false, %i(x y z z y))).to eq(%i(x y z z y))
    end

    it 'sorts the collection' do
      expect(builder.count_only_or_objects(false, %w(), 'to_s')).to eq(%w())
      expect(builder.count_only_or_objects(false, %w(x), 'to_s')).to eq(%w(x))
      expect(builder.count_only_or_objects(false, %w(c a b), 'to_s')).to eq(%w(a b c))

      expect(
        builder.count_only_or_objects(false, [['c', 1], ['a', 0], ['b', 1], ['d', 0]], %w(second first))
      ).to eq([['a', 0], ['d', 0], ['b', 1], ['c', 1]])

      expect(builder.count_only_or_objects(false, 1..5, ->(i) { [i % 2, i] })).to eq([2, 4, 1, 3, 5])
    end

    it 'counts collections with order' do
      expect(builder.count_only_or_objects(true, VmOrTemplate.distinct.order(VmOrTemplate.arel_table[:name].lower))).to eq(0)
    end
  end

  context "#open_node" do
    it "adds a node if not present" do
      sb = {}
      node = 'tf_xx-10'

      tree = TreeBuilderInstances.new("instances_tree", sb)
      tree.send(:open_node, node)

      expect(sb[:trees][:instances_tree][:open_nodes]).to include(node)
    end

    it "doesn't add already present nodes" do
      sb = {}
      node = 'tf_xx-10'

      tree = TreeBuilderInstances.new("instances_tree", sb)
      tree.send(:open_node, node)
      tree.send(:open_node, node)

      expect(sb[:trees][:instances_tree][:open_nodes].length).to eq(1)
    end
  end

  context "#build_node_id" do
    it "returns correct id for VM" do
      vm = FactoryBot.create(:vm)
      expect(TreeBuilder.build_node_id(vm)).to eq("v-#{vm.id}")
    end
  end

  describe '#post_check' do
    subject { TreeBuilder.new(:test, {}, false) }

    it 'postprocesses checked node parents and children' do
      nodes = [
        {
          :text  => 'Parent unset, children partial',
          :nodes => [
            {
              :state => {
                :checked => true
              }
            },
            {
              :state => {
                :checked => false
              }
            }
          ],
        },
        {
          :text  => 'Parent set, children unset',
          :state => {
            :checked => true,
          },
          :nodes => [{}, {}],
        },
        {
          :text  => 'Parent set, children partial',
          :state => {
            :checked => true,
          },
          :nodes => [
            {
              :state => {
                :checked => false
              }
            },
            {
              :state => {
                :checked => true
              }
            }
          ],
        },
      ]

      subject.send(:post_check, nodes)

      expect(nodes).to eq(
        [
          {
            :text  => 'Parent unset, children partial',
            :state => {
              :checked => 'undefined',
            },
            :nodes => [
              {
                :state => {
                  :checked => true
                }
              },
              {
                :state => {
                  :checked => false
                }
              }
            ],
          },
          {
            :text  => 'Parent set, children unset',
            :state => {
              :checked => true,
            },
            :nodes => [
              {
                :state => {
                  :checked => true,
                }
              },
              {
                :state => {
                  :checked => true,
                }
              }
            ],
          },
          {
            :text  => 'Parent set, children partial',
            :state => {
              :checked => true,
            },
            :nodes => [
              {
                :state => {
                  :checked => true
                }
              },
              {
                :state => {
                  :checked => true
                }
              }
            ],
          },
        ]
      )
    end
  end
end
