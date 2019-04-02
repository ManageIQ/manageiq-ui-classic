describe HidePartialHelper do
  it 'returns true if action should not have partial' do
    expect(hide_x_edit_buttons('foo')).to be false
    expect(hide_x_edit_buttons('snap_vm')).to be true
  end
end
