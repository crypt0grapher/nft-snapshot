import useSWR from 'swr';
import { Multicall, ContractCallResults, ContractCallContext } from 'ethereum-multicall';
import { useMemo } from 'react';
import useNFTContract from './useNFTContract';
import ERC721_ABI from '../abi/erc721enumerable.abi.json';
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

  return useSWR('useNFTTokenIds', async () => {
    if (!tokenContract || !multicall || !totalSupply) {
      return null;
    }
    const contractCallContext: ContractCallContext[] = [
      {
        reference: 'tokenByIndexCall',
        contractAddress: tokenContract.address,
        abi: ERC721_ABI,
        calls: tokenByIndexCall,
      },
    ];
    console.log('calling multicall tokenByIndexCall');
    const results: ContractCallResults = await multicall.call(contractCallContext);
    console.log('finished, ', results);
    const tokenIds = results.results?.tokenByIndexCall?.callsReturnContext?.map((record) =>
      Number(record.returnValues[0])
    );

    // return [0, 1, 2, 3];
    console.log(`tokenIds: ${tokenIds}`);

    return tokenIds;
  });
};

export default useNFTTokenIds;
