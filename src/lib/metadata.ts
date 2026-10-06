import { siteConfig } from '../config/site';

export interface PageMetadataInput {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  noindex?: boolean;
}

export interface PageMetadata extends PageMetadataInput {
  canonical: string;
  socialTitle: string;
  image: string;
}

export function buildPageMetadata(input: PageMetadataInput): PageMetadata {
  const pathname = input.pathname === '/' ? '/' : `/${input.pathname.replace(/^\/+|\/+$/g, '')}/`;
  const canonical = new URL(pathname, siteConfig.domain).toString();

  return {
    ...input,
    pathname,
    canonical,
    socialTitle: `${input.title} — ${siteConfig.name}`,
    image: input.image ?? '/images/social-card.png',
  };
}
