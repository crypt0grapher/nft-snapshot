import useSWRImmutable from 'swr';
import { Multicall, ContractCallResults, ContractCallContext } from 'ethereum-multicall';
import { useMemo } from 'react';
import useNFTContract from './useNFTContract';
import ERC712_ABI from '../abi/erc721enumerable.abi.json';
import { hooks } from '../connectors/network';
import useNFTTotalSupply from './useNFTTotalSupply';

const { useChainId, useProvider } = hooks;
const useContractSnapshot = () => {
  const tokenContract = useNFTContract();
  const provider = useProvider();
  const chainId = useChainId();
  const totalSupply = useNFTTotalSupply();
  const multicall = useMemo(
    () =>
      new Multicall({
        ethersProvider: provider,
        tryAggregate: true,
      }),
    [provider]
  );

  const ownerCall = useMemo(
    () =>
      Array.from(Array(3).keys()).map((i) => ({
        reference: `ownerOf(${i + 1})`,
        methodName: 'ownerOf',
        methodParameters: [i + 1],
      })),
    [tokenContract, totalSupply]
  );

  const tokenURICall = useMemo(
    () =>
      Array.from(Array(3).keys()).map((i) => ({
        reference: `tokenURI(${i + 1})`,
        methodName: 'tokenURI',
        methodParameters: [i + 1],
      })),
    [tokenContract, totalSupply]
  );

  return useSWRImmutable('useContractSnapshot', async () => {
    if (!tokenContract || !multicall || !totalSupply) {
      return null;
    }
    console.log('useContractSnapshot');
    // const getOwnersCall = Array.from(Array(totalSupply.data?.toNumber() || 0).keys()).map((i) => ({

    const contractCallContext: ContractCallContext[] = [
      {
        reference: 'owners',
        contractAddress: tokenContract.address,
        abi: ERC712_ABI,
        calls: ownerCall,
      },
      {
        reference: 'tokenURIs',
        contractAddress: tokenContract.address,
        abi: ERC712_ABI,
        calls: tokenURICall,
      },
    ];
    const results: ContractCallResults = await multicall.call(contractCallContext);
    console.log(results);

    return results;
  });
};

export default useContractSnapshot;
