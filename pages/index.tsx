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
  Paper,
  Text,
} from '@mantine/core';
import { IconCurrencyEthereum, IconArrowRight, IconArrowLeft } from '@tabler/icons';
import { useCallback, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { isAddress } from 'ethers/lib/utils';
import { atom, useAtom } from 'jotai';
import { SWRResponse } from 'swr/_internal';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';
import { hooks, network } from '../connectors/network';
import useNFTContract from '../hooks/useNFTContract';
import useNFTTotalSupply from '../hooks/useNFTTotalSupply';
import { LoadNFTData } from '../components/LoadNFTData/LoadNFTData';
import { contractAddressAtom } from '../hooks/contractAddressAtom';
import useStyles from './styles';
import useIsERC721Enumerable from '../hooks/useIsERC721Enumerable';
import isLoadingSWR from '../utils/isLoadingSWR';
import isFetched from '../utils/isFetched';

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
  const [address, setAddress] = useState('' ?? process.env.START_ADDRESS);
  const [contractAddress, setContractAddress] = useAtom(contractAddressAtom);

  const totalSupply = useNFTTotalSupply();
  const contract = useNFTContract();
  const isValidNFT = useIsERC721Enumerable();
  console.log(`JSON.stringify(isValidNFT): ${JSON.stringify(isValidNFT)}`);
  const { classes } = useStyles();

  useEffect(() => {
    void network.activate().catch(() => {
      console.debug('Failed to connect to network');
    });
  }, []);

  const onActionIconClick = useCallback(() => {
    console.log(`onActionIconClick, address ${address}`);
    isAddress(address) ? setContractAddress(address) : setContractAddress('');
  }, [address]);

  return (
    <Stack align="center" spacing="xl">
      <Welcome />
      <Badge color={isActive ? 'lime' : 'red'} size="xl" variant="dot">
        Ethereum is {isActivating ? 'connecting' : isActive ? 'connected' : 'not connected'}
      </Badge>
      <ColorSchemeToggle />
      <TextInput
        className={classes.button}
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
            disabled={!(!address || isAddress(address))}
          >
            {!isActive || (contract && (isValidNFT.isValidating || isLoadingSWR(isValidNFT))) ? (
              <Loader size={18} color={theme.white} />
            ) : (
              <IconArrowRight size={18} stroke={1.5} />
            )}
          </ActionIcon>
        }
        placeholder="NFT Smart Contract Ethereum Address"
        rightSectionWidth={62}
      />
      {contract?.address && isValidNFT.data === false && (
        <Paper withBorder p="md" radius="md">
          <Text weight={500}>The contract is not valid ERC721numerable</Text>
          <Text weight={500} color="red">
            {contractAddress}
          </Text>
        </Paper>
      )}
      {contract?.address && isValidNFT.data && (
        <>
          <Paper withBorder p="md" radius="md">
            <Stack spacing="md" align="center">
              <Text weight={500}>Valid ERC721Enumerable</Text>
              <Text weight={300} color="lime">
                {contractAddress}
              </Text>
              <Text weight={500}>Total supply:</Text>
              {totalSupply && totalSupply?.data && !totalSupply.isLoading ? (
                <Text weight={300} color="lime">
                  {' '}
                  {totalSupply.data.toString()}
                </Text>
              ) : (
                <Loader size={18} color={theme.white} />
              )}
            </Stack>
          </Paper>
          {parseInt(totalSupply.data, 10) > 0 && <LoadNFTData />}
        </>
      )}
    </Stack>
  );
}
