/**
 * @file Streaming markdown parser
 *
 * @description
 * Streaming markdown parser for real-time content processing.
 * Parses markdown content incrementally as it arrives from LLM responses,
 * emitting parse events for progressive UI rendering.
 *
 * @example
 * ```ts
 * import { createStreamingMarkdownParser } from "react-editor-ui/parsers/Markdown";
 *
 * const parser = createStreamingMarkdownParser();
 * for await (const event of parser.processStream(stream)) {
 *   console.log(event);
 * }
 * ```
 */

export { createStreamingMarkdownParser } from "./streaming-parser";
export type {
  MarkdownElementType,
  MarkdownElementMetadata,
  MarkdownParseEvent,
  BeginEvent,
  DeltaEvent,
  EndEvent,
  AnnotationEvent,
  LinkAnnotation,
  CustomAnnotation,
  MarkdownParserConfig,
  MarkdownElementMatcher,
  MarkdownParserPlugin,
  DetectedElement,
} from "./types";
export { parseTable, type ParsedTable } from "./table-detector";
