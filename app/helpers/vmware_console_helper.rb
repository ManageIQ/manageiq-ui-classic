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

  def webmks_assets_provided?
    Rails.root.join('public', 'webmks').exist?
  end
end
