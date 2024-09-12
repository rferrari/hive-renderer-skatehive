//import ow from 'ow';
import {Remarkable} from 'remarkable';
import {SecurityChecker} from '../../security/SecurityChecker';
import {HtmlDOMParser} from './embedder/HtmlDOMParser';
import {Localization, LocalizationOptions} from './Localization';
import {PreliminarySanitizer} from './sanitization/PreliminarySanitizer';
import {TagTransformingSanitizer} from './sanitization/TagTransformingSanitizer';

export class DefaultRenderer {
    private options: RendererOptions;
    private tagTransformingSanitizer: TagTransformingSanitizer;
    private domParser: HtmlDOMParser;

    public constructor(options: RendererOptions, localization: LocalizationOptions = Localization.DEFAULT) {
        this.validate(options);
        this.options = options;

        Localization.validate(localization);

        this.tagTransformingSanitizer = new TagTransformingSanitizer(
            {
                iframeWidth: this.options.assetsWidth,
                iframeHeight: this.options.assetsHeight,
                addNofollowToLinks: this.options.addNofollowToLinks,
                addTargetBlankToLinks: this.options.addTargetBlankToLinks,
                cssClassForInternalLinks: this.options.cssClassForInternalLinks,
                cssClassForExternalLinks: this.options.cssClassForExternalLinks,
                noImage: this.options.doNotShowImages,
                isLinkSafeFn: this.options.isLinkSafeFn,
                addExternalCssClassToMatchingLinksFn: this.options.addExternalCssClassToMatchingLinksFn
            },
            localization
        );

        this.domParser = new HtmlDOMParser(
            {
                width: this.options.assetsWidth,
                height: this.options.assetsHeight,
                ipfsPrefix: this.options.ipfsPrefix,
                baseUrl: this.options.baseUrl,
                imageProxyFn: this.options.imageProxyFn,
                hashtagUrlFn: this.options.hashtagUrlFn,
                usertagUrlFn: this.options.usertagUrlFn,
                hideImages: this.options.doNotShowImages
            },
            localization
        );
    }

public render(input: string): string {
    if (!input) {
        throw new Error('Input is required and cannot be empty');
    }
    return this.doRender(input);
}

    private doRender(text: string): string {
        text = PreliminarySanitizer.preliminarySanitize(text);

        const isHtml = this.isHtml(text);
        text = isHtml ? text : this.renderMarkdown(text);

        text = this.wrapRenderedTextWithHtmlIfNeeded(text);
        text = this.domParser.parse(text).getParsedDocumentAsString();
        text = this.sanitize(text);
        SecurityChecker.checkSecurity(text, {allowScriptTag: this.options.allowInsecureScriptTags});
        text = this.domParser.embedder.insertAssets(text);

        return text;
    }

    private renderMarkdown(text: string): string {
        const renderer = new Remarkable({
            html: true, // remarkable renders first then sanitize runs...
            breaks: this.options.breaks,
            typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
            quotes: '“”‘’'
        });
        return renderer.render(text);
    }

    private wrapRenderedTextWithHtmlIfNeeded(renderedText: string): string {
        // If content isn't wrapped with an html element at this point, add it.
        if (renderedText.indexOf('<html>') !== 0) {
            renderedText = '<html>' + renderedText + '</html>';
        }
        return renderedText;
    }

    private isHtml(text: string): boolean {
        let html = false;
        // See also ReplyEditor isHtmlTest
        const m = text.match(/^<html>([\S\s]*)<\/html>$/);
        if (m && m.length === 2) {
            html = true;
            text = m[1];
        } else {
            // See also ReplyEditor isHtmlTest
            html = /^<p>[\S\s]*<\/p>/.test(text);
        }
        return html;
    }

    private sanitize(text: string): string {
        if (this.options.skipSanitization) {
            return text;
        }

        return this.tagTransformingSanitizer.sanitize(text);
    }

    private isValidObject(obj: unknown): obj is Record<string, unknown> {
        if (typeof obj !== 'object') return false;
        if (obj === null) return false;

        return true;
    }

    private isValidString(str: unknown): str is string {
        return typeof str === 'string' && str !== '';
    }

    private validate(options: RendererOptions): boolean {
        if (!this.isValidObject(options)) return false;

        if (!this.isValidString(options.baseUrl)) return false;
        if (options.breaks !== undefined && typeof options.breaks !== 'boolean') return false;
        if (options.skipSanitization !== undefined && typeof options.skipSanitization !== 'boolean') return false;
        if (options.addNofollowToLinks !== undefined && typeof options.addNofollowToLinks !== 'boolean') return false;
        if (options.addTargetBlankToLinks !== undefined && typeof options.addTargetBlankToLinks === 'boolean') return false;
        if (options.cssClassForInternalLinks !== undefined && (typeof options.cssClassForInternalLinks !== 'string')) return false;
        if (options.cssClassForExternalLinks !== undefined && (typeof options.cssClassForExternalLinks !== 'string')) return false;
        if (options.doNotShowImages !== undefined && typeof options.doNotShowImages !== 'boolean') return false;
        if (options.ipfsPrefix !== undefined && typeof options.ipfsPrefix !== 'string') return false;
        if (options.assetsWidth !== undefined && typeof options.assetsWidth !== 'number' || options.assetsWidth <= 0) return false;
        if (options.assetsHeight !== undefined && typeof options.assetsHeight !== 'number' || options.assetsHeight <= 0) return false;
        if (options.imageProxyFn !== undefined && typeof options.imageProxyFn !== 'function') return false;
        if (options.hashtagUrlFn !== undefined && typeof options.hashtagUrlFn !== 'function') return false;
        if (options.usertagUrlFn !== undefined && typeof options.usertagUrlFn !== 'function') return false;
        if (options.isLinkSafeFn !== undefined && typeof options.isLinkSafeFn !== 'function') return false;
        if (options.addExternalCssClassToMatchingLinksFn !== undefined && typeof options.addExternalCssClassToMatchingLinksFn !== 'function') return false;

        return true;
    }
}

export interface RendererOptions {
    baseUrl: string;
    breaks: boolean;
    skipSanitization: boolean;
    allowInsecureScriptTags: boolean;
    addNofollowToLinks: boolean;
    addTargetBlankToLinks?: boolean;
    cssClassForInternalLinks?: string;
    cssClassForExternalLinks?: string;
    doNotShowImages: boolean;
    ipfsPrefix?: string;
    assetsWidth: number;
    assetsHeight: number;
    imageProxyFn: (url: string) => string;
    hashtagUrlFn: (hashtag: string) => string;
    usertagUrlFn: (account: string) => string;
    isLinkSafeFn: (url: string) => boolean;
    addExternalCssClassToMatchingLinksFn: (url: string) => boolean;
}
