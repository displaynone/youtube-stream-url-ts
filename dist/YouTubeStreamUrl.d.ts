import { YoutubeInfo } from './types';
export declare const getInfo: ({ url, throwOnError }: {
    url: any;
    throwOnError?: boolean;
}) => Promise<false | YoutubeInfo>;
export declare const getVideoId: ({ url }: {
    url: any;
}) => any;
