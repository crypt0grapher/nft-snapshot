import { SWRResponse } from 'swr/_internal';

const isLoadingSWR = (swrResponse: SWRResponse) => swrResponse.data == null && !swrResponse.error;
export default isLoadingSWR;
