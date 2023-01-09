import { createStyles } from '@mantine/core';

export default createStyles((theme) => ({
  button: {
    width: 600,
    [theme.fn.smallerThan('md')]: {
      width: '70%',
    },
  },
}));
