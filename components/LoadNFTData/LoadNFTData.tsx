import { Text, Loader, ScrollArea, createStyles, Table, Button } from '@mantine/core';
import Excel from 'exceljs';
import { useEffect, useMemo, useState } from 'react';

import { saveAs } from 'file-saver';
import useContractSnapshot from '../../hooks/useContractSnapshot';
import useNFTTokenIds from '../../hooks/useNFTTokenIds';
import useNFTOwners from '../../hooks/useNFTOwners';
import useNFTTokenURIs from '../../hooks/useNFTTokenURIs';

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
  const workbook = new Excel.Workbook();
  const snapshot = useContractSnapshot();

  const tokenIds = useNFTTokenIds();
  const owners = useNFTOwners();
  const tokenURIs = useNFTTokenURIs();

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

  const saveFile = async (fileName: string, workbook: any) => {
    const xls64 = await workbook.xlsx.writeBuffer({ base64: true });
    saveAs(
      new Blob([xls64], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      fileName
    );
  };

  const worksheet = useMemo(() => {
    if (snapshot) {
      const ws = workbook.addWorksheet('NFT');
      ws.columns = columns;
      ws.addRows(snapshot);
      return ws;
    }
    return null;
  }, [snapshot]);

  return (
    <>
      {!snapshot && <Loader size={100} color="lime" />}
      <Text color="dimmed" align="center" size="lg" sx={{ maxWidth: 580 }} mx="auto" mt="xl">
        {!tokenIds && 'Loading NFT tokenIds...'}
        {!owners && 'Querieng NFT owners...'}
        {!tokenURIs && 'Reading NFT attribute URLs...'}
        {!!tokenIds && !!owners && !!tokenURIs && !snapshot && 'Getting NFT data...'}
      </Text>

      {!!snapshot && (
        <>
          <Button
            variant="gradient"
            color="green"
            radius="xl"
            size="xl"
            styles={{
              rightIcon: { marginLeft: 22 },
            }}
            onClick={() => saveFile('nftSnapshot.xlsx', workbook)}
          >
            Download Spreadsheet
          </Button>
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
                {snapshot?.slice(50).map((record) => (
                  <tr key={record.tokenId}>
                    {Object.entries(record).map(([key, value]) => (
                      <td key={key}> {value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </>
      )}
    </>
  );
}
