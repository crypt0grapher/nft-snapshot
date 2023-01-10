import { Contract } from '@ethersproject/contracts';
import { isAddress } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import useSWR from 'swr';
import ERC712_ABI from '../abi/erc721enumerable.abi.json';
import { hooks } from '../connectors/network';
import { contractAddressAtom } from './contractAddressAtom';
import useNFTContract from './useNFTContract';
import interfaceId from '../utils/interfaceId';

export default function useIsERC721Enumerable() {
  const contract = useNFTContract();
  return useSWR('useIsERC721Enumerable', async () => {
    if (!contract) {
      console.log('useIsERC721Enumerable !contract');
      return null;
    }
    try {
      console.log('useIsERC721Enumerable asking  Promise.all');
      // const promise = (
      //   await Promise.all(Object.values(interfaceId).map((id) => !!contract.supportsInterface(id)))
      // ).reduce((acc, curr) => acc && curr, true);
      const promise = await contract.supportsInterface(interfaceId.ERC721Enumerable);
      return !!promise;
    } catch (error) {
      console.debug(`error in useIsERC721Enumerable: ${error}`);
      return false;
    }
  });
}
