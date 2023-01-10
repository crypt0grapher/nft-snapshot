import { Contract } from '@ethersproject/contracts';
import { isAddress } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import ERC712_ABI from '../abi/erc721enumerable.abi.json';
import { hooks } from '../connectors/network';
import { contractAddressAtom } from './contractAddressAtom';

const { useChainId, useProvider } = hooks;
export default function useNFTContract<T extends Contract = Contract>(ABI = ERC712_ABI): T | null {
  const [address] = useAtom(contractAddressAtom);
  const provider = useProvider();
  const chainId = useChainId();
  return useMemo(() => {
    if (!address || !ABI || !isAddress(address) || !provider || !chainId) {
      console.log('useNFTContract null');
      return null;
    }
    try {
      console.log('useNFTContract contract ok');
      return new Contract(address, ABI, provider);
    } catch (error) {
      return null;
    }
  }, [address, ABI, provider]) as T;
}
