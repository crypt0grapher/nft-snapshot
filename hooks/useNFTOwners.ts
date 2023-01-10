import useSWR from 'swr';
import { Multicall, ContractCallResults, ContractCallContext } from 'ethereum-multicall';
import { useMemo } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import useNFTContract from './useNFTContract';
import ERC712_ABI from '../abi/erc721enumerable.abi.json';
import { hooks } from '../connectors/network';
import useNFTTotalSupply from './useNFTTotalSupply';
import useNFTTokenIds from './useNFTTokenIds';

const { useChainId, useProvider } = hooks;
const useNFTOwners = () => {
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

  const ownerCall = useMemo(
    () =>
      tokenIds?.data?.map((i) => ({
        reference: `ownerOf(${i})`,
        methodName: 'ownerOf',
        methodParameters: [i],
      })),
    [tokenContract, tokenIds]
  );

  return useSWR('useNFTOwners', async () => {
    if (!tokenContract || !multicall || !totalSupply || !tokenIds || !ownerCall) {
      return null;
    }
    const contractCallContext: ContractCallContext[] = [
      {
        reference: 'owners',
        contractAddress: tokenContract.address,
        abi: ERC712_ABI,
        calls: ownerCall,
      },
    ];
    const results: ContractCallResults = await multicall.call(contractCallContext);
    const owners = results.results?.owners?.callsReturnContext?.map(
      (record) => record.returnValues[0]
    );
    console.log(`owners: ${owners.length}: ${owners}`);
    return owners;
  });
};

export default useNFTOwners;
