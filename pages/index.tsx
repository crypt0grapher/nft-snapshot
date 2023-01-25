import {
  ActionIcon,
  Badge,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { IconArrowRight, IconCurrencyEthereum } from '@tabler/icons';
import { isAddress } from 'ethers/lib/utils';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';

import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Footer } from '../components/Footer/Footer';
import { LoadNFTData } from '../components/LoadNFTData/LoadNFTData';
import { Welcome } from '../components/Welcome/Welcome';
import { hooks, network } from '../connectors/network';
import { contractAddressAtom } from '../hooks/contractAddressAtom';
import { totalSupplyAtom } from '../hooks/totalSupplyAtom';
import useNFTContract from '../hooks/useNFTContract';
import interfaceId from '../utils/interfaceId';
import useStyles from './styles';

const { useIsActivating, useIsActive, useProvider } = hooks;

export default function HomePage() {
  const theme = useMantineTheme();
  const isActivating = useIsActivating();

  const isActive = useIsActive();

  const provider = useProvider();
  const [error, setError] = useState('');
  const [address, setAddress] = useState('' ?? process.env.NEXT_PUBLIC_START_ADDRESS);
  const [_contractAddress, setContractAddress] = useAtom(contractAddressAtom);
  const [totalSupplyValue, setTotalSupplyValue] = useAtom(totalSupplyAtom);
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const tokenContract = useNFTContract();
  useEffect(() => {
    tokenContract
      ?.supportsInterface(interfaceId.ERC721Enumerable)
      .then((isEnumerable: any) => {
        setValid(!!isEnumerable);
        if (!isEnumerable) {
          setError('Contract does not support ERC721Enumerable');
        }
        tokenContract
          .totalSupply()
          .then((ts: any) => {
            setTotalSupplyValue(ts.toNumber());
            setLoading(false);
          })
          .catch((e: any) => {
            setError(e.message);
            setLoading(false);
          });
      })
      .catch((e: any) => {
        setError(e.message);
        setLoading(false);
      });
  }, [tokenContract]);

  const { classes } = useStyles();
  console.log(provider?.connection?.url);

  useEffect(() => {
    network.activate().catch(() => {
      console.error('Failed to connect to network');
    });
  }, [network]);

  const onActionIconClick = useCallback(() => {
    isAddress(address) ? setContractAddress(address) : setContractAddress('');
    setLoading(true);
  }, [address]);

  return (
    <>
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
              {!isActive || loading ? (
                <Loader size={18} color={theme.white} />
              ) : (
                <IconArrowRight size={18} stroke={1.5} />
              )}
            </ActionIcon>
          }
          placeholder="NFT Smart Contract Ethereum Address"
          rightSectionWidth={62}
        />
        {tokenContract && !valid && error && (
          <Paper withBorder p="md" radius="md">
            <Text weight={500}>The contract is not valid ERC721numerable</Text>
            <Text weight={500} color="red">
              {tokenContract?.address}
            </Text>
          </Paper>
        )}
        {tokenContract && valid && !error && totalSupplyValue && (
          <>
            <Paper withBorder p="md" radius="md">
              <Stack spacing="md" align="center">
                <Text weight={500}>Valid ERC721Enumerable</Text>
                <Text weight={300} color="lime">
                  {tokenContract?.address}
                </Text>
                <Text weight={500}>Total supply:</Text>
                <Text weight={300} color="lime">
                  {totalSupplyValue}
                </Text>
              </Stack>
            </Paper>
            <LoadNFTData />
          </>
        )}
      </Stack>
      <Footer />
    </>
  );
}
