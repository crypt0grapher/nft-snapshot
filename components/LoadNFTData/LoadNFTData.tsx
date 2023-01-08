import { Text, Loader, ScrollArea, createStyles, Table, Button } from '@mantine/core';
import Excel from 'exceljs';
import { useMemo, useState } from 'react';

import { saveAs } from 'file-saver';
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
  const workbook = new Excel.Workbook();
  const snapshot = useContractSnapshot();

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

  const table = useMemo(() => {
    const worksheet = workbook.addWorksheet('NFT');
    worksheet.columns = columns;
    const temp = snapshot?.data?.results?.owners?.callsReturnContext?.map((record) => {
      const data = {
        tokenId: record.methodParameters[0],
        owner: record.returnValues[0],
        tokenURI:
          snapshot?.data?.results?.tokenURIs?.callsReturnContext[record.methodParameters[0] - 1]
            .returnValues[0],
      };
      worksheet.addRow(data);
      return data;
    });
    return temp;
  }, [snapshot]);

  return (
    <>
      {!table && <Loader size={100} color="lime" />}
      <Text color="dimmed" align="center" size="lg" sx={{ maxWidth: 580 }} mx="auto" mt="xl">
        {!snapshot?.data ? 'Loading NFT data...' : 'NF data loaded'}
      </Text>
      {!!snapshot?.data && (
        <>
          <Button
            variant="light"
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
        </>
      )}
    </>
  );
}
