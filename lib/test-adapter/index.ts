import {TestStatus} from '../constants';
import {AssertViewResult, ErrorDetails, ImageBase64, ImageInfoFull, TestError} from '../types';

export * from './hermione';

export interface ReporterTestResult {
    readonly assertViewResults: AssertViewResult[];
    attempt: number;
    readonly browserId: string;
    readonly description: string | undefined;
    error: undefined | TestError;
    readonly errorDetails: ErrorDetails | null;
    readonly file: string;
    readonly fullName: string;
    readonly history: string[];
    readonly id: string;
    image?: boolean;
    readonly imageDir: string;
    readonly imagesInfo: ImageInfoFull[] | undefined;
    readonly isUpdated?: boolean;
    readonly meta: Record<string, unknown>;
    readonly multipleTabs: boolean;
    readonly screenshot: ImageBase64 | undefined;
    readonly sessionId: string;
    readonly skipReason?: string;
    readonly state: { name: string };
    readonly status: TestStatus;
    readonly testPath: string[];
    readonly timestamp: number | undefined;
    readonly url?: string;
}
