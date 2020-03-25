describe AutomationManagerHelper do
  before do
    @record = FactoryBot.create(:ansible_configuration_script,
                                 :name        => "ConfigScript1",
                                 :survey_spec => {'spec' => [{'index' => 0, 'question_description' => 'Survey',
                                                              'min' => nil, 'default' => nil, 'max' => nil,
                                                              'question_name' => 'Survey', 'required' => false,
                                                              'variable' => 'test', 'choices' => nil,
                                                              'type' => 'text'}]})

    login_as @user = FactoryBot.create(:user)
  end

  context ".textual_configuration_script_survey" do
    subject { textual_configuration_script_survey }
    it 'shows the survey spec paramters' do
      expect(subject[:headers]).to match_array(['Question Name', 'Question Description', 'Variable',
                                                'Type', 'Min', 'Max', 'Default', 'Required', 'Choices'])
      expect(subject[:value]).to match_array([{:title => 0, :question_name => 'Survey',
                                               :question_description => 'Survey', :variable => 'test',
                                               :type => 'text', :min => nil, :max => nil, :default => nil,
                                               :required => false, :choices => nil}])
    end
  end
end
