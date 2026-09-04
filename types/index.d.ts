export interface Attributes {
  [key: string]: string | number | undefined;
}

export interface DeclarationAttributes {
  version?: string | number;
  encoding?: 'utf-8' | string;
  standalone?: 'yes' | 'no';
}

export interface ElementCompact {
  [key: string]: any;
  _declaration?: {
    _attributes?: DeclarationAttributes;
  };
  _instruction?: {
    [key: string]: string;
  };
  _attributes?: Attributes;
  _cdata?: string;
  _doctype?: string;
  _comment?: string;
  _text?: string | number;
}

export interface Position {
  column?: number;
  line?: number;
  startTagPosition?: number;
}

export interface Positions {
  start?: Position;
  end?: Position;
}

export type Element<K extends string = 'elements'> = {
  declaration?: {
    attributes?: DeclarationAttributes;
  };
  instruction?: string;
  attributes?: Attributes;
  cdata?: string;
  doctype?: string;
  comment?: string;
  text?: string | number | boolean;
  type?: string;
  name?: string;
  position?: Positions;
} & Partial<Record<K, Array<Element<K>>>>;

declare namespace Options {
  interface XML2JSON<K extends string> extends XML2JS<K> {
    spaces?: number | string;
  }

  interface XML2JS<K extends string>
    extends ChangingKeyNames<K>, IgnoreOptions {
    compact?: boolean;
    trim?: boolean;
    sanitize?: boolean;
    nativeType?: boolean;
    addParent?: boolean;
    alwaysArray?: boolean | Array<string>;
    alwaysChildren?: boolean;
    instructionHasAttributes?: boolean;
    captureSpacesBetweenElements?: boolean;
    doctypeFn?: (value: string, parentElement: object) => void;
    instructionFn?: (
      instructionValue: string,
      instructionName: string,
      parentElement: string
    ) => void;
    cdataFn?: (value: string, parentElement: object) => void;
    commentFn?: (value: string, parentElement: object) => void;
    textFn?: (value: string, parentElement: object) => void;
    instructionNameFn?: (
      instructionName: string,
      instructionValue: string,
      parentElement: string
    ) => void;
    elementNameFn?: (value: string, parentElement: object) => void;
    attributeNameFn?: (
      attributeName: string,
      attributeValue: string,
      parentElement: string
    ) => void;
    attributeValueFn?: (
      attributeValue: string,
      attributeName: string,
      parentElement: string
    ) => void;
    attributesFn?: (value: string, parentElement: string) => void;
  }

  interface JS2XML extends ChangingKeyNames, IgnoreOptions {
    spaces?: number | string;
    compact?: boolean;
    indentText?: boolean;
    indentCdata?: boolean;
    indentAttributes?: boolean;
    indentInstruction?: boolean;
    fullTagEmptyElement?: boolean;
    noQuotesForNativeAttributes?: boolean;
    doctypeFn?: (
      value: string,
      currentElementName: string,
      currentElementObj: object
    ) => void;
    instructionFn?: (
      instructionValue: string,
      instructionName: string,
      currentElementName: string,
      currentElementObj: object
    ) => void;
    cdataFn?: (
      value: string,
      currentElementName: string,
      currentElementObj: object
    ) => void;
    commentFn?: (
      value: string,
      currentElementName: string,
      currentElementObj: object
    ) => void;
    textFn?: (
      value: string,
      currentElementName: string,
      currentElementObj: object
    ) => void;
    instructionNameFn?: (
      instructionName: string,
      instructionValue: string,
      currentElementName: string,
      currentElementObj: object
    ) => void;
    elementNameFn?: (
      value: string,
      currentElementName: string,
      currentElementObj: object
    ) => void;
    attributeNameFn?: (
      attributeName: string,
      attributeValue: string,
      currentElementName: string,
      currentElementObj: object
    ) => void;
    attributeValueFn?: (
      attributeValue: string,
      attributeName: string,
      currentElementName: string,
      currentElementObj: object
    ) => void;
    attributesFn?: (
      value: string,
      currentElementName: string,
      currentElementObj: object
    ) => void;
    fullTagEmptyElementFn?: (
      currentElementName: string,
      currentElementObj: object
    ) => void;
  }

  interface IgnoreOptions {
    ignoreDeclaration?: boolean;
    ignoreInstruction?: boolean;
    ignoreAttributes?: boolean;
    ignoreComment?: boolean;
    ignoreCdata?: boolean;
    ignoreDoctype?: boolean;
    ignoreText?: boolean;
  }

  interface ChangingKeyNames<K extends string = 'elements'> {
    declarationKey?: string;
    instructionKey?: string;
    attributesKey?: string;
    textKey?: string;
    cdataKey?: string;
    doctypeKey?: string;
    commentKey?: string;
    parentKey?: string;
    typeKey?: string;
    nameKey?: string;
    elementsKey?: K;
  }
}

export function js2xml(
  obj: Element | ElementCompact,
  options?: Options.JS2XML
): string;
export function json2xml(json: string, options?: Options.JS2XML): string;
export function xml2json<K extends string = 'elements'>(
  xml: string,
  options?: Options.XML2JSON<K>
): string;
export function xml2js<
  K extends string = 'elements',
  O extends Options.XML2JS<K> = Options.XML2JS<K>,
>(
  xml: string,
  options?: O
): O extends { compact: true } ? ElementCompact : Element<K>;
