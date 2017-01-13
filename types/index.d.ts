export interface ElementCompact {
    [key: string]: any
    _attributes?: {
        [key: string]: string | number
    }
    _cdata?: string
    _comment?: string
    _declaration?: {
        _attributes?: {
            version?: string | number
            encoding?: string | number
        }
    }
    _text?: string | number
}

export interface Element {
    attributes?: {
        [key: string]: string | number
    }
    cdata?: string
    comment?: string
    declaration?: {
        attributes?: {
            version: string | number
            encoding: string | number
        }
    }
    text?: string | number | boolean
    type?: string
    name?: string
    elements?: Array<Element>
}

declare namespace Options {
    interface XML2JS extends ChangingKeyNames, IgnoreOptions {
        compact?: boolean
        spaces?: number | string
        trim?: boolean
        sanitize?: boolean
        nativeType?: boolean
        addParent?: boolean
        alwaysChildren?: boolean
    }

    interface JS2XML extends ChangingKeyNames, IgnoreOptions {
        spaces?: number | string
        compact?: boolean
        fullTagEmptyElement?: boolean
    }

    interface IgnoreOptions {
        ignoreDeclaration?: boolean
        ignoreAttributes?: boolean
        ignoreComment?: boolean
        ignoreCdata?: boolean
        ignoreText?: boolean
    }

    interface ChangingKeyNames {
        declarationKey?: string
        attributesKey?: string
        textKey?: string
        cdataKey?: string
        commentKey?: string
        parentKey?: string
        typeKey?: string
        nameKey?: string
        elementsKey?: string
    }
}

export function js2xml(obj: Element | ElementCompact, options?: Options.JS2XML): string;
export function json2xml(json: string, options?: Options.JS2XML): string;
export function xml2json(xml: string, options?: Options.XML2JS): string;
export function xml2js(xml: string, options?: Options.XML2JS): any;