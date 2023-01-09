import { SWRResponse } from 'swr/_internal';

const isCheckingSWR = (swrResponse: SWRResponse) =>
  swrResponse.data === 'undefined' && swrResponse.data === 'null' && !swrResponse.error;
export default isCheckingSWR;
