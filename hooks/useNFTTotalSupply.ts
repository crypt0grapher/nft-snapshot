import useSWR from 'swr';

import { useMemo } from 'react';
import useNFTContract from './useNFTContract';

const useNFTTotalSupply = () => {
  const tokenContract = useNFTContract();
  return useSWR('useNFTTotalSupply', async () => {
    console.log('useNFTTotalSupply');
    const ts = await tokenContract?.totalSupply();
    console.log(ts.toString());
    return ts;
  });
};

export default useNFTTotalSupply;
