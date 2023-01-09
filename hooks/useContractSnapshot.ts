import { Contract } from '@ethersproject/contracts';
import { isAddress } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import ERC712_ABI from '../abi/erc721enumerable.abi.json';
import { hooks } from '../connectors/network';
import { contractAddressAtom } from './contractAddressAtom';
import useNFTTokenIds from './useNFTTokenIds';
import useNFTOwners from './useNFTOwners';
import useNFTTokenURIs from './useNFTTokenURIs';

export default function useContractSnapshot() {
  const tokenIds = useNFTTokenIds();
  const owners = useNFTOwners();
  const tokenURIs = useNFTTokenURIs();

  return useMemo(() => {
    if (!tokenIds?.data || !owners?.data || !tokenURIs?.data) {
      return null;
    }
    try {
      return tokenIds?.data?.map((i) => ({
        tokenId: i,
        owner: owners?.data?.[i],
        tokenURI: tokenURIs?.data?.[i],
      }));
    } catch (error) {
      return null;
    }
  }, [tokenIds, useNFTOwners, useNFTOwners]);
}
