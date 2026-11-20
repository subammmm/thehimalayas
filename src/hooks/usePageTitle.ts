import { useEffect } from 'react';

const SITE_NAME = 'The Himalayas';
const SITE_URL = 'https://thehimalayas.vercel.app';

// Sets the tab title and the canonical link for the current page.
export function usePageTitle(title?: string) {
    useEffect(() => {
        document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME}: a digital atlas of Khasa Malla historical sites`;
        document.querySelector('link[rel="canonical"]')?.setAttribute('href', SITE_URL + window.location.pathname);
    }, [title]);
}
