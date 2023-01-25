import { ActionIcon, Container, createStyles, Group, Text } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { IconBrandGithub } from '@tabler/icons';

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: 220,
    borderTop: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,

    [theme.fn.smallerThan('xs')]: {
      flexDirection: 'column',
    },
  },

  links: {
    [theme.fn.smallerThan('xs')]: {
      marginTop: theme.spacing.md,
    },
  },
}));

export function Footer() {
  const { classes } = useStyles();

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Group spacing={0} className={classes.links} position="center" noWrap>
          <Text>Made by crypt0grapher</Text>
          <NextLink href="https://github.com/crypt0grapher/nft-snapshot" color="inherit">
            <ActionIcon size="lg">
              <IconBrandGithub size={18} stroke={1.5} />
            </ActionIcon>
          </NextLink>
        </Group>
      </Container>
    </div>
  );
}
