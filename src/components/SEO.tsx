import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalPath?: string;
  jsonLd?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
  canonicalPath,
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title.includes('Purushottam') ? title : `${title} | Purushottam Holiday Homestay`;
    document.title = formattedTitle;

    // 2. Update Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 3. Update Keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // 4. Update Open Graph Tags
    const updateOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOgTag('og:title', formattedTitle);
    updateOgTag('og:description', description);
    updateOgTag('og:image', ogImage);
    updateOgTag('og:url', window.location.href);
    updateOgTag('og:type', 'website');

    // 5. Update Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const origin = window.location.origin;
    const path = canonicalPath || window.location.pathname;
    canonical.setAttribute('href', `${origin}${path}`);

    // 6. Inject JSON-LD Schema Markup
    const scriptId = 'seo-json-ld';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }

    // Cleanup when component unmounts or variables change
    return () => {
      const oldScript = document.getElementById(scriptId);
      if (oldScript) oldScript.remove();
    };
  }, [title, description, keywords, ogImage, canonicalPath, jsonLd]);

  return null;
};

export default SEO;
