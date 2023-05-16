export const tableListViewData = {
  title: 'Tables with the Most Rows',
  headers: [{ key: 'name', label: __('Name') }, { key: 'rows', label: __('Rows') }],
  values: [
    {
      title: 'vim_performance_states',
      name: 'vim_performance_states',
      rows: '676',
      explorer: true,
      link: 'miqTreeActivateNode(\'vmdb_tree\', \'tb-10000000000181\');',
    },
    {
      title: 'miq_report_result_details',
      name: 'miq_report_result_details',
      rows: '280',
      explorer: true,
      link: 'miqTreeActivateNode(\'vmdb_tree\', \'tb-10000000000197\');',
    },
  ],
  colOrder: ['name', 'value'],
};
