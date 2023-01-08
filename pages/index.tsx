import {
  Input,
  Button,
  Group,
  Badge,
  TextInput,
  TextInputProps,
  ActionIcon,
  useMantineTheme,
  Stack,
  Loader,
} from '@mantine/core';
import { IconCurrencyEthereum, IconArrowRight, IconArrowLeft } from '@tabler/icons';
import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { isAddress } from 'ethers/lib/utils';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';
import { hooks, network } from '../connectors/network';

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks;

export default function HomePage() {
  const theme = useMantineTheme();
  const chainId = useChainId();
  const accounts = useAccounts();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const ENSNames = useENSNames(provider);
  const [error, setError] = useState(undefined);
  const [address, setAddress] = useState('');
  const [contractDetails, setContractDetails] = useState({
    contractAddress: '',
    totalSupply: -1,
    owners: -1,
  });
  const [gettingContractDetails, setGettingContractDetails] = useState(undefined);

  const [fetchingTokens, setfetchingTokens] = useState(undefined);

  useEffect(() => {
    void network.activate().catch(() => {
      console.debug('Failed to connect to network');
    });
  }, []);

  const onActionIconClick = useCallback(() => {
    setGettingContractDetails(true);
  }, []);
  return (
    <Stack align="center" spacing="xl">
      <Welcome />
      <Badge color={isActive ? 'lime' : 'red'} size="xl" variant="dot">
        Ethereum is {isActivating ? 'connecting' : isActive ? 'connected' : 'not connected'}
      </Badge>
      <ColorSchemeToggle />
      <TextInput
        style={{ minWidth: '600px' }}
        maxLength={'0x746a94728a7188b6218e640e15290bacb1c4d56a'.length}
        icon={<IconCurrencyEthereum size={18} stroke={1.5} />}
        radius="xl"
        size="xl"
        value={address}
        onChange={(event) => setAddress(event.currentTarget.value)}
        error={!address || isAddress(address) ? undefined : 'Invalid address'}
        rightSection={
          <ActionIcon
            size={32}
            radius="xl"
            color="lime"
            variant="filled"
            onClick={onActionIconClick}
          >
            {isActive && !gettingContractDetails ? (
              <IconArrowRight size={18} stroke={1.5} />
            ) : (
              <Loader size={18} color={theme.white} />
            )}
          </ActionIcon>
        }
        placeholder="NFT Smart Contract Ethereum Address"
        rightSectionWidth={62}
      />
      <Group position="center" />
    </Stack>
  );
}
