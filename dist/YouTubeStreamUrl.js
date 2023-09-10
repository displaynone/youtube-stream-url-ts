"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoId = exports.getInfo = void 0;
const axios_1 = require("axios");
const m3u8_file_parser_1 = require("m3u8-file-parser");
const m3u8Parser = new m3u8_file_parser_1.default();
const getRemoteFile = async (url) => {
    try {
        const { data } = await axios_1.default.get(url);
        return data;
    }
    catch (e) {
        return null;
    }
};
const resolvePlayerResponse = (watchHtml) => {
    if (!watchHtml) {
        return '';
    }
    const matches = watchHtml.match(/ytInitialPlayerResponse = (.*)}}};/);
    return matches ? matches[1] + '}}}' : '';
};
const resoleM3U8Link = (watchHtml) => {
    if (!watchHtml) {
        return null;
    }
    const matches = watchHtml.match(/hlsManifestUrl":"(.*\/file\/index\.m3u8)/);
    return matches ? matches[1] : null;
};
const buildDecoder = async (watchHtml) => {
    if (!watchHtml) {
        return null;
    }
    const jsFileUrlMatches = watchHtml.match(/\/s\/player\/[A-Za-z0-9]+\/[A-Za-z0-9_.]+\/[A-Za-z0-9_]+\/base\.js/);
    if (!jsFileUrlMatches) {
        return null;
    }
    const jsFileContent = await getRemoteFile(`https://www.youtube.com${jsFileUrlMatches[0]}`);
    const decodeFunctionMatches = jsFileContent.match(/function.*\.split\(\"\"\).*\.join\(\"\"\)}/);
    if (!decodeFunctionMatches) {
        return null;
    }
    const decodeFunction = decodeFunctionMatches[0];
    const varNameMatches = decodeFunction.match(/\.split\(\"\"\);([a-zA-Z0-9]+)\./);
    if (!varNameMatches) {
        return null;
    }
    const varDeclaresMatches = jsFileContent.match(new RegExp(`(var ${varNameMatches[1]}={[\\s\\S]+}};)[a-zA-Z0-9]+\\.[a-zA-Z0-9]+\\.prototype`));
    if (!varDeclaresMatches) {
        return null;
    }
    return function (signatureCipher) {
        const params = new URLSearchParams(signatureCipher);
        const signature = params.get('s');
        const signatureParam = params.get('sp') || 'signature';
        const url = params.get('url');
        const decodedSignature = new Function(`
            "use strict";
            ${varDeclaresMatches[1]}
            return (${decodeFunction})("${signature}");
        `)();
        return `${url}&${signatureParam}=${encodeURIComponent(decodedSignature)}`;
    };
};
const getInfo = async ({ url, throwOnError = false }) => {
    const videoId = (0, exports.getVideoId)({ url });
    console.log({ videoId });
    if (!videoId)
        return false;
    const ytApi = 'https://www.youtube.com/watch';
    try {
        const response = await axios_1.default.get(ytApi, {
            params: { v: videoId },
        });
        if (!response || response.status != 200 || !response.data) {
            const error = new Error('Cannot get youtube video response: ' + JSON.stringify(response));
            throw error;
        }
        const ytInitialPlayerResponse = resolvePlayerResponse(response.data);
        const parsedResponse = JSON.parse(ytInitialPlayerResponse);
        const streamingData = parsedResponse.streamingData || {};
        let formats = (streamingData.formats || []).concat(streamingData.adaptiveFormats || []);
        const isEncryptedVideo = !!formats.find((it) => !!it.signatureCipher);
        if (isEncryptedVideo) {
            const decoder = await buildDecoder(response.data);
            if (decoder) {
                formats = formats.map((it) => {
                    if (it.url || !it.signatureCipher) {
                        return it;
                    }
                    it.url = decoder(it.signatureCipher);
                    delete it.signatureCipher;
                    return it;
                });
            }
        }
        const result = {
            videoDetails: parsedResponse.videoDetails || {},
            formats: formats.filter((format) => format.url),
        };
        if (result.videoDetails.isLiveContent) {
            try {
                const m3u8Link = resoleM3U8Link(response.data);
                if (m3u8Link) {
                    const m3u8FileContent = await getRemoteFile(m3u8Link);
                    m3u8Parser.read(m3u8FileContent);
                    result.liveData = {
                        manifestUrl: m3u8Link,
                        data: m3u8Parser.getResult(),
                    };
                    m3u8Parser.reset();
                }
            }
            catch (e) {
                if (throwOnError) {
                    throw e;
                }
            }
        }
        return result;
    }
    catch (e) {
        if (throwOnError) {
            throw e;
        }
        return false;
    }
};
exports.getInfo = getInfo;
const getVideoId = ({ url }) => {
    const opts = { fuzzy: true };
    if (/youtu\.?be/.test(url)) {
        // Look first for known patterns
        const patterns = [
            /youtu\.be\/([^#\&\?]{11})/,
            /\?v=([^#\&\?]{11})/,
            /\&v=([^#\&\?]{11})/,
            /embed\/([^#\&\?]{11})/,
            /\/v\/([^#\&\?]{11})/, // /v/<id>
        ];
        // If any pattern matches, return the ID
        for (let i = 0; i < patterns.length; ++i) {
            if (patterns[i].test(url)) {
                return patterns[i].exec(url)[1];
            }
        }
        if (opts.fuzzy) {
            // If that fails, break it apart by certain characters and look
            // for the 11 character key
            const tokens = url.split(/[\/\&\?=#\.\s]/g);
            for (let i = 0; i < tokens.length; ++i) {
                if (/^[^#\&\?]{11}$/.test(tokens[i])) {
                    return tokens[i];
                }
            }
        }
    }
    return null;
};
exports.getVideoId = getVideoId;
//# sourceMappingURL=YouTubeStreamUrl.js.map