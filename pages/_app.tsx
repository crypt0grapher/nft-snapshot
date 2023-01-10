import { useState } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import { getCookie, setCookie } from 'cookies-next';
import Head from 'next/head';
import { MantineProvider, ColorScheme, ColorSchemeProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import useSWR, { SWRConfig } from 'swr';

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
  };

  return (
    <>
      <Head>
        <title>NFT Snapshot</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>

      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
          <NotificationsProvider>
            <SWRConfig
              value={{
                // revalidateOnFocus: false,
                // revalidateOnMount: false,
                // revalidateOnReconnect: false,
                // refreshWhenOffline: false,
                // refreshWhenHidden: false,
                // refreshInterval: 0,
                shouldRetryOnError: true,
                // compare: (a, b) => a === b,
                revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false,
                errorRetryInterval: 1000,
                errorRetryCount: 3,
                revalidateOnMount: true, // If false, undefined data gets cached against the key.
                dedupingInterval: 3_600_000, // dont duplicate a request w/ same key for 1hr
              }}
            >
              <Component {...pageProps} />
            </SWRConfig>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie('mantine-color-scheme', appContext.ctx) || 'dark',
  };
};
