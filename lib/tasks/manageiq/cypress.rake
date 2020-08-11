# This check ensures that we only load this task under the `app:` prefix when
# in `manageiq-ui-classic`, and loads it normally under `manageiq`
#
# Without it, a few things happen:
#
#   - There is an error since there is no manageiq/integration file in the path
#   - If the above is addressed, it will load this task in two contexts when
#     loading from manageiq-ui-classic:
#     - cypress:ui:*
#     - app:cypress:ui:*
#
if Rails.root
  require "manageiq/integration"

  ManageIQ::Integration::CypressRakeTask.new(:ui)
end
