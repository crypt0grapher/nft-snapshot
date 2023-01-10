import { SWRResponse } from 'swr/_internal';

const isFetched = (swrResponse: SWRResponse) =>
  swrResponse.data !== undefined && swrResponse.data !== null && !swrResponse.error;
export default isFetched;
