export default function textualSummaryGenericClick(item, event) {
  event.preventDefault();

  if (!item.link) {
    return;
  }

  if (item.external) {
    window.open(item.link, '_blank', 'noopener,noreferrer');
  } else if (item.explorer) {
    const tokenElement = document.querySelector("meta[name=csrf-token]");
    // FIXME: jQuery is necessary here as it communicates with the old world
    $.ajax({
      data: `authenticity_token=${encodeURIComponent(tokenElement ? tokenElement.getAttribute('content') : '')}`,
      dataType: 'script',
      type: 'post',
      url: item.link,
    });
  } else {
    window.DoNav(item.link);
  }
}
