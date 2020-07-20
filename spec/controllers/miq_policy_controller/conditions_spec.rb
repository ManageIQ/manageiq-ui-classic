describe MiqPolicyController::Conditions do
  let(:test_class) { Struct.new(:params) { include MiqPolicyController::Conditions } }
  subject { test_class.new(params) }

  describe '#condition_edit' do
    context 'adding new condition' do
      let(:params) { {:button => 'add'} }

      before do
        allow(subject).to receive(:add_flash)
        allow(subject).to receive(:assert_privileges)
        allow(subject).to receive(:build_saved_audit).and_return(:event        => 'condition_record_add',
                                                                 :target_id    => 1,
                                                                 :target_class => 'Condition',
                                                                 :userid       => 'admin',
                                                                 :message      => '')
        allow(subject).to receive(:exp_build_table)
        allow(subject).to receive(:exp_remove_tokens)
        allow(subject).to receive(:load_edit).and_return(true)
        allow(subject).to receive(:replace_right_cell)
        allow(subject).to receive(:x_active_tree).and_return(:condition_tree)
        subject.instance_variable_set(:@edit, :new => {:target_class_name => 'ContainerReplicator',
                                                       :description       => 'New_condition',
                                                       :notes             => nil,
                                                       :expression        => {},
                                                       :applies_to_exp    => {"???"=>"???"}})
        subject.instance_variable_set(:@sb, {})
      end

      it 'sets new node correctly' do
        subject.send(:condition_edit)
        expect(subject.instance_variable_get(:@new_condition_node)).to include('xx-containerReplicator_co-')
      end
    end
  end
end
