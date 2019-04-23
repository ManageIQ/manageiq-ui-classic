import taggingApp from './reducers';
import { TaggingConnected, TaggingWithButtonsConnected } from './containers/tagging';
import TagView from './components/InnerComponents/TagView';
import './sass/style.scss';


export { taggingApp, TaggingConnected, TaggingWithButtonsConnected, TagView };
export * from './components/Tagging/Tagging';
export * from './actions';
