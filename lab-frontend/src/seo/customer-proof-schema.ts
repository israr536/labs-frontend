export type CustomerProofApproval = {
  approved: true;
  consentReference: string;
  approvedAt: string;
  approvedBy: string;
};

export type CaseStudyRecord = {
  slug: string;
  url: string;
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  customerName?: string;
  customerType: string;
  authorName: string;
  authorUrl?: string;
  approval: CustomerProofApproval;
};

export type CustomerReviewRecord = {
  id: string;
  body: string;
  authorName: string;
  authorJobTitle?: string;
  authorOrganization?: string;
  datePublished: string;
  itemReviewedName: string;
  itemReviewedUrl: string;
  approval: CustomerProofApproval;
};

type JsonLdNode = Record<string, unknown>;

function requireApproval(record: { approval: CustomerProofApproval }, kind: string) {
  if (!record.approval?.approved || !record.approval.consentReference || !record.approval.approvedAt || !record.approval.approvedBy) {
    throw new Error(`${kind} cannot be published without explicit approval, consent reference, approver, and approval date.`);
  }
}

export function buildCaseStudySchema(story: CaseStudyRecord, siteName: string, siteUrl: string): JsonLdNode {
  requireApproval(story, 'Case study');
  const url = story.url.startsWith('http') ? story.url : `${siteUrl}${story.url}`;
  const node: JsonLdNode = {
    '@type': 'Article',
    '@id': `${url}#case-study`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: story.headline,
    description: story.description,
    datePublished: story.datePublished,
    dateModified: story.dateModified || story.datePublished,
    author: {
      '@type': 'Person',
      name: story.authorName,
      ...(story.authorUrl ? { url: story.authorUrl } : {}),
    },
    publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
    about: {
      '@type': 'SoftwareApplication',
      name: siteName,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
    },
    articleSection: 'Customer case study',
    keywords: [story.customerType, 'laboratory software', 'laboratory workflow'],
  };
  if (story.image) node.image = story.image.startsWith('http') ? story.image : `${siteUrl}${story.image}`;
  if (story.customerName) node.audience = { '@type': 'Organization', name: story.customerName };
  return node;
}

export function buildCustomerReviewSchema(review: CustomerReviewRecord, siteName: string, siteUrl: string): JsonLdNode {
  requireApproval(review, 'Customer review');
  return {
    '@type': 'Review',
    '@id': `${siteUrl}/customer-reviews/${encodeURIComponent(review.id)}#review`,
    reviewBody: review.body,
    datePublished: review.datePublished,
    author: {
      '@type': 'Person',
      name: review.authorName,
      ...(review.authorJobTitle ? { jobTitle: review.authorJobTitle } : {}),
      ...(review.authorOrganization ? { worksFor: { '@type': 'Organization', name: review.authorOrganization } } : {}),
    },
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: review.itemReviewedName || siteName,
      url: review.itemReviewedUrl.startsWith('http') ? review.itemReviewedUrl : `${siteUrl}${review.itemReviewedUrl}`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
    },
  };
}

export function buildCustomerProofGraph(
  records: { caseStudies?: CaseStudyRecord[]; reviews?: CustomerReviewRecord[] },
  siteName: string,
  siteUrl: string,
  pathname: string,
): JsonLdNode[] {
  const graph: JsonLdNode[] = [];
  for (const story of records.caseStudies ?? []) {
    if (story.url === pathname || story.url === `${siteUrl}${pathname}`) graph.push(buildCaseStudySchema(story, siteName, siteUrl));
  }
  for (const review of records.reviews ?? []) {
    if (review.itemReviewedUrl === pathname || review.itemReviewedUrl === `${siteUrl}${pathname}`) graph.push(buildCustomerReviewSchema(review, siteName, siteUrl));
  }
  return graph;
}
