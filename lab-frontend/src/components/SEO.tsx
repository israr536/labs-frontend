import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { faqItems } from '../data/faqData';

const SITE_URL = 'https://www.pathmlt.com';
const SITE_NAME = 'PathMLT';
const OG_IMAGE = `${SITE_URL}/og-image.svg`;

type SeoConfig = { title: string; description: string; canonical: string; index: boolean };

const pages: Record<string, SeoConfig> = {
'/':{title:'Laboratory Reporting Software for Diagnostic Labs | PathMLT',description:'PathMLT is laboratory reporting software for diagnostic and pathology labs. Connect patients, orders, tests, samples, results, verification and professional reports in one workflow.',canonical:'/',index:true},
'/solutions':{title:'Diagnostic Lab Software Solutions | LIMS, Reporting & Workflow | PathMLT',description:'Explore PathMLT solutions for laboratory reporting, patient management, test configuration, sample workflows, result verification, PDF reports and audit history.',canonical:'/solutions',index:true},
'/pricing':{title:'Laboratory Management Software Pricing | PathMLT',description:'Explore PathMLT pricing for diagnostic laboratories and choose a reporting workspace that can grow with your patients, tests, reports and team.',canonical:'/pricing',index:true},
'/faqs':{title:'Laboratory Reporting Software FAQs | PathMLT',description:'Answers about PathMLT laboratory reporting software, implementation, report templates, PDF reports, access controls, workflows and product capabilities.',canonical:'/faqs',index:true},
'/faq':{title:'Laboratory Software FAQs | PathMLT',description:'Answers about PathMLT laboratory reporting, implementation, report templates, PDF reports and workflow controls.',canonical:'/faqs',index:false},
'/about':{title:'About PathMLT | Laboratory Reporting & Management Software',description:'Learn how PathMLT connects the everyday workflow of diagnostic and pathology laboratories from patient registration through verified final reporting.',canonical:'/about',index:true},
'/contact':{title:'Contact PathMLT | Book a Diagnostic Lab Software Demo',description:'Talk with the PathMLT team about laboratory reporting software, diagnostic lab workflows, implementation and a product walkthrough.',canonical:'/contact',index:true},
'/help':{title:'PathMLT Help Center | Laboratory Reporting Software',description:'Find practical guidance for using PathMLT laboratory reporting software and managing your laboratory workspace.',canonical:'/help',index:true},
'/privacy':{title:'Privacy Policy | PathMLT',description:'Read the PathMLT privacy policy and information about data handling.',canonical:'/privacy',index:false},
'/terms':{title:'Terms and Conditions | PathMLT',description:'Read the PathMLT terms and conditions for use of the platform.',canonical:'/terms',index:false},
'/login':{title:'Sign In to Your Laboratory Workspace | PathMLT',description:'Securely sign in to your PathMLT laboratory workspace.',canonical:'/login',index:false},
'/signup':{title:'Create a Laboratory Workspace | PathMLT',description:'Create your PathMLT workspace for diagnostic laboratory reporting and operations.',canonical:'/signup',index:false},
'/forgot-password':{title:'Reset Your PathMLT Password',description:'Recover access to your PathMLT laboratory workspace.',canonical:'/forgot-password',index:false},
'/dashboard':{title:'Laboratory Dashboard | PathMLT',description:'Manage your PathMLT laboratory workspace.',canonical:'/dashboard',index:false},
'/report-templates':{title:'Laboratory Report Templates | PathMLT',description:'Configure laboratory report templates inside your PathMLT workspace.',canonical:'/report-templates',index:false}
};

