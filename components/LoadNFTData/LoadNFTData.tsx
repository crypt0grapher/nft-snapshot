import { Text, Loader, ScrollArea, createStyles, Table } from '@mantine/core';
import Excel from 'exceljs';
import { useCallback, useMemo, useState } from 'react';
import useContractSnapshot from '../../hooks/useContractSnapshot';

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
  const snapshot = useContractSnapshot();

  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('NFT');
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
    {
      key: 'value',
      header: 'Attribue Value',
    },
  ];

  const table = useMemo(
    () =>
      snapshot?.data?.results?.owners?.callsReturnContext?.map((record) => {
        const data = {
          tokenId: record.methodParameters[0],
          owner: record.returnValues[0],
          tokenURI:
            snapshot?.data?.results?.tokenURIs?.callsReturnContext[record.methodParameters[0] - 1]
              .returnValues[0],
        };
        worksheet.addRow(data);
        return data;
      }),
    [snapshot]
  );

  return (
    <>
      {!table && <Loader size={100} color="lime" />}
      <Text color="dimmed" align="center" size="lg" sx={{ maxWidth: 580 }} mx="auto" mt="xl">
        {!snapshot?.data ? 'Loading NFT data...' : 'NF data loaded'}
      </Text>
      {!!snapshot?.data && (
        <ScrollArea sx={{ height: 300 }} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
          <Table sx={{ minWidth: 700 }}>
            <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table?.map((record) => (
                <tr key={record.tokenId}>
                  {Object.entries(record).map(([key, value]) => (
                    <td key={key}> {value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      )}
    </>
  );
}
