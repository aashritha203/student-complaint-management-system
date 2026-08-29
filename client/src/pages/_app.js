import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  // Set auth pages to bypass Layout frame
  const isAuthPage = router.pathname === '/login' || router.pathname === '/register';

  if (isAuthPage) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
