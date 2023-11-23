const payloadData = `
  def notify(level, message, subject)
    $evm.create_notification(:audience => 'user', :level => level, :message => message)
  end`;

export const codeMirrorData = {
  mode: 'miq_summary code_mirror',
  items: [
    {
      label: __('Label'),
      value: __('Value'),
    },
    {
      label: '',
      value: { input: 'code_mirror', props: { mode: 'ruby', payload: payloadData } },
      title: 'code mirror',
    },
  ],
  title: __('Automation Method Data'),
};
