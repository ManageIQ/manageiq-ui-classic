module VmwareConsoleHelper
  KEYBOARD_LAYOUTS = [
    ['English', "en-US"],
    ['Japanese', "ja-JP_106/109"],
    ['German', "de-DE"],
    ['Italian', "it-IT"],
    ['Spanish', "es-ES"],
    ['Portuguese', "pt-PT"],
    ['French', "fr-FR"],
    ['Swiss‐French', "fr-CH"],
    ['Swiss‐German', "de-CH"]
  ].freeze

  # Helper method for retrieving vmware remote console options for a <select> field
  def vmware_remote_console_items(webmks)
    items = [[_("VNC"), "VNC"], [_("VMware VMRC Plugin"), "VMRC"]]
    # Add the item if the required assets are present or the webmks console is already selected
    items.unshift([_("VMware WebMKS"), "WebMKS"]) if webmks_assets_provided? || webmks
    items
  end

  def webmks_assets_provided?
    Rails.root.join('public', 'webmks').exist?
  end
end
