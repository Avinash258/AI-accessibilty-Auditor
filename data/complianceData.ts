
export interface ComplianceStandard {
  name: string;
  description: string;
  url: string;
  principles: {
    title: string;
    summary: string;
  }[];
}

export const complianceData: { [key: string]: ComplianceStandard } = {
  'WCAG 2.1 AA': {
    name: 'Web Content Accessibility Guidelines (WCAG) 2.1 AA',
    description: 'An international standard for web accessibility, providing a wide range of recommendations for making web content more accessible. It is organized around four main principles (POUR).',
    url: 'https://www.w3.org/TR/WCAG21/',
    principles: [
      { title: 'Perceivable', summary: 'Information and user interface components must be presentable to users in ways they can perceive, such as providing text alternatives for non-text content.' },
      { title: 'Operable', summary: 'User interface components and navigation must be operable. This includes making all functionality available from a keyboard.' },
      { title: 'Understandable', summary: 'Information and the operation of user interface must be understandable. Text should be readable and predictable.' },
      { title: 'Robust', summary: 'Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies.' }
    ]
  },
  'ADA': {
    name: 'Americans with Disabilities Act (ADA)',
    description: 'A US civil rights law that prohibits discrimination against individuals with disabilities in all areas of public life. For websites, it is often interpreted to require conformance with WCAG standards.',
    url: 'https://www.ada.gov/',
    principles: [
        { title: 'Effective Communication', summary: 'Websites must provide aids and services to communicate effectively with people with disabilities, such as screen readers or captions.' },
        { title: 'Equal Opportunity', summary: 'Individuals with disabilities must have an equal opportunity to access and use the goods and services offered online.' },
        { title: 'Architectural and Communication Barriers', summary: 'The ADA requires the removal of barriers that prevent access. In the digital world, this applies to code and design.' },
        { title: 'WCAG Conformance', summary: 'While not explicitly stated in the law, courts and the Department of Justice often refer to WCAG as the standard for digital accessibility.' }
    ]
  },
  'Section 508': {
    name: 'Section 508 of the Rehabilitation Act',
    description: 'Requires US federal agencies to make their electronic and information technology (EIT) accessible to people with disabilities. It incorporates WCAG 2.0 AA by reference.',
    url: 'https://www.section508.gov/',
    principles: [
        { title: 'Software and Applications', summary: 'Includes requirements for interoperability with assistive technology, ensuring screen readers and other tools can function correctly.' },
        { title: 'Web-based Information', summary: 'Requires conformance to WCAG 2.0 AA success criteria for all web content, including websites, PDFs, and web applications.' },
        { title: 'Functional Performance Criteria', summary: 'Applies when specific technical requirements do not address all accessibility needs, focusing on the functional capabilities of users.' },
        { title: 'Support Documentation', summary: 'Requires that all product support documentation and services be accessible to people with disabilities.' }
    ]
  },
  'EAA': {
    name: 'European Accessibility Act (EAA)',
    description: 'An EU directive aimed at harmonizing accessibility requirements for products and services across Europe. It covers websites, mobile services, e-commerce, and more.',
    url: 'https://ec.europa.eu/social/main.jsp?catId=1202&langId=en',
    principles: [
        { title: 'Information and User Interface', summary: 'Requires information to be perceivable, operable, understandable, and robust, which directly aligns with the WCAG principles.' },
        { title: 'E-commerce Services', summary: 'Ensures accessibility of online shopping websites and applications from browsing product information to completing the checkout process.' },
        { title: 'Consumer Banking Services', summary: 'Requires online banking portals and mobile apps to be accessible.' },
        { title: 'Support Services', summary: 'Requires help desks, call centers, and other support services to be accessible through multiple communication channels.' }
    ]
  }
};
