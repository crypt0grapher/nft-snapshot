import { Contract } from '@ethersproject/contracts';
import { isAddress } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import useSWRImmutable from 'swr';
import ERC712_ABI from '../abi/erc721enumerable.abi.json';
import { hooks } from '../connectors/network';
import { contractAddressAtom } from './contractAddressAtom';
import useNFTContract from './useNFTContract';
import interfaceId from '../utils/interfaceId';

export default function useIsERC721Enumerable() {
  const contract = useNFTContract();
  return useSWRImmutable('useIsERC721Enumerable', async () => {
    if (!contract) {
      return null;
    }
    try {
      console.log('useIsERC721Enumerable');
      const promise = (
        await Promise.all(
          Object.values(interfaceId).map((id) => contract.supportsInterface(id) as boolean)
        )
      ).reduce((acc, curr) => acc && curr, true);
      console.log(`reply from contract.supportsInterface: ${promise}`);
      return promise;
    } catch (error) {
      console.debug(`error in useIsERC721Enumerable: ${error}`);
      return null;
    }
  });
}
