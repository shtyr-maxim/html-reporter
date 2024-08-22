import {State, BrowserEntity, ImageEntity, ResultEntity, SuiteEntity, SuiteState} from '@/static/new-ui/types/store';

export const getAllRootSuiteIds = (state: State): string[] => state.tree.suites.allRootIds;
export const getSuites = (state: State): Record<string, SuiteEntity> => state.tree.suites.byId;
export const getSuitesState = (state: State): Record<string, SuiteState> => state.tree.suites.stateById;
export const getBrowsers = (state: State): Record<string, BrowserEntity> => state.tree.browsers.byId;
export const getResults = (state: State): Record<string, ResultEntity> => state.tree.results.byId;
export const getImages = (state: State): Record<string, ImageEntity> => state.tree.images.byId;
