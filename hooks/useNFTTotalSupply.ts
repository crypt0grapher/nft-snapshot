import useSWRImmutable from 'swr';

import useNFTContract from './useNFTContract';

const useNFTTotalSupply = () => {
  const tokenContract = useNFTContract();
  return useSWRImmutable('useNFTTotalSupply', async () => {
    console.log('useNFTTotalSupply');
    const ts = await tokenContract?.totalSupply();
    console.log(ts.toString());
    return ts;
  });
};

export default useNFTTotalSupply;
