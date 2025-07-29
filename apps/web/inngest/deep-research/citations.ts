import { Finding, ReasoningStage } from "../deep-research";

export function formatCitationIEEE(finding: Finding, index: number): string {
  // Build author segment – fallback to site host when missing
  const authorPart = finding.author ?? new URL(finding.source).hostname;
  const titlePart = finding.title ?? "Untitled";
  const datePart = finding.publishedDate ? `${finding.publishedDate}.` : "";

  const faviconMarkdown = finding.favicon
    ? `![icon](${finding.favicon})`
    : "📄";

  const linkedTitle = `[${titlePart}](${finding.source})`;

  const citationText = `${authorPart}, ${linkedTitle}, ${datePart} [Online].`
    .replace(/\n/g, " ")
    .trim();

  const citationLine = `[${index}] ${faviconMarkdown} ${citationText}`.trim();

  return citationLine;
}

export function collectUniqueSources(stages: ReasoningStage[]): Finding[] {
  const seen = new Set<string>();
  const unique: Finding[] = [];

  for (const stage of stages) {
    if (!stage.reasoningTree) continue;
    for (const node of stage.reasoningTree.nodes) {
      for (const f of node.findings) {
        if (!seen.has(f.source)) {
          seen.add(f.source);
          unique.push(f);
        }
      }
    }
  }

  return unique;
}

export function assignCitationNumbers(
  findings: Finding[]
): Map<string, number> {
  const map = new Map<string, number>();
  findings.forEach((f, idx) => {
    map.set(f.source, idx + 1); // IEEE numbering starts at 1
  });
  return map;
}
