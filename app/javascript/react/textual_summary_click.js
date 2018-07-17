export default function textualSummaryGenericClick(item, event) {
  event.preventDefault();

  if (!item.link) {
    return;
  }

  if (item.external) {
    window.open(item.link, '_blank');
  } else if (item.explorer) {
    $.ajax({
      data: `authenticity_token=${encodeURIComponent($('meta[name=csrf-token]').attr('content'))}`,
      dataType: 'script',
      type: 'post',
      url: item.link,
    });
  } else {
    window.DoNav(item.link);
  }
}
