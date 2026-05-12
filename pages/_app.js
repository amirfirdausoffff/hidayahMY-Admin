import Head from 'next/head';
import '../src/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="/hidayahicon.png" />
        <link rel="apple-touch-icon" href="/hidayahicon.png" />
        <title>HidayahMY Admin</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
