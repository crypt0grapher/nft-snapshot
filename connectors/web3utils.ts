import type { BigNumberish } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

export function shortenHex(hex: string, length = 4) {
  return `${hex.substring(0, length + 2)}…${hex.substring(hex.length - length)}`;
}

const SCAN_PREFIXES: Record<number, string> = {
  1: '',
};

export function formatEtherscanLink(type: 'Account' | 'Transaction', data: [number, string]) {
  switch (type) {
    case 'Account': {
      const [chainId, address] = data;
      return `https://${SCAN_PREFIXES[chainId]}etherscan.io/address/${address}`;
    }
    case 'Transaction': {
      const [chainId, hash] = data;
      return `https://${SCAN_PREFIXES[chainId]}etherscan.io/tx/${hash}`;
    }
  }
}

export const parseBalance = (
  value: BigNumberish | null | undefined,
  decimals = 18,
  decimalsToDisplay = 0
) => (value ? parseFloat(formatUnits(value, decimals)).toFixed(decimalsToDisplay) : null);