const seoPages: Record<string, Omit<SeoConfig,'canonical'|'index'>> = {
'/laboratory-reporting-software':{title:'Laboratory Reporting Software for Diagnostic Labs | PathMLT',description:'Build a reliable lab reporting workflow from patient registration and testing to result verification and professional PDF reports.'},
'/diagnostic-lab-software':{title:'Diagnostic Lab Software for Modern Laboratory Operations | PathMLT',description:'Connect patients, orders, tests, samples, results and reports in one diagnostic laboratory software workflow.'},
'/pathology-lab-software':{title:'Pathology Lab Software for Reporting & Result Workflows | PathMLT',description:'Organize pathology laboratory workflows with configurable tests, result review, report templates, verification and audit history.'},
'/laboratory-management-software':{title:'Laboratory Management Software for Diagnostic Labs | PathMLT',description:'Manage laboratory operations, teams, patients, testing, reports and workflow controls from one connected workspace.'},
'/lab-reporting-system':{title:'Lab Reporting System for Verified Results | PathMLT',description:'Move structured laboratory results through validation, review and final report generation with a repeatable reporting workflow.'},
'/pathology-reporting-software':{title:'Pathology Reporting Software for Consistent Reports | PathMLT',description:'Create consistent pathology and diagnostic reports with configurable parameters, reference information, review and PDF output.'},
'/lims-software':{title:'LIMS Software for Laboratory Reporting Workflows | PathMLT',description:'Connect patient, testing, sample, result and reporting workflows with a focused laboratory information system experience.'},
'/lab-automation-software':{title:'Laboratory Automation Software for Reporting Workflows | PathMLT',description:'Reduce repetitive laboratory reporting handoffs with configurable workflows, result checks, verification and report generation.'},
'/patient-management':{title:'Patient Management Software for Diagnostic Laboratories | PathMLT',description:'Keep patient records, laboratory orders and reports connected with searchable, role-aware patient management.'},
'/test-management':{title:'Laboratory Test Management & Test Catalog Software | PathMLT',description:'Configure laboratory tests, parameters, specimen types, departments and reference information in one test catalog.'},
'/sample-management':{title:'Laboratory Sample Management Software | PathMLT',description:'Track samples through patient orders and testing workflows so laboratory teams can see what needs processing and what comes next.'},
'/result-entry':{title:'Laboratory Result Entry Software | PathMLT',description:'Enter structured qualitative and quantitative laboratory results against configured parameters with validation and reference information.'},
'/result-verification':{title:'Laboratory Result Verification Software | PathMLT',description:'Review laboratory values, flags and required results before reports are finalized and released.'},
'/lab-reporting':{title:'Laboratory Reporting Software from Verified Results | PathMLT',description:'Turn verified laboratory results into consistent, professional patient reports without rebuilding documents manually.'},
'/reference-ranges':{title:'Laboratory Reference Range Management | PathMLT',description:'Configure parameter-level reference information and keep reporting context consistent with your laboratory workflow.'},
'/audit-trail':{title:'Laboratory Audit Trail & Workflow History | PathMLT',description:'Keep important laboratory workflow events, actors and approvals traceable with an operational audit history.'},
'/role-based-access':{title:'Role-Based Access for Laboratory Teams | PathMLT',description:'Give laboratory teams controlled access to the workflows and responsibilities relevant to their roles.'},
'/pdf-reports':{title:'PDF Lab Report Software for Diagnostic Laboratories | PathMLT',description:'Generate professional PDF laboratory reports from finalized results using consistent report data and presentation.'},
'/pathology-labs':{title:'Laboratory Software for Pathology Labs | PathMLT',description:'Connect pathology laboratory teams around patients, tests, results, verification and controlled report delivery.'},
'/diagnostic-labs':{title:'Software for Diagnostic Laboratories | PathMLT',description:'Standardize day-to-day diagnostic laboratory operations from patient registration to verified report delivery.'},
'/hospital-labs':{title:'Laboratory Workflow Software for Hospital Labs | PathMLT',description:'Organize hospital laboratory testing and reporting around patients, orders, results, team roles and final reports.'},
'/independent-labs':{title:'Software for Independent Diagnostic Laboratories | PathMLT',description:'Give independent diagnostic laboratories a practical workspace for patients, testing, reporting and operational controls.'}
};

