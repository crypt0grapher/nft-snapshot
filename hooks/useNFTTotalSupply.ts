import useSWRImmutable from 'swr';

import { useMemo } from 'react';
import useNFTContract from './useNFTContract';

const useNFTTotalSupply = () => {
  const tokenContract = useNFTContract();
  return useSWRImmutable(
    'useNFTTotalSupply',
    async () => {
      console.log('useNFTTotalSupply');
      const ts = await tokenContract?.totalSupply();
      return ts;
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    }
  );
};

export default useNFTTotalSupply;
