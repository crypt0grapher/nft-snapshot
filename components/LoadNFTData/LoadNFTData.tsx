import { Text, Loader, ScrollArea, createStyles, Table, Button, Stack } from '@mantine/core';
import Excel from 'exceljs';
import { useEffect, useMemo, useState } from 'react';

import { saveAs } from 'file-saver';
import { useAtom } from 'jotai';
import {
  ContractCallContext,
  ContractCallResults,
  Multicall,
  MulticallOptionsEthers,
} from 'ethereum-multicall';
import { BigNumber } from 'ethers';
import { BaseProvider } from '@ethersproject/providers';
import useNFTContract from '../../hooks/useNFTContract';
import interfaceId from '../../utils/interfaceId';
import { contractAddressAtom } from '../../hooks/contractAddressAtom';
import { totalSupplyAtom } from '../../hooks/totalSupplyAtom';
import { hooks } from '../../connectors/network';
import ERC721_ABI from '../../abi/erc721enumerable.abi.json';

const { useChainId, useProvider } = hooks;
const useStyles = createStyles((theme) => ({
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',

    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

export function LoadNFTData() {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const workbook = useMemo(() => new Excel.Workbook(), []);
  const [totalSupplyValue] = useAtom(totalSupplyAtom);
  const [currentStatus, setCurrentStatus] = useState('token Ids by indexes');
  const [ready, setReady] = useState(false);
  const provider = useProvider<BaseProvider>();
  const tokenContract = useNFTContract();
  const [snapshot, setSnapshot] = useState<
    Array<{
      tokenId: string;
      owner: string;
      tokenURI: string;
    }>
  >([]);

  const columns = [
    {
      key: 'tokenId',
      header: 'Token Id',
    },
    {
      key: 'owner',
      header: 'Owner',
    },
    {
      key: 'tokenURI',
      header: 'Token URI',
    },
  ];

  const saveFile = async (fileName: string, wb: any) => {
    const xls64 = await wb.xlsx.writeBuffer({ base64: true });
    saveAs(
      new Blob([xls64], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      fileName
    );
  };

  const multicall = useMemo(() => {
    if (provider) {
      return new Multicall({
        ethersProvider: provider,
        tryAggregate: true,
      });
    }
    return null;
  }, [provider]);

  useEffect(() => {
    if (tokenContract !== null) {
      const indices = Array.from(Array(totalSupplyValue || 0).keys());
      const tokenByIndexCall = indices.map((i) => ({
        reference: `tokenByIndex(${i})`,
        methodName: 'tokenByIndex',
        methodParameters: [i],
      }));

      const contractCallContextIndex: ContractCallContext[] = [
        {
          reference: 'tokenByIndexCall',
          contractAddress: tokenContract.address,
          abi: ERC721_ABI,
          calls: tokenByIndexCall,
        },
      ];
      console.log('calling multicall tokenByIndexCall');
      multicall?.call(contractCallContextIndex).then((tokenListResults) => {
        const tokenIds = tokenListResults.results?.tokenByIndexCall?.callsReturnContext?.map(
          (record) => BigNumber.from(record.returnValues[0])
        );
        tokenIds.push(BigNumber.from(totalSupplyValue));
        indices.push(Number(totalSupplyValue));
        setCurrentStatus('token owners by token ids');
        const ownerCall = tokenIds.map((i) => ({
          reference: `ownerOf(${i})`,
          methodName: 'ownerOf',
          methodParameters: [i],
        }));

        const tokenURICall = tokenIds.map((i) => ({
          reference: `tokenURI(${i})`,
          methodName: 'tokenURI',
          methodParameters: [i],
        }));

        const contractCallContext: ContractCallContext[] = [
          {
            reference: 'owners',
            contractAddress: tokenContract.address,
            abi: ERC721_ABI,
            calls: ownerCall,
          },
          {
            reference: 'tokenURIs',
            contractAddress: tokenContract.address,
            abi: ERC721_ABI,
            calls: tokenURICall,
          },
        ];
        multicall?.call(contractCallContext).then((contractCallResults) => {
          setCurrentStatus('spreadsheet generated');
          const worksheet = workbook.addWorksheet('NFT');
          worksheet.columns = columns;
          const table = indices.map((i) => {
            const row = {
              tokenId: tokenIds[i].toString(),
              owner:
                contractCallResults.results?.owners?.callsReturnContext[i].returnValues[0] || '-',
              tokenURI:
                contractCallResults.results?.tokenURIs?.callsReturnContext[i]?.returnValues[0] ||
                '-',
            };
            worksheet.addRow(row);
            return row;
          });

          setSnapshot(table);
          setReady(true);
        });
      });
    }
  }, []);

  return (
    <>
      {!ready && (
        <>
          <Loader size={100} color="lime" />
          <Text color="dimmed" align="center" size="lg" sx={{ maxWidth: 580 }} mx="auto" mt="xl">
            Getting {currentStatus} ...
          </Text>
        </>
      )}

      {ready && (
        <>
          <Button
            variant="gradient"
            gradient={{
              from: 'green',
              to: 'lime',
            }}
            radius="xl"
            size="xl"
            styles={{
              rightIcon: { marginLeft: 22 },
            }}
            onClick={() => saveFile('nftSnapshot.xlsx', workbook)}
          >
            Download Spreadsheet
          </Button>
          <Stack>
            <Text color="dimmed" align="center" size="lg" sx={{ maxWidth: 580 }} mx="auto" mt="xl">
              Last 10 records:
            </Text>
            <ScrollArea
              sx={{
                height: 700,
                paddingBottom: 200,
              }}
              onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
            >
              <Table sx={{ minWidth: 700 }}>
                <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {snapshot?.slice(-10).map((record) => (
                    <tr key={record.tokenId}>
                      {Object.entries(record).map(([key, value]) => (
                        <td key={key}> {value ? value.toString() : '-'} </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </ScrollArea>
          </Stack>
        </>
      )}
    </>
  );
}
