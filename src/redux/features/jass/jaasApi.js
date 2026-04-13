import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { endMeeting } from "../../../api/meetingApi";
const baseQuery = fetchBaseQuery({
  baseUrl: `http://localhost:5555/api/jaas`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const jaasApi = createApi({
  reducerPath: "jaasApi",
  baseQuery: baseQuery,
  tagTypes: ["Jaas"],
  endpoints: (builders) => ({
    generateJaasToken: builders.mutation({
      query: (data) => ({
        url: `/generate-token`,
        method: "POST",
        body:data
      }),
    }),
  }),
});

export const {
    useGenerateJaasTokenMutation
} = jaasApi;
export default jaasApi;
