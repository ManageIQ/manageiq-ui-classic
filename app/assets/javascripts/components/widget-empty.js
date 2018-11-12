ManageIQ.angular.app.component('widgetEmpty', {
  template: [
    '<div class="blank-slate-pf" style="padding: 10px">',
    '  <div class="blank-slate-pf-icon">',
    '    <i class="fa fa-cog"></i>',
    '  </div>',
    '   <h1>',
    __('No data found.'),
    '   </h1>',
    '   <p>',
    __('If this widget is new or has just been added to your dashboard, the data is being generated and should be available soon.'),
    '   </p>',
    '</div>',
  ].join('\n'),
});
