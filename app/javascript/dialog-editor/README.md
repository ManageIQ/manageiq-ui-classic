The dialog editor hierarchy:

%dialog-editor - root of the hierarchy
  %dialog-editor-modal - (by default hidden) modal for editing properties of $type..
    | %dialog-editor-modal-field - edit field properties, common + per field
        %dialog-editor-modal-field-template - per field type
          %dialog-editor-tree-selector - method selector for dynamic fields
          %dialog-editor-validation - regex validation on & off, for text-box & text-area-box
          %dialog-editor-modal-field-template - also nested within itself for shared partials (fields-to-refresh, dynamic-values)

    | %dialog-editor-modal-tab - edit tab properties
    | %dialog-editor-modal-box - edit box properties

  %dialog-editor-toolbox - toolbox to drag items from

  %dialog-editor-tabs - tab switcher

  %dialog-editor-boxes - boxes in current tab
    %dialog-editor-field - each field in the box


Components:

dialog-editor
dialog-editor-boxes
dialog-editor-field
dialog-editor-toolbox
dialog-editor-modal
dialog-editor-modal-box
dialog-editor-modal-field
dialog-editor-modal-field-template
dialog-editor-modal-tab
dialog-editor-tabs
dialog-editor-tree-selector
dialog-editor-validation


Services:

DialogEditor
DialogValidation
