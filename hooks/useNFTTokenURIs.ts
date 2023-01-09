import useSWRImmutable from 'swr';
import { Multicall, ContractCallResults, ContractCallContext } from 'ethereum-multicall';
import { useMemo } from 'react';
import useNFTContract from './useNFTContract';
import ERC712_ABI from '../abi/erc721enumerable.abi.json';
import { hooks } from '../connectors/network';
import useNFTTotalSupply from './useNFTTotalSupply';
import useNFTTokenIds from './useNFTTokenIds';

const { useChainId, useProvider } = hooks;
const useContractSnapshot = () => {
  const tokenContract = useNFTContract();
  const provider = useProvider();
  const totalSupply = useNFTTotalSupply();
  const tokenIds = useNFTTokenIds();

  const multicall = useMemo(
    () =>
      new Multicall({
        // @ts-ignore
        ethersProvider: provider,
        tryAggregate: true,
      }),
    [provider]
  );

  const tokenURICall = useMemo(
    () =>
      tokenIds?.data?.map((i) => ({
        reference: `tokenURI(${i})`,
        methodName: 'tokenURI',
        methodParameters: [i],
      })),
    [tokenContract, totalSupply]
  );

  return useSWRImmutable('useContractSnapshot', async () => {
    if (!tokenContract || !multicall || !totalSupply || !tokenURICall) {
      return null;
    }
    const contractCallContext: ContractCallContext[] = [
      {
        reference: 'tokenURIs',
        contractAddress: tokenContract.address,
        abi: ERC712_ABI,
        calls: tokenURICall,
      },
    ];
    const results: ContractCallResults = await multicall.call(contractCallContext);
    return results.results?.tokenURIs?.callsReturnContext?.map((record) => record.returnValues[0]);
  });
};

export default useContractSnapshot;
