import useSWRImmutable from 'swr';
import { Multicall, ContractCallResults, ContractCallContext } from 'ethereum-multicall';
import { useMemo } from 'react';
import useNFTContract from './useNFTContract';
import ERC712_ABI from '../abi/erc721enumerable.abi.json';
import { hooks } from '../connectors/network';
import useNFTTotalSupply from './useNFTTotalSupply';

const { useChainId, useProvider } = hooks;
const useNFTTokenIds = () => {
  const tokenContract = useNFTContract();
  const provider = useProvider();
  const chainId = useChainId();
  const totalSupply = useNFTTotalSupply();

  const multicall = useMemo(
    () =>
      new Multicall({
        // @ts-ignore
        ethersProvider: provider,
        tryAggregate: true,
      }),
    [provider]
  );

  const tokenByIndexCall = useMemo(
    () =>
      Array.from(Array(totalSupply.data?.toNumber() || 0).keys()).map((i) => ({
        reference: `tokenByIndex(${i})`,
        methodName: 'tokenByIndex',
        methodParameters: [i],
      })),
    [tokenContract, totalSupply]
  );

  return useSWRImmutable(
    'useNFTTokenIds',
    async () => {
      if (!tokenContract || !multicall || !totalSupply) {
        return null;
      }
      const contractCallContext: ContractCallContext[] = [
        {
          reference: 'tokenByIndexCall',
          contractAddress: tokenContract.address,
          abi: ERC712_ABI,
          calls: tokenByIndexCall,
        },
      ];
      const results: ContractCallResults = await multicall.call(contractCallContext);

      const tokenIds = results.results?.tokenByIndexCall?.callsReturnContext?.map((record) =>
        parseInt(record.returnValues[0], 10)
      );

      // return [0, 1, 2, 3];
      return tokenIds;
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

export default useNFTTokenIds;
