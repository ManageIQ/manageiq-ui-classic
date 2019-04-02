describe TreeBuilderAutomateSimulationResults do
  context 'TreeBuilderAutomateSimulationResults' do
    before do
      @data = "<MiqAeWorkspace>\\n<MiqAeObject namespace='ManageIQ/SYSTEM' class='PROCESS' instance='Automation'>\\n</MiqAeObject>\\n</MiqAeWorkspace>\\n"
      @ae_simulation_tree = TreeBuilderAutomateSimulationResults.new(:ae_simulation_tree, :ae_simulation, {}, true, :root => @data)
    end

    it 'no root is set' do
      expect { @ae_simulation_tree.send(:root_options) }.to raise_error(NoMethodError)
    end

    it 'sets attribute nodes correctly' do
      nodes = @ae_simulation_tree.send(:x_get_tree_roots, false)
      tree_data = {:id         => "e_1",
                   :text       => "ManageIQ/SYSTEM / PROCESS / Automation",
                   :image      => "svg/vendor-redhat.svg",
                   :tooltip    => "ManageIQ/SYSTEM / PROCESS / Automation",
                   :elements   => [],
                   :selectable => false}
      expect(nodes).to include(tree_data)
    end
  end
end
