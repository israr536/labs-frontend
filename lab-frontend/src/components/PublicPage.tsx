type Props = { page: 'pricing' | 'privacy' | 'about' };

const content = {
  pricing: {
    title: 'Pricing for laboratory reporting software',
    text: 'Compare PathMLT plans for patient management, test configuration, result verification, report generation, and laboratory workflow operations.',
  },
  privacy: {
    title: 'PathMLT privacy and information responsibility',
    text: 'Review how PathMLT approaches account, laboratory, workflow, and patient information while your laboratory remains responsible for its policies and legal obligations.',
  },
  about: {
    title: 'About PathMLT laboratory software',
    text: 'PathMLT connects patient records, tests, results, verification, and professional laboratory reports in one workspace for diagnostic and pathology teams.',
  },
} as const;

export default function PublicPage({ page }: Props) {
  const item = content[page];
  return <div className="public-page"><h1>{item.title}</h1><p>{item.text}</p></div>;
}
