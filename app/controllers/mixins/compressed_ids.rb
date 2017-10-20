module CompressedIds
  CID_OR_ID_MATCHER = ApplicationRecord::CID_OR_ID_MATCHER
  #
  # Methods to convert record id (id, fixnum, 12000000000056) to/from compressed id (cid, string, "12r56")
  #   for use in UI controls (i.e. tree node ids, pulldown list items, etc)
  #
end
