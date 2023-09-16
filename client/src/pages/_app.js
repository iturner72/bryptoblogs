import '@/styles/globals.css'
import { DefaultSeo } from 'next-seo'
import Head from 'next/head'
import Script from 'next/script'

const defaultSEO = {
  title: 'bryptoblogs',
  description:
    'learn from your favorite tech companies',
  openGraph: {
    type: 'website',
    url: 'https://www.bryptoblogs.dev',
    site_name: 'bryptoblogs',
    images: [
      {
        url: 'https://www.engblogs.dev/static/thumbnail.png',
        alt: 'bryptoblogs.dev homepage',
      },
    ],
  },
};

export default function App({ Component, pageProps }) {
  return (
    <>
      <DefaultSeo {...defaultSEO} />
      <Component {...pageProps} />

      <Head>
        <title>bryptoblogs</title>
        <link rel="icon" href="/static/favicon.png" />
      </Head>

      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={"https://www.googletagmanager.com/gtag/js?id=G-V596PGDDBE"}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-V596PGDDBE', {
                page_path: window.location.pathname,
              });
            `,
        }}
      />
    </>
  );
}