function configForPath(pathname:string):SeoConfig {
  if (pages[pathname]) return pages[pathname];
  if (seoPages[pathname]) return {...seoPages[pathname],canonical:pathname,index:true};
  return {title:`${SITE_NAME} | Laboratory Reporting Software`,description:'PathMLT connects diagnostic laboratory workflows for patients, tests, results, verification and reporting.',canonical:'/',index:false};
}
function upsertMeta(name:string,content:string){let e=document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);if(!e){e=document.createElement('meta');e.name=name;document.head.appendChild(e);}e.content=content;}
function upsertProperty(property:string,content:string){let e=document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);if(!e){e=document.createElement('meta');e.setAttribute('property',property);document.head.appendChild(e);}e.content=content;}
function upsertCanonical(href:string){let e=document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');if(!e){e=document.createElement('link');e.rel='canonical';document.head.appendChild(e);}e.href=href;}
function upsertJsonLd(data:object){const id='pathmlt-structured-data';let e=document.head.querySelector<HTMLScriptElement>(`script#${id}`);if(!e){e=document.createElement('script');e.id=id;e.type='application/ld+json';document.head.appendChild(e);}e.textContent=JSON.stringify(data);}

export default function SEO(){
  const {pathname}=useLocation();
  useEffect(()=>{
    const config=configForPath(pathname);
    const canonicalUrl=`${SITE_URL}${config.canonical}`;
    document.title=config.title;
    upsertMeta('description',config.description);
    upsertMeta('robots',config.index?'index, follow':'noindex, nofollow');
    upsertMeta('googlebot',config.index?'index, follow':'noindex, nofollow');
    upsertProperty('og:type','website');upsertProperty('og:site_name',SITE_NAME);upsertProperty('og:title',config.title);upsertProperty('og:description',config.description);upsertProperty('og:url',canonicalUrl);upsertProperty('og:locale','en_IN');upsertProperty('og:image',OG_IMAGE);upsertProperty('og:image:alt','PathMLT laboratory reporting software');
    upsertMeta('twitter:card','summary_large_image');upsertMeta('twitter:title',config.title);upsertMeta('twitter:description',config.description);upsertMeta('twitter:image',OG_IMAGE);upsertMeta('twitter:image:alt','PathMLT laboratory reporting software');
    upsertCanonical(canonicalUrl);
    const faqSchema=(pathname==='/'||pathname==='/faqs')?{'@type':'FAQPage',mainEntity:faqItems.slice(0,6).map(item=>({'@type':'Question',name:item.question,acceptedAnswer:{'@type':'Answer',text:item.answer}}))}:null;
    upsertJsonLd({'@context':'https://schema.org','@graph':[
      {'@type':'Organization','@id':`${SITE_URL}/#organization`,name:SITE_NAME,url:SITE_URL,email:'support@pathmlt.com',areaServed:'IN'},
      {'@type':'WebSite','@id':`${SITE_URL}/#website`,name:SITE_NAME,url:SITE_URL,publisher:{'@id':`${SITE_URL}/#organization`}},
      {'@type':'SoftwareApplication','@id':`${SITE_URL}/#software`,name:SITE_NAME,applicationCategory:'BusinessApplication',operatingSystem:'Web',description:'Laboratory reporting and management software for diagnostic and pathology laboratories.',url:SITE_URL,publisher:{'@id':`${SITE_URL}/#organization`}},
      {'@type':'WebPage','@id':`${canonicalUrl}#webpage`,name:config.title,description:config.description,url:canonicalUrl,isPartOf:{'@id':`${SITE_URL}/#website`},publisher:{'@id':`${SITE_URL}/#organization`}},
      ...(config.index&&pathname!=='/'?[{'@type':'BreadcrumbList','@id':`${canonicalUrl}#breadcrumb`,itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE_URL},{'@type':'ListItem',position:2,name:config.title.replace(/ \\| PathMLT$/,''),item:canonicalUrl}]}]:[]),
      ...(faqSchema?[faqSchema]:[])
    ]});
  },[pathname]);
  return null;
}
