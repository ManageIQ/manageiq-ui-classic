The dialog editor hierarchy:

%dialog-editor
  %dialog-editor-tabs
  %dialog-editor-boxes (in current tab)
  %dialog-editor-modal - modal for editing properties of field/tab/box
    | %dialog-editor-modal-field
        %dialog-editor-modal-field-template - per field type
    | %dialog-editor-modal-tab
    | %dialog-editor-modal-box

