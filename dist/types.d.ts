export declare type YoutubeInfoThumbnail = {
    url: string;
    width: number;
    height: number;
};
export declare type YoutubeVideoDetails = {
    videoId: string;
    title: string;
    lengthSeconds: string;
    keywords: string[];
    channelId: string;
    isOwnerViewing: boolean;
    shortDescription: string;
    isCrawlable: boolean;
    thumbnail: {
        thumbnails: YoutubeInfoThumbnail[];
    };
    averageRating: number;
    allowRatings: boolean;
    viewCount: string;
    author: string;
    isPrivate: boolean;
    isUnpluggedCorpus: boolean;
    isLiveContent: boolean;
};
export declare type YoutubeFormatTimeRange = {
    start: string;
    end: string;
};
export declare type YoutubeFormatColorInfo = {
    primaries: string;
    transferCharacteristics: string;
    matrixCoefficients: string;
};
export declare type YoutubeFormat = {
    url: string;
    type: string;
    itag: number;
    quality: string;
    mimeType?: string;
    bitrate?: number;
    width?: number;
    height?: number;
    lastModified?: string;
    fps?: number;
    qualityLabel?: string;
    projectionType?: string;
    audioQuality?: string;
    approxDurationMs?: string;
    audioSampleRate?: string;
    audioChannels?: number;
    initRange?: YoutubeFormatTimeRange;
    indexRange?: YoutubeFormatTimeRange;
    contentLength?: string;
    averageBitrate?: number;
    colorInfo?: YoutubeFormatColorInfo;
    highReplication?: boolean;
    loudnessDb?: number;
};
export declare type YoutubeLiveDataSegment = {
    isMasterPlaylist: boolean;
    streamInf: {
        bandwidth: number;
        codecs: string[];
        resolution: number;
        frameRate: number;
        videoRange: string;
        subtitles: string;
        closedCaptions: string;
    };
    url: string;
};
export declare type YoutubeLiveDataSubtitles = Record<string, Record<string, {
    groupId: string;
    uri: string;
    type: string;
    language: string;
    name: string;
    default: boolean;
    autoselect: string;
}>>;
export declare type YoutubeLiveDataMedia = Record<string, YoutubeLiveDataSubtitles>;
export declare type YoutubeLiveData = {
    manifestUrl: string;
    data: {
        segments: YoutubeLiveDataSegment[];
        media: YoutubeLiveDataMedia;
    };
};
export declare type YoutubeInfo = {
    videoDetails: YoutubeVideoDetails;
    formats: YoutubeFormat[];
    liveData?: YoutubeLiveData;
};
