'use client';

import { useEffect, useRef } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

type SiteSettings = {
  site_name?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  favicon_url?: string | null;
  icon_url?: string | null;
  og_image_url?: string | null;
};

function applySettings(data: SiteSettings) {
  const title = data.meta_title || data.site_name || 'We4U';
  if (typeof document !== 'undefined') {
    document.title = title;
  }

  const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  if (data.meta_description) setMeta('description', data.meta_description);
  if (data.meta_keywords) setMeta('keywords', data.meta_keywords);
  if (data.og_image_url) setMeta('og:image', data.og_image_url, 'property');
  if (data.meta_title) {
    setMeta('og:title', data.meta_title, 'property');
    setMeta('twitter:title', data.meta_title);
  }
  if (data.meta_description) setMeta('og:description', data.meta_description, 'property');

  const setLink = (rel: string, href: string, attrs: Record<string, string> = {}) => {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
  };

  const faviconUrl = data.favicon_url?.trim() || null;
  const iconUrl = (data.icon_url?.trim() || faviconUrl) || null;

  if (faviconUrl) {
    const isIco = faviconUrl.toLowerCase().endsWith('.ico');
    setLink('icon', faviconUrl, { type: isIco ? 'image/x-icon' : 'image/png' });
    setLink('shortcut icon', faviconUrl, { type: isIco ? 'image/x-icon' : 'image/png' });
  }
  if (iconUrl) {
    setLink('apple-touch-icon', iconUrl, { sizes: '180x180' });
  }
}

export function DynamicSiteHead() {
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    fetch(`${API_BASE}/site-settings`, {
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((json) => {
        const data = json?.data ?? json;
        if (data && typeof data === 'object') {
          applySettings(data as SiteSettings);
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
