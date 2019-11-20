const getTargetByType = type => (type === 'new_window' ? '_blank' : '_self');

export default getTargetByType;
