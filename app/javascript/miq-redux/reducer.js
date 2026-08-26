import { combineReducers } from '@reduxjs/toolkit';

/**
 * Root reducer factory.
 * @param {Object} asyncReducers - object of dynamically injected reducers
 */
export default (asyncReducers = {}) => combineReducers(asyncReducers);
