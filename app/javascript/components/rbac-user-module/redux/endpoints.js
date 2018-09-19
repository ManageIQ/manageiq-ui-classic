export const getUsersUrl = '/api/users?expand=resources&attributes=current_group,miq_groups,current_group.miq_user_role,tags&sort_by=name';
export const modifyUserUrl = userId => `/api/users${userId ? `/${userId}` : ''}`;
export const updateMiqUserTreeUrl = '/tree/ops_rbac?id=xx-u';
export const getUserGroupsUrl = '/api/groups?expand=resources';
export const getTagCategoriesUrl = '/ops/load_tags_categories';
export const getUserCustomButtons = userId => `http://localhost:3000/api/users/${userId}/custom_button_events?expand=resources&attributes=message,created_on,username,automate_entry_point,button_name`;