import actionNames from '@/static/modules/action-names';
import {Action} from '@/static/modules/actions/types';

export type SuitesPageSetCurrentSuiteAction = Action<typeof actionNames.SUITES_PAGE_SET_CURRENT_SUITE, {
    suiteId: string;
}>;

export const suitesPageSetCurrentSuite = (suiteId: string): SuitesPageSetCurrentSuiteAction => {
    return {type: actionNames.SUITES_PAGE_SET_CURRENT_SUITE, payload: {suiteId}};
};

type SetSectionExpandedStateAction = Action<typeof actionNames.SUITES_PAGE_SET_SECTION_EXPANDED, {
    sectionId: string;
    isExpanded: boolean;
}>;

export const setSectionExpandedState = (payload: SetSectionExpandedStateAction['payload']): SetSectionExpandedStateAction =>
    ({type: actionNames.SUITES_PAGE_SET_SECTION_EXPANDED, payload});

export type SuitesPageAction =
    | SuitesPageSetCurrentSuiteAction
    | SetSectionExpandedStateAction;
